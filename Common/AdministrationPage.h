// AdministrationPage.h
//#if !defined(_VCUE_REQUESTHANDLER_H___5A542442_2504_4D4D_A667_38B06EA6CFA6___INCLUDED_)
//#define _VCUE_REQUESTHANDLER_H___5A542442_2504_4D4D_A667_38B06EA6CFA6___INCLUDED_

//#if _MSC_VER >= 1000
#pragma once
//#endif // _MSC_VER >= 1000

#include "..\VCUE\VCUE_MyCustomRequestHandlerDB.h"//for CMyCustomRequestHandlerDB
#include "..\VCUE\db\VCUE_ConfirmUserDB.h"//for CSprocUserGetID

template <typename TAdministration>
class CAdministrationPage
	: public CMyCustomRequestHandlerDB<TAdministration>
{
private:
	CSprocUserGetID m_sprocUserGetID;
	bool m_boSeeOtherUser;

protected:
	CAdministrationPage(bool boEmailMe = false)
		: m_boSeeOtherUser(false)
		, CMyCustomRequestHandlerDB<TAdministration>(boEmailMe)
	{}

	bool IsSeeOtherUser()
	{ return m_boSeeOtherUser;}
	bool IsAdministrator()
	{
		if(m_ID == 0)
			return false;
		m_sprocUserGetID.Execute(m_Session, m_ID);
		if(m_sprocUserGetID.m_Administrator)
			return true;
		return false;
	}

	bool IsAccessPrivileges()
	{
		const CHttpRequestParams& QueryFields = m_HttpRequest.GetQueryParams();

		CStringA strUser;
		strUser = QueryFields.Lookup("user");
		if (strUser.IsEmpty())
			return true;
		ULONG lID = ::atol(strUser);
		if(!IsAdministrator() && (lID != m_ID))
		{
			m_HttpResponse << "You don't have privileges for access to this page";
			return false;
		}
		m_boSeeOtherUser = true;
		m_ID = lID;
		GetUserData();
		return true;
	}

	HTTP_CODE OnAdministrator()
	{
		return IsAdministrator() ? HTTP_SUCCESS : HTTP_S_FALSE;
	}

#define CUSTOM_REQUEST_HANDLER_ADMINISTRATION \
	REPLACEMENT_METHOD_ENTRY("Administrator", OnAdministrator) \
	MY_CUSTOM_REQUEST_HANDLER_DB_REPLACEMENT
};
//#endif // !defined(_VCUE_REQUESTHANDLER_H___5A542442_2504_4D4D_A667_38B06EA6CFA6___INCLUDED_)
