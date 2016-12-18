//SocketRTMPSuck.h, Interface for the CSocketRTMPSuck class.

#pragma once

#include "socketblocking\SocketBlocking.h"//for CSocketTelnet
#include "Regexp.h"

//Соединяется с программой "C:\My Documents\MyProjects\trunk\WebFeatures\WebFeatures\RTMP\RTMPDumpHelper v1.15\rtmpdumphelper\rtmpsuck.exe"
//Для порлучения адреса RTMP streamer из чужого сайта
class CSocketRTMPSuck
	: protected CSocketTelnet
{
public:
	CSocketRTMPSuck();
	~CSocketRTMPSuck(void);
	DWORD WaitResponse(bool boException = true, CMyEvent* peventListenRTMPSuckIsSopped = NULL, bool* pboConnectedToRTMPSuck = NULL);
	LPCTSTR GetTcUrl()
	{ return m_strTcUrl;}
	LPCTSTR GetSavingAs()
	{ return m_strSavingAs;}
	void SetEventResponseCompleted()
	{ m_events.SetEventResponseCompleted();}
	void SetEventWaitResponse(bool boTimeoutManual = false)
	{
		if(boTimeoutManual)
			m_boTimeoutManual = true;
		m_events.SetEventWaitResponse();
	}
	bool IsTimeout()
	{ return m_boTimeout;}
	LPCTSTR GetError()
	{ return m_strError;}
/*
	void Close()
	{ CSocketBlocking::Close();}
*/
protected:
//	bool m_boTryCommandAgain;
//	void Send( LPCTSTR  lpszFormatString, ... );
//	virtual bool ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent);
	virtual bool ReceiveLine(LPCTSTR lpszResponse);
	bool //false - error
		ConnectToRTMPSuck(bool boException);
private:
	class CEvents
	{
	public:
		CEvents()
		{
			m_eventWaitResponse.Reset();
			m_eventResponseCompleted.Reset();
		}
		void SetEventResponseCompleted()
		{
			m_eventWaitResponse.Reset();
			m_eventResponseCompleted.Set();
		}
		void WaitResponseCompleted()
		{
			m_eventResponseCompleted.Wait();
		}
		void SetEventWaitResponse()
		{
//ATLTRACE("CSocketRTMPSuck::CEvents::SetEventWaitResponse()\n");
			m_eventWaitResponse.Set();
			m_eventResponseCompleted.Reset();
		}
		DWORD WaitResponse()
		{
			SetEventResponseCompleted();
//ATLTRACE("CSocketRTMPSuck::CEvents::WaitResponse() begin\n");
//			DWORD res = m_eventWaitResponse.Wait((60 + 20) * 1000); 
			DWORD res = m_eventWaitResponse.Wait((60 + 0) * 1000); 
//ATLTRACE("CSocketRTMPSuck::CEvents::WaitResponse() end\n");
			return res;
		}
	private:
		CMyEvent m_eventWaitResponse;//Wait of response from RTMPSuck
		CMyEvent m_eventResponseCompleted;//Wait of completing of inserting of the TV Channel;
	} m_events;

	CString m_strTcUrl;
	CString m_strSavingAs;
	CString m_strPageURL;//pageUrl: http://tvtvtv.ru/channel_eng.php?ch=5567
	bool m_boTimeout;
	bool m_boTimeoutManual;//Пользователь прервал ожидание события от RTMPSuck

	CString m_strError;

	//Regexp
private:

	virtual CString Receive();

	//Работает нестабильно
	//Непонятно как сюда попадает иногда

	//Кажется разобрался в чем дело. Нельзя вызывать ConnectToRTMPSuck(nHostPort); из CSocketRTMPSuck(...)
	// потому что в этом случае иногда успевает запускаться CSocketBlocking::Proc()
	// до того как вызовется доченние конструкторы CSocketWaitEvent(GUID guid) или CSocketRCInit(unsigned short nInitID)

	// Для решения проблемы перенес вызов ConnectToRTMPSuck(nHostPort);
	// из конструктора CSocketRTMPSuck(...) в дочение конструкторы CSocketWaitEvent(GUID guid) и CSocketRCInit(unsigned short nInitID)
/*
	virtual CString ClientVersion()
	{
//		ATLASSERT(FALSE);
		return "";
	}
	virtual void TimeOut()
	{}
*/
};
