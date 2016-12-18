//SocketDatabase.cpp

#include "StdAfx.h"
#include "SocketDatabase.h"
#include "Exception.h"
#include "GetLastErrorString.h"
#include "..\Common\GlobalCommands.h"
#include "Regexp.h"
#include "Version.h"//for GetModuleVersion2()
#include <assert.h>
#include "WWW\Handler.h"
//#include "resource.h"
#include "..\VCUE\resource1.h"

//////////////////////////////////////////////////////////////////////
// Enable debug memory manager
#ifdef _DEBUG
#ifdef THIS_FILE
#undef THIS_FILE
#endif //THIS_FILE
static const char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif //_DEBUG

/*
//for debug purpose
#ifdef _X86_
#ifdef _DEBUG
#include "StackDumper/StackDumper.h"
//#include "util_rf.h"
#endif //_DEBUG
#endif //_X86_
*/
CSocketDatabase::CSocketDatabase(//LPCTSTR lpszHostAddress, 
																 CHandler* pHandler)
	:CSocketTelnet(
#ifdef _DEBUG
		FALSE//boAssert
#endif
								 )
//	, m_strHostAddress(lpszHostAddress)
	, m_hEventStatus(NULL)
	, m_pHandler(pHandler)
{
//ATLTRACE("CSocketDatabase::CSocketDatabase(void) this = 0x%x\n", this);
	m_hEventStatus = ::CreateEvent(NULL, TRUE, TRUE, NULL);
	ATLVERIFY(::ResetEvent(m_hEventStatus));
}

CSocketDatabase::~CSocketDatabase(void)
{
//ATLTRACE("--- CSocketDatabase::~CSocketDatabase() enter. this = 0x%x---\n", this);
//	SetEventDisconnectDatabase();
	CSocketBlocking::WaitForCloseThread();
	ATLASSERT(m_hEventStatus);
	ATLVERIFY(::CloseHandle(m_hEventStatus));
	m_hEventStatus = NULL;
//ATLTRACE("--- CSocketDatabase::~CSocketDatabase() exit. this = 0x%x---\n", this);
}

bool CSocketDatabase::ConnectToWebDatabaseService(bool boStart)
{
	CString strError;
	try
	{
		LPCTSTR lpszHostAddress = "localhost";

		UINT nHostPort = VCUE::CConfig::CSite::GetDatabaseWebFaxPort();
		WSAStart();

		//Create destination socket
		Create();
		CSockAddr saServer(INADDR_ANY, 0);
		Bind(saServer);
		switch(Connect(lpszHostAddress, nHostPort, false))
		{
		default:
			{
				Cleanup();
				CString strError;
				strError.Format("Connect to webdatabase service failed! "
					+ CSocketBlocking::GetError());
				//Не могу добавить этот кусок потому что тогда строка не отбражается в браузере не понятно почему
				// Скорее всего из за одинарных кавычек
				// + " lpszHostAddress: '%s', nHostPort = %d", lpszHostAddress, nHostPort);
				CSocketBlocking::SetError(strError);
//				return false;
				break;
			}
		case 0:
			if(boStart)
				CSocketBlocking::Start();
			break;
		}
		strError = CSocketBlocking::GetError();
	}
	catch(CException* e)
	{
		strError = e->GetErrorMessage();
		delete e;
	}
	catch(...)
	{
		strError = CString("Unhandled exception!!!");
	}
	if(strError.IsEmpty())
	{
//		SetStatus(m_strStatus);
//		WaitStatus();
	}
	else
	{
		strError = "CSocketDatabase::ConnectToWebDatabaseService() failed! " + strError;// + m_strDatabaseError;
		strError.Replace("\r", " ");
		strError.Replace("\n", " ");
		EmailMe(strError);
		return false;
	}
	return true;
}

bool CSocketDatabase::ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent)
{
	CString strResponse = lpszResponse;
	if(strResponse == _T("\r\n"))
		return true;//Ignore empty lines
	CString strError;
	try
	{
		CString strContent = lpszContent;
		CString strCommand;
		switch(nResponseID)
		{
		case 1://g_lpszSend1;//"1 %s version %s ready\r\n";
			{
				CString strExp = g_lpszSend1;
				strExp.Replace("%s", "(.*)");
				Regexp Re(strExp, TRUE);
				ATLASSERT(Re.CompiledOK());
				if(Re.Match(strResponse) && (Re.SubStrings() == 2))
				{
					CString strServerName = Re[1];
					CString strServerVersion = Re[2];
					CString strRequiredServer = (CString(VCUE::CConfig::CSite::GetName()) + " Database");
					if(strRequiredServer != strServerName)
					{
						throw new CException("FATAL ERROR: Unknown server.\r\n\r\nActual server: " + strServerName
							+ "\r\nRequired server: " + strRequiredServer + "\r\n\r\nDisconnect.");
					}
					CString strModuleVersion = ::GetShortVersion();
					strCommand.Format(g_lpszCommandVersion, CString(g_lpszClientWebFax) + " " + strModuleVersion);//VERSION WebFax 1, 0, 0, 1
					ATLVERIFY(Send(strCommand) != SOCKET_ERROR);
					return true;
				}
				throw new CException("Version response failed: " + strResponse);
			}
		default:
			strError = _T("Receive line ID error: ") + strResponse;
		}//switch(nResponseID)
	}
	catch(CException* e)
	{
		strError = e->GetErrorMessage();
		delete e;
	}
	catch(...)
	{
		strError = "Unhandled exception!!!";
	}
	if(!strError.IsEmpty())
	{
		CSocketBlocking::SetError(_T("CSocketDatabase::ReceiveLineID(...) failed! ") + strError);

		//Думаю не стоит тут отсоединяться от базы данных, потому что выскакивает ошибка сокета
		//Достаточно просто вывести на веб страницу сообщение об ошибке
//		SetEventDisconnectDatabase();

		return true;
	}
	return false;
}

void CSocketDatabase::DisconnectDatabase()
{
ATLTRACE("CSocketDatabase::DisconnectDatabase()\n");
	if(CSocketBlocking::IsOpen())
	{
		CSocketBlocking::Close();
ATLASSERT(FALSE);//Not tested
		CSocketBlocking::WaitForCloseThread();
//		CSocketBlocking::WaitStop(1000);
	}
	SetEventStatus();
}

void CSocketDatabase::OnClose(int nErrorCode)
{
ATLTRACE("CSocketDatabase::OnClose(%d)\n", nErrorCode);
	CSocketTelnet::OnClose(nErrorCode);

	CString strError = CSocketBlocking::GetError();
//	if(!strError.IsEmpty())

	//Если я добавлю сюда m_strDatabaseError то я не буду видеть ошибку в статусе отправляемого файла если она призошла в FaxServerSevice
	//Для теста:
	//1. В проекте FaxServerSevice сделать какую нибудь ошибку, что бы он отключился от WebDatabaseSetvice
	//Например можно не закрывать файл факса после его создания: Закомментировать
	//		file.Close();
	//в функции
	//void CSocketDatabase::OnReceive(int nErrorCode) 
	// в пректе FaxServerSevice
	//2. Оправить факс один раз. Все будет хорошо
	//3. Оправить факс второй раз с тем же именем файла. Сейчас я не могу создать файл факса, потому что этот файл уже создан и не закрыт с прошлого раза
	//Сейчас в проект Fax придет сообщение об ошибке
	//<117 Error: Unexpected closing of the fax server  'qqq' Moscow Russia 7(495)123456
	//и программа попадет в это место. Хотелось бы добавить тут сообщение об ошибке но почему то в статусе факса это сообщение вообще не появляется в этом случае
	//я заметил небольшую разницу в окне output:
	//
	//Если сообщение об ошибке повляется в статусной строке:
	/*
	EventStatus = 'phone number Ok'
	<117 Error: Unexpected closing of the fax server  'qqq' Moscow Russia 7(495)123456
	CSocketBlocking::Proc(). Close socket. WSAEvents.lNetworkEvents & FD_CLOSE
	CSocketBlocking::Proc(). End.
	EventStatus = '<FONT color=#ff0000><h5>Unexpected disconnecting from the database! </h5></FONT>'
	EventDisconnectDatabase
	EventStatus = '<FONT color=#ff0000><h5>CFaxServer::ThreadProc() failed! Unexpected disconnecting from the database! </h5></FONT>'
	OnEndLessFrame(), error = ''
	*/
		//А теперь если добавить m_strDatabaseError, то нифига не видно сообщения об ошибке в статусной строке
	/*
	EventStatus = 'phone number Ok'
	<117 Error: Unexpected closing of the fax server  'qqq' Moscow Russia 7(495)123456
	CSocketBlocking::Proc(). Close socket. WSAEvents.lNetworkEvents & FD_CLOSE
	EventStatus = '<FONT color=#ff0000><h5>Unexpected disconnecting from the database! 117 Error: Unexpected closing of the fax server  'qqq' Moscow Russia 7(495)123456</h5></FONT>'
	CSocketBlocking::Proc(). End.
	EventDisconnectDatabase
	EventStatus = '<FONT color=#ff0000><h5>CFaxServer::ThreadProc() failed! Unexpected disconnecting from the database! 117 Error: Unexpected closing of the fax server  'qqq' Moscow Russia 7(495)123456  </h5></FONT>'
	OnEndLessFrame(), error = ''
	*/
	//как видно в этом случае EventStatus появляется раньше "CSocketBlocking::Proc(). End."

	if(!strError.IsEmpty())
	{//I do not want to see error message on the web page if the strError is empty because my web page is disconnected from database every time after next event on the Fax Service.
		CSocketBlocking::SetError("Unexpected disconnecting from the database!" + strError);
	}
	SetEventStatus();
//	SetEventDisconnectDatabase();
}

CString CSocketDatabase::Receive()
{
//	ATLTRACE("0x%x %s<", CSocketBlocking::GetThreadHandle(), GetWebClientId());
	ATLTRACE("0x%x <", CSocketBlocking::GetThreadHandle());
	CString strReceive = CSocketTelnet::Receive();
	ATLTRACE(strReceive);
	return strReceive;
}

int CSocketDatabase::Send( LPCTSTR  lpszFormatString, ... )
{
	if(!CSocketBlocking::IsOpen())
	{
//		ATLASSERT(FALSE);
//		throw new CException("CSocketDatabase::Send( " + CString(lpszFormatString) + ", ... ) failed! Socket is not open!");
		return SOCKET_ERROR;
	}
//	ATLTRACE("0x%x %s>", CSocketBlocking::GetThreadHandle(), GetWebClientId());
	ATLTRACE("0x%x >", CSocketBlocking::GetThreadHandle());
	va_list     varg_ptr = NULL;
	va_start(varg_ptr, lpszFormatString);
	int res = CSocketTelnet::Send(lpszFormatString, varg_ptr);
	if(varg_ptr)
		va_end(varg_ptr);
	return res;
}

void CSocketDatabase::SetEventDisconnectDatabase()
{
	ATLASSERT(FALSE);//Сейчас отключение от базы данных происходит по инициативе WebDaabaseServer
ATLTRACE("--- CSocketDatabase::SetEventDisconnectDatabase(); enter. this = 0x%x---\n", this);
//	m_csEventDisconnectDatabase.EnterCriticalSection();
//ATLTRACE("--- CSocketDatabase::SetEventDisconnectDatabase(); CSocketBlocking::Stop(1000); this = 0x%x---\n", this);

	//Этот способ не работает в случае отключения от базы данных на веб странице SendFax
	//CSocketSendFax::ReceiveLine(LPCTSTR lpszCommand); 
	//{//end of the file types list
	//	CSocketDatabase::SetEventDisconnectDatabase();
	CSocketBlocking::Stop(1000);

/*
	if(!CSocketBlocking::IsOpen())
		return;

//	if(!m_ev)
//		return;
	CSocketBlocking::SetStopEvent();
	CSocketBlocking::WaitStop(1000);
*/
/*
	//Этот способ не работает в случае отключения от базы данных по таймауту 
	// CXMLHttpRequestHandler::OnXMLHttpResopnse(); faxServer.WaitForStatusEvent(100)
	// I see error message:
	//SOCKET ERROR: CSocketBlocking::Close() error = 10038. An operation was attempted on something that is not a socket.
	if(CSocketBlocking::IsOpen())
	{
		CSocketBlocking::Close();
		CSocketBlocking::WaitStop(1000);
	}
*/
//	m_csEventDisconnectDatabase.LeaveCriticalSection();
//ATLTRACE("--- CSocketDatabase::SetEventDisconnectDatabase(); exit. this = 0x%x---\n", this);
/*
//	m_csEventDisconnectDatabase.EnterCriticalSection();
ATLTRACE("--- CSocketDatabase::SetEventDisconnectDatabase() enter. m_hEventDisconnectDatabase = 0x%x---\n", m_hEventDisconnectDatabase);
	if(!m_hEventDisconnectDatabase)
		return;

	ATLVERIFY(::SetEvent(m_hEventDisconnectDatabase));

	if(!m_hThread)
	{
		ATLTRACE("ERROR: CSocketDatabase::SetEventDisconnectDatabase(); m_hThread == 0\n");
//		m_csEventDisconnectDatabase.LeaveCriticalSection();
		return;
	}

//ATLTRACE("CSocketDatabase::SetEventDisconnectDatabase(); ::WaitForSingleObject(m_hThread = 0x%x, 1000)\n", m_hThread);
	switch (::WaitForSingleObject(m_hThread, 1000))//INFINITE))
	{
	case WAIT_OBJECT_0://Close server
//		ATLTRACE("CSocketBlocking::WaitStop(). EventClosed\r\n");
		m_hThread = 0;
		break;
	case WAIT_TIMEOUT:
		//Иногда по непонятным причинам попадает сюда
		ATLTRACE("ERROR: CSocketDatabase::SetEventDisconnectDatabase(); ::WaitForSingleObject(m_hThread = 0x%x, 1000) timeout.\n", m_hThread);
		if(!CSocketBlocking::IsOpen())
		{//Нить m_hThread закрылась несмотря на таймаут
			m_boExit = true;
			m_hThread = 0;
		}
		break;
	case WAIT_ABANDONED:
	case WAIT_FAILED:
	default: //assert(false);
		break;
	}
//	m_csEventDisconnectDatabase.LeaveCriticalSection();
ATLTRACE("--- CSocketDatabase::SetEventDisconnectDatabase() exit. m_hEventDisconnectDatabase = 0x%x---\n", m_hEventDisconnectDatabase);
*/
}

DWORD CSocketDatabase::WaitForStatusEvent(DWORD dwMilliseconds)
{
//ATLTRACE("===CSocketDatabase::WaitForStatusEvent(%ld). this = 0x%x; m_hEventStatus = 0x%x enter\n", dwMilliseconds, this, m_hEventStatus);
	DWORD res = ::WaitForSingleObject(m_hEventStatus, dwMilliseconds);
//ATLTRACE("===CSocketDatabase::WaitForStatusEvent(%ld). this = 0x%x; m_hEventStatus = 0x%x exit\n", dwMilliseconds, this, m_hEventStatus);
	switch (res)
	{
	case WAIT_OBJECT_0://Close server
		{
/*
#ifdef _DEBUG
			if(faxServer.m_boSetResponseStatus)
				ATLASSERT(FALSE);
#endif //_DEBUG
			Response(faxServer.m_strResponseStatus);
			faxServer.m_strResponseStatus.Empty();
*/
			break;
		}
	case WAIT_TIMEOUT:
/*
		ATLTRACE("CSocketDatabase::m_hEventStatus timeout\n");
		SetEventDisconnectDatabase();
*/
		break;
	case WAIT_ABANDONED:
	case WAIT_FAILED:
	default: ATLASSERT(FALSE);
	}
	return res;
}

void CSocketDatabase::SetEventStatus()
{
//ATLTRACE("CSocketDatabase::SetEventStatus()\n");
	ATLASSERT(m_hEventStatus);
	ATLVERIFY(::SetEvent(m_hEventStatus));
/*
/////////////////////////////////////////////////////
// for debug purpose
#ifdef _X86_
#ifdef _DEBUG
ATLTRACE("\n///Stack\n");
StackDumper sd(true);
CString strStack = sd.DumpStack();
ATLTRACE(strStack);
//RF_RPT0(_CRT_ASSERT, strStack);
ATLTRACE("///\n\n");
#endif //_DEBUG
#endif _X86_
/////////////////////////////////////////////////////
*/
}

CString CSocketDatabase::EmailMe2(LPCTSTR lpszMessage, LPCTSTR lpszPath)
{
	if(!m_pHandler)
		return "<p><FONT color=#ff0000>ERROR: CSocketDatabase::EmailMe2(LPCTSTR lpszMessage) failed! m_pHandler == NULL.</FONT></p>";

	CString strResponse(lpszMessage);
	strResponse.Replace("'", "");
	CString strError = strResponse;
	strResponse.Replace("\\", "\\\\");
	strError.Replace("\n", "%0A");//"&nbsp;");
	strError.Replace("\r", "");
	strError.Replace("\"", "&quot;");
	strError.Replace(" ", "%20");
	strError.Replace("?", "%3f");
	strError.Replace("&", "%26");//"&amp;");
	strError.Replace("#", "%23");
	CString strEmailMe;
	strEmailMe.Format(m_pHandler->LoadString(IDS_EMAIL_ME_ABOUT_PROBLEM)//"<p>Please <A HREF=\"%s../MyIsapi/EmailMe.srf?message=%s\">E-mail me</A> about problem.</p>"
																																		//"<p>Пожалуйста <A HREF=\"%s../MyIsapi/EmailMe.srf?message=%s\">сообщите мне</A> о Вашей проблеме.</p>"
		, lpszPath, CLoadResource::Convert(strError));
	return (m_pHandler->ErrorResponse(CLoadResource::Convert(strResponse)) + strEmailMe);
}
