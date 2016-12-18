//SocketRTMPSuck.cpp, Implementation of the CSocketRTMPSuck class.

#include "StdAfx.h"
#include "SocketRTMPSuck.h"
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
CSocketRTMPSuck::CSocketRTMPSuck()
	: CSocketTelnet(
/*
#ifdef _DEBUG
		FALSE//boAssert
#endif
*/
								 )
	, m_boTimeout(false)
	, m_boTimeoutManual(false)
{
//ATLTRACE("CSocketRTMPSuck::CSocketRTMPSuck(void) this = 0x%x\n", this);
//	ConnectToRTMPSuck();//nHostPort);
}

CSocketRTMPSuck::~CSocketRTMPSuck(void)
{
//ATLTRACE("--- CSocketRTMPSuck::~CSocketRTMPSuck() enter. this = 0x%x---\n", this);
	Stop();
//ATLTRACE("--- CSocketRTMPSuck::~CSocketRTMPSuck() exit. this = 0x%x---\n", this);
}

bool CSocketRTMPSuck::ConnectToRTMPSuck(bool boException)
{
	if(CSocketBlocking::IsOpen())
		return true;

//	CSocketTelnet::WSAStart();
	m_strError.Empty();

	UINT nHostPort = VCUE::CConfig::CSite::GetRTMPsuckPort();//6004
	CString strError;
	LPCTSTR lpszHostAddress = "PC2008";//"localhost";

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
			strError.Format("Connect to RTMPsuck failed! "
				+ CSocketBlocking::GetError()
				+ " lpszHostAddress: %s, nHostPort = %d", lpszHostAddress, nHostPort);
			if(boException)
				throw new CException(strError);
			else
			{
				m_strError = strError;
				return false;
			}
			break;
		}
	case 0:
		{
//			if(CSocketBlocking::IsStart())
//				CSocketBlocking::WaitForCloseThread();
			CSocketBlocking::Start();
			CSocketBlocking::WaitThreadIsCreated(FALSE);
		}
		break;
	}
//	strError = CSocketBlocking::GetError();
	return true;
}
/*
bool CSocketRTMPSuck::ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent)
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
		strError = _T("CSocketRTMPSuck::ReceiveLineID(" + strResponse + ") failed!");
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
*/
bool CSocketRTMPSuck::ReceiveLine(LPCTSTR lpszResponse)
{
	CString strResponse(lpszResponse);
	ATLTRACE("0x%x < %s", CSocketTelnet::GetThreadHandle(), lpszResponse);

	LPCTSTR lpszTcUrl = _T("tcUrl\x02:");
	LPCTSTR lpszSavingAs = _T("Saving as:");
//	LPCTSTR lpszPageURL = _T("pageUrl\x02:");//pageUrl: http://tvtvtv.ru/channel_eng.php?ch=5567
	LPCTSTR lpszPageURL = _T("swfUrl\x02:");//swfUrl: http://cdn.livestream.com/chromelessPlayer/v21/playerapi.swf?iconColorOver=0x5484ba&autoPlay=true&jsEnabled=false&mute=false&iconColor=0x386496&color=0x8cb6e5

	if(strResponse.Find(lpszTcUrl) == 0)
	{
//		ATLASSERT(m_strTcUrl.IsEmpty());
		m_strTcUrl = strResponse.Right((int)(strResponse.GetLength() - ::strlen(lpszTcUrl) - 1));
		m_strTcUrl.Replace("\n", "");
		m_strTcUrl.Replace("\r", "");
		__if_exists(cout)
		{
				cout << lpszTcUrl << " " << m_strTcUrl << endl;
		}
		return true;
	}
	else if(strResponse.Find(lpszSavingAs) == 0)
	{
		CString strSavingAs = strResponse.Right((int)(strResponse.GetLength() - ::strlen(lpszSavingAs) - 1));
		if(m_strSavingAs == strSavingAs)
			return true;
//		ATLASSERT(!m_strTcUrl.IsEmpty());
//		ATLASSERT(m_strSavingAs.IsEmpty());
		m_strSavingAs = strSavingAs;
		m_strSavingAs.Replace("\n", "");
		m_strSavingAs.Replace("\r", "");
		__if_exists(cout)
		{
			cout << lpszSavingAs << " " << m_strSavingAs << endl;
		}
		SetEventWaitResponse();
		return true;
	}
	else if(strResponse.Find(lpszPageURL) == 0)//_T("pageUrl\x02:");//pageUrl: http://tvtvtv.ru/channel_eng.php?ch=5567
	{
		CString strPageURL = strResponse.Right((int)(strResponse.GetLength() - ::strlen(lpszPageURL) - 1));
		if(!m_strPageURL.IsEmpty())
		{
/*
			if(m_strPageURL != strPageURL)
				ATLASSERT(FALSE);
			else 
*/
			{//Возможно это реклама
				/*
RTMP Proxy Server 1.0
(c) 2010 Andrej Stepanchuk, Howard Chu, Andrej Hristoliubov; license: GPL

TVChannels listen...
Streaming on rtmp://0.0.0.0:1935
Processing connect
ERROR: send data to TVChannels failed!
app: mogulus-edge/a1plus
ERROR: send data to TVChannels failed!
flashVer: WIN 11,5,502,146
ERROR: send data to TVChannels failed!
swfUrl: http://cdn.livestream.com/chromelessPlayer/v21/playerapi.swf?iconColorOv
er=0x5484ba&autoPlay=true&jsEnabled=false&mute=false&iconColor=0x386496&color=0x
8cb6e5
ERROR: send data to TVChannels failed!
tcUrl: rtmp://xa1plusx.e.channel.livestream.com/mogulus-edge/a1plus
ERROR: send data to TVChannels failed!
pageUrl: http://tvtvtv.ru/channel_eng.php?ch=5567
ERROR: RTMP_ReadPacket, failed to read RTMP packet header
Closing connection... done!

Processing connect
ERROR: send data to TVChannels failed!
app: mogulus-stream-edge/a1plus
ERROR: send data to TVChannels failed!
flashVer: WIN 11,5,502,146
ERROR: send data to TVChannels failed!
swfUrl: http://cdn.livestream.com/chromelessPlayer/v21/playerapi.swf?iconColorOv
er=0x5484ba&autoPlay=true&jsEnabled=false&mute=false&iconColor=0x386496&color=0x
8cb6e5
ERROR: send data to TVChannels failed!
tcUrl: rtmp://212-23.livestream.com/mogulus-stream-edge/a1plus
ERROR: send data to TVChannels failed!
pageUrl: http://tvtvtv.ru/channel_eng.php?ch=5567
ERROR: RTMP_ReadPacket, failed to read RTMP packet header
Closing connection... done!


другой пример:

Processing connect
app: live?_fcs_vhost=cp54218.live.edgefcs.net&uuid=oa47q7zb
flashVer: WIN 11,5,502,146
swfUrl: http://player.multicastmedia.com/templates/livefull2.swf
tcUrl: rtmp://60.254.175.93:1935/live?_fcs_vhost=cp54218.live.edgefcs.net&uuid=o
a47q7zb
Processing connect
app: mogulus-edge/america2
flashVer: WIN 11,5,502,146
swfUrl: http://cdn.livestream.com/chromelessPlayer/v21/playerapi.swf?mute=true&j
sEnabled=false&iconColorOver=0x5484ba&color=0x8cb6e5&autoPlay=true&iconColor=0x3
86496
tcUrl: rtmp://xamerica2x.e.channel.livestream.com/mogulus-edge/america2
pageUrl: http://tvtvtv.ru/channel_eng.php?ch=3337
ERROR: RTMP_ReadPacket, failed to read RTMP packet header
Closing connection... done!

ERROR: Request timeout/select failed, ignoring request
Closing connection... done!
				*/
				m_strTcUrl.Empty();
				m_strSavingAs.Empty();
			}
		}
//		ATLASSERT(m_strPageURL.IsEmpty());
		m_strPageURL = strPageURL;
		m_strPageURL.Replace("\n", "");
		m_strPageURL.Replace("\r", "");
		__if_exists(cout)
		{
			cout << lpszPageURL << " " << m_strPageURL << endl;
		}
		return true;
	}
	return false;
}

CString CSocketRTMPSuck::Receive()
{
	m_events.WaitResponseCompleted();
	ATLTRACE("0x%x <", CSocketBlocking::GetThreadHandle());
	CString strReceive = CSocketTelnet::Receive();
	ATLTRACE(strReceive);
	return strReceive;
}
/*
void CSocketRTMPSuck::Send( LPCTSTR  lpszFormatString, ... )
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
*/

DWORD CSocketRTMPSuck::WaitResponse(bool boException, CMyEvent* peventListenRTMPSuckIsSopped, bool* pboConnectedToRTMPSuck)
{
ATLTRACE(CString(__FUNCTION__) + "\n");
	if(!ConnectToRTMPSuck(boException))
	{
ATLTRACE(CString(__FUNCTION__) + " !ConnectToRTMPSuck(boException)\n");
		if(peventListenRTMPSuckIsSopped)
			peventListenRTMPSuckIsSopped->Set();
		return WAIT_ABANDONED;
	}

ATLTRACE(CString(__FUNCTION__) + " ConnectToRTMPSuck\n");
	if(peventListenRTMPSuckIsSopped)
	{
		ATLASSERT(pboConnectedToRTMPSuck && *pboConnectedToRTMPSuck == false);
		*pboConnectedToRTMPSuck = true;
		peventListenRTMPSuckIsSopped->Set();
	}

	__if_exists(cout)
	{
		cout << __FUNCTION__ << " start" << endl;
	}

	m_strTcUrl.Empty();
	m_strSavingAs.Empty();
	m_strPageURL.Empty();
	m_boTimeout = false;
	m_boTimeoutManual = false;

//	m_eventWaitResponse.Reset();
//	DWORD ret = m_eventWaitResponse.Wait(30 * 1000);//dwMilliseconds);
	DWORD ret = m_events.WaitResponse();

	CString strError = CSocketBlocking::GetError();
	if(!strError.IsEmpty())
		throw new CException(strError);

	if(ret == WAIT_TIMEOUT)
	{
		__if_exists(cout)
		{
			cout << __FUNCTION__ << " timeout" << endl;
		}
		m_boTimeout = true;
	}
	if(m_boTimeoutManual)
		m_boTimeout = true;
/*
	CSocketBlocking::Stop();
	if(CSocketBlocking::WaitForCloseThread() != WAIT_OBJECT_0)
	{
		//Предполагается что нить CSocketBlocking::Proc() успела закрыться между 
		//  CSocketBlocking::Stop();
		// и CSocketBlocking::WaitForCloseThread()
		//В этом случае даем время для выхода из CSocketBlocking::Proc()
		// а иначе виснет на pInstance->DeleteThis(); в функции CSocketBlocking::ThreadProc(void* pParam)
		::Sleep(100);
	}
*/
	__if_exists(cout)
	{
		cout << __FUNCTION__ << " response was detected" << endl;
	}
	CSocketBlocking::Stop();
//	CSocketBlocking::WaitForCloseThread();
	DWORD res = WAIT_OBJECT_0;
	if(IsThreadCreated())
	{
		res = m_thread.WaitForCloseThread(10000);
//		ATLVERIFY(res == WAIT_OBJECT_0);
	}
	return ret;
}

/*
void CSocketRTMPSuck::RepeatCommandTimeout()
{
	//на PC2008 Windows XP задержка между разъединением по таймауту и новым соединением составляет около 30 миллисекунд
	//значит тут надо сделать задержку побольше учитывая, что сервер может быть занят
	::Sleep(5 * 30);
// 	::Sleep(5 * 1000);//Для отладки. См DWORD CSocketWaitEvent::CSocketWaitEvent(GUID guid)
}
*/