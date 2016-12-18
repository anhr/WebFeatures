//SocketWaitResponse.cpp, Implementation of the CSocketWaitResponse class.

#include "StdAfx.h"
#include "SocketWaitResponse.h"
#include "..\Common\GlobalCommands.h"
#include "..\VCUE\VCUE_API.h"//for StringFromGuid
#include "..\VCUE\VCUE_Config.h"//for VCUE::CConfig

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

CString CSocketWaitResponse::ReSend1()
{
	CString strExp = g_lpszSend1;
	strExp.Replace("%s", "(.*)");
	return strExp;
}

CString CSocketWaitResponse::ReSend151()
{
	CString strExp = g_lpszSend151;//_T("151 GUID %s\r\n");
	strExp.Replace("%s", "(.*)");
	return strExp;
}

CString CSocketWaitResponse::ReSend152()
{
	CString strExp = g_lpszSend152;//_T("152 TV Channel. TV Channel ID \"%s\" File: \"%s\" lpszStreamer: \"%s\" Logo \"%s\" Country \"%s\" Category \"%s\" Language \"%s\"\r\n");
	strExp.Replace("%s", "(.*)");
	strExp.Replace("%ld", "(.*)");
	return strExp;
}

CString CSocketWaitResponse::ReSend167()
{
	CString strExp = g_lpszSend167;//g_lpszSend167;//"167 Preview. TV Channel ID \"%s\" File: \"%s\" Streamer: \"%s\" TVPlayerID %ld Preview %s TVchannelName \"%s\"\r\n
	strExp.Replace("%s", "(.*)");
	strExp.Replace("%ld", "(.*)");
	return strExp;
}
//Я перенес это за CDumpMemoryLeaks g_dumpMemoryLeaks; потому что иначе определяется ложная утечка памяти
/*
Regexp CSocketWaitResponse::m_reSend1(ReSend1(), TRUE);//g_lpszSend1;//"1 %s version %s ready\r\n";
Regexp CSocketWaitResponse::m_reSend152(ReSend152(), TRUE);//g_lpszSend152;//_T("152 TV Channel. File: \"%s\" lpszStreamer: \"%s\"\r\n");
Regexp CSocketWaitResponse::m_reSend151(ReSend151(), TRUE);//g_lpszSend151;//_T("151 GUID %s\r\n");
*/
CSocketWaitResponse::CSocketWaitResponse()
	: CSocketTelnet(
#ifdef _DEBUG
		FALSE//boAssert
#endif
								 )
	, m_boTryCommandAgain(false)
{
//ATLTRACE("CSocketWaitResponse::CSocketWaitResponse(void) this = 0x%x\n", this);
//	ConnectToRemoteControlDispatcher(nHostPort);
}

CSocketWaitResponse::~CSocketWaitResponse(void)
{
//ATLTRACE("--- CSocketWaitResponse::~CSocketWaitResponse() enter. this = 0x%x---\n", this);
//ATLTRACE("--- CSocketWaitResponse::~CSocketWaitResponse() exit. this = 0x%x---\n", this);
}

void CSocketWaitResponse::ConnectToRemoteControlDispatcher(UINT nHostPort, bool boException)
{
	CString strError;
	LPCTSTR lpszHostAddress = "localhost";

//	UINT nHostPort = VCUE::CConfig::CSite::GetRCInitPort();

	//Create destination socket
	CSocketTelnet::Create();
	CSockAddr saServer(INADDR_ANY, 0);
	CSocketBlocking::Bind(saServer);
	switch(CSocketBlocking::Connect(lpszHostAddress, nHostPort, false))
	{
	default:
		{
			CSocketBlocking::Cleanup();
			CString strError;
			strError.Format("Connect to Remote Control Dispatcher failed! "
				+ CSocketBlocking::GetError()
				+ " lpszHostAddress: %s, nHostPort = %d", lpszHostAddress, nHostPort);
//			throw new CException(strError);
			CSocketBlocking::GetLastError(strError, boException);//, int nLastError, BOOL boAssert));
			break;
		}
	case 0:
		{
			CSocketBlocking::Start();
			CSocketBlocking::WaitThreadIsCreated(FALSE);
		}
		break;
	}
	strError = CSocketBlocking::GetError();
}

bool CSocketWaitResponse::ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent)
{
	CString strResponse = lpszResponse;
	if(strResponse == _T("\r\n"))
		return true;//Ignore empty lines
	CString strError;
	CString strContent = lpszContent;
	CString strCommand;
	switch(nResponseID)
	{
	case 1://g_lpszSend1;//"1 %s version %s ready\r\n";
		{
			ATLASSERT(m_reSend1.CompiledOK());
			if(m_reSend1.Match(strResponse) && (m_reSend1.SubStrings() == 2))
			{
				CString strServerName = m_reSend1[1];
				CString strServerVersion = m_reSend1[2];
				CString strRequiredServer = (CString(VCUE::CConfig::CSite::GetName()) + " Remote Control Dispatcher");
				if(strRequiredServer != strServerName)
				{
					throw new CException("FATAL ERROR: Unknown server.\r\n\r\nActual server: " + strServerName
						+ "\r\nRequired server: " + strRequiredServer + "\r\n\r\nDisconnect.");
				}
/*
				CString strModuleVersion;// = ::GetShortVersion();
				strCommand.Format(g_lpszCommandVersion, CString(g_lpszClientOnlineTV)//"OnlineTV";
					+ " " + strModuleVersion);//VERSION OnlineTV 1, 0, 0, 1
*/
				strCommand.Format(g_lpszCommandVersion, ClientVersion());//VERSION OnlineTV 1, 0, 0, 1
//				strCommand.Format(g_lpszCommandVersion, m_strClientVersion);//VERSION OnlineTV 1, 0, 0, 1
				Send(strCommand);
				return true;
			}
			CString strErrorRe = m_reSend1.GetErrorString();
			if(!strErrorRe.IsEmpty())
				strResponse = "m_reSend1 failed! " + strErrorRe;
			strError = "Version response failed: " + strResponse;
			break;
		}
	default:
		strError = _T("CSocketWaitResponse::ReceiveLineID(" + strResponse + ") failed!\n");
	}//switch(nResponseID)
	if(!strError.IsEmpty())
	{
		ATLTRACE(strError);
		m_strError = strError;
		SetEventWaitResponse();
//		throw new CException(strError);
	}
	return false;
}

CString CSocketWaitResponse::Receive()
{
	ATLTRACE("0x%x <", CSocketBlocking::GetThreadHandle());
	CString strReceive = CSocketTelnet::Receive();
	ATLTRACE(strReceive);
	return strReceive;
}

void CSocketWaitResponse::Send( LPCTSTR  lpszFormatString, ... )
{
	if(!CSocketBlocking::IsOpen())
	{
		ATLASSERT(FALSE);
	}
	ATLTRACE("0x%x >", CSocketBlocking::GetThreadHandle());
	va_list     varg_ptr = NULL;
	va_start(varg_ptr, lpszFormatString);
	ATLVERIFY(CSocketTelnet::Send(lpszFormatString, varg_ptr) != SOCKET_ERROR);
	if(varg_ptr)
		va_end(varg_ptr);
}

DWORD CSocketWaitResponse::WaitResponse(DWORD dwMilliseconds)
{
	DWORD ret = m_eventWaitResponse.Wait(dwMilliseconds);
	CString strError = CSocketBlocking::GetError();
	if(!strError.IsEmpty())
		throw new CException(strError);

	if(ret == WAIT_TIMEOUT)
	{
		TimeOut();
/*
		CString strError = CSocketWaitResponse::GetError();
		if(!strError.IsEmpty())
			throw new CException(strError);
*/
	}

	CSocketBlocking::Stop();
	if(CSocketBlocking::WaitForCloseThread() != WAIT_OBJECT_0)
	{
		//Сейчас сюда не попадает потому что для ожидания окончания нити я использую критическую секцию и 
		// CSocketBlocking::WaitForCloseThread() всегда возврашает WAIT_OBJECT_0

		//Предполагается что нить CSocketBlocking::Proc() успела закрыться между 
		//  CSocketBlocking::Stop();
		// и CSocketBlocking::WaitForCloseThread()
		//В этом случае даем время для выхода из CSocketBlocking::Proc()
		// а иначе виснет на pInstance->DeleteThis(); в функции CSocketBlocking::ThreadProc(void* pParam)
		::Sleep(100);
	}
	return ret;
}

void CSocketWaitResponse::RepeatCommandTimeout()
{
	//на PC2008 Windows XP задержка между разъединением по таймауту и новым соединением составляет около 30 миллисекунд
	//значит тут надо сделать задержку побольше учитывая, что сервер может быть занят
	::Sleep(5 * 30);
// 	::Sleep(5 * 1000);//Для отладки. См DWORD CSocketWaitEvent::CSocketWaitEvent(GUID guid)
}