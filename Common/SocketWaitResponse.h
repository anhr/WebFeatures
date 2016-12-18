//SocketWaitResponse.h, Interface for the CSocketWaitResponse class.

#pragma once

#include "socketblocking\SocketBlocking.h"//for CSocketTelnet
#include "Regexp.h"

class CSocketWaitResponse
	: protected CSocketTelnet
{
public:
	CSocketWaitResponse();
	~CSocketWaitResponse(void);
	DWORD WaitResponse(DWORD dwMilliseconds);
protected:
	bool m_boTryCommandAgain;
	void Send( LPCTSTR  lpszFormatString, ... );
	virtual bool ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent);
	void SetEventWaitResponse()
	{ m_eventWaitResponse.Set();}
	void SetError(LPCTSTR lpszError)
	{ m_strError = lpszError; }
	LPCTSTR GetError()
	{ return m_strError; }
	void ConnectToRemoteControlDispatcher(UINT nHostPort, bool boException = true);
	void RepeatCommandTimeout();
private:
	CMyEvent m_eventWaitResponse;
//	GUID m_guid;
//	CString m_strClientVersion;
	CString m_strError;

	//Regexp
	static CString ReSend1();
	static Regexp m_reSend1;//g_lpszSend1;//"1 %s version %s ready\r\n";
protected:
	static CString ReSend151();
	static Regexp m_reSend151;//g_lpszSend151;//_T("151 GUID %s\r\n");
	static CString ReSend152();
	static Regexp m_reSend152;//g_lpszSend152;//_T("152 TV Channel. TV Channel ID \"%s\" File: \"%s\" lpszStreamer: \"%s\" Logo \"%s\" Country \"%s\" Category \"%s\" Language \"%s\"\r\n");
	static CString ReSend167();
	static Regexp m_reSend167;//g_lpszSend167;//"167 Preview. TV Channel ID \"%s\" File: \"%s\" Streamer: \"%s\" TVPlayerID %ld Preview %s TVchannelName \"%s\"\r\n
private:

	virtual CString Receive();

	//Работает нестабильно
	//Непонятно как сюда попадает иногда

	//Кажется разобрался в чем дело. Нельзя вызывать ConnectToRemoteControlDispatcher(nHostPort); из CSocketWaitResponse(...)
	// потому что в этом случае иногда успевает запускаться CSocketBlocking::Proc()
	// до того как вызовется доченние конструкторы CSocketWaitEvent(GUID guid) или CSocketRCInit(unsigned short nInitID)

	// Для решения проблемы перенес вызов ConnectToRemoteControlDispatcher(nHostPort);
	// из конструктора CSocketWaitResponse(...) в дочение конструкторы CSocketWaitEvent(GUID guid) и CSocketRCInit(unsigned short nInitID)
	virtual CString ClientVersion()
	{
//		ATLASSERT(FALSE);
		return "";
	}
	virtual void TimeOut()
	{}
};
