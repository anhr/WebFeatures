//SocketDatabase.h

#pragma once

#include "socketblocking\SocketBlocking.h"//for CSocketTelnet

class CHandler;

class CSocketDatabase
	: protected CSocketTelnet
{
public:
	CSocketDatabase(//LPCTSTR lpszHostAddress = NULL,
		CHandler* pHandler = NULL);
	~CSocketDatabase(void);
	CHandler* GetHandler()
	{ return m_pHandler;}
protected:
	CHandler* m_pHandler;
	int Send( LPCTSTR  lpszFormatString, ... );
	void SetStatusStr(LPCTSTR lpszStatus)
	{ m_strStatus = lpszStatus;}
	CString GetStatus()
	{ return m_strStatus;}
	bool ConnectToWebDatabaseService(bool boStart = true);
	void SetEventDisconnectDatabase();
	bool IsExit()
	{ return !CSocketBlocking::IsOpen();}//m_boExit;}
	virtual bool ReceiveLineID(int nResponseID, LPCTSTR lpszResponse, LPCTSTR lpszContent);
	void SetEventStatus();
	void ResetEventStatus()
	{	ATLASSERT(m_hEventStatus); ATLVERIFY(::ResetEvent(m_hEventStatus));}
	DWORD WaitForStatusEvent(DWORD dwMilliseconds = INFINITE);
	virtual void SetStatus(LPCTSTR lpszStatus = NULL)
	{SetStatusStr(lpszStatus);}
	CString EmailMe2(LPCTSTR lpszMessage, LPCTSTR lpszPath = "");
	virtual CString Receive();
	void DisconnectDatabase();
private:
	HANDLE m_hEventStatus;
	CString m_strStatus;

	virtual void EmailMe(LPCTSTR lpszMessage)
	{}

	virtual void OnClose(int nErrorCode);
	virtual CString GetWebClientId()
	{ return "";}
};
