// WhoIs.h, interface for the CWhoIs class.

#pragma once

#include <atldbcli.h>
#include "..\VCUE\db\VCUE_MyCommand.H"
#include "..\VCUE\vcue_oledbclient.h"
#include "..\VCUE\db\VCUE_WhoIsDB.h"//for CSprocWhoIsAdd
#include "WebWorld.h"

using namespace VCUE;

class CWhoIs
{
public:
	CWhoIs(CSession& theSession);
	virtual ~CWhoIs(void);
	bool GetGeo(ULONGLONG lIP);
private:
	CSession& m_theSession;
	CSprocWhoIsGetIP m_sprocWhoIsGetIP;
	CSprocWhoIsAdd m_sprocWhoIsAdd;
	ULONGLONG m_lIPCur;
	CWebWorld m_webWorld;
};
