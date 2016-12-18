// DownloadsPage.h

//#if _MSC_VER >= 1000
#pragma once
//#endif // _MSC_VER >= 1000

#include "AdministrationPage.h"
#include "..\VCUE\db\VCUE_DownloadsDB.h"//for CSprocDownloadsCount

template <typename TDownloads>
class CDownloadsPage
	: public CAdministrationPage<TDownloads>
{
private:

protected:
	DWORD OnODBC_32_ExplorerCount()
	{
		CString strError;
		try
		{
			CSprocDownloadsCount sprocDownloadsCount;
			if (FAILED(sprocDownloadsCount.Execute(m_Session, "ODBC_32_Explorer.exe")))
			{
				throw new CException("Find the ODBC_32_Explorer.exe download count in the database failed!");
				return false;
			}
			m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
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
			return HTTP_SUCCESS;
		m_HttpResponse << CHandler::ErrorResponse("ERROR: CDownloadsPage::OnODBC_32_ExplorerCount() failed! " + strError);
//		ResponseStatus(CHandler::ErrorResponse("ERROR: CDownloadsPage::OnODBC_32_ExplorerCount() failed! " + strError));
		return HTTP_SUCCESS;
	}

	DWORD OnFaxGatewayEnCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "FaxGatewayEn.exe")))
		{
			throw new CException("Find the FaxGatewayEn.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnFaxGatewayRuCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "FaxGatewayRu.exe")))
		{
			throw new CException("Find the FaxGatewayRu.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD Onandrej_resumeCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "andrej_resume.doc")))
		{
			throw new CException("Find the .exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}
/*
	DWORD OnODBC_32_ExplorerCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "ODBC_32_Explorer.exe")))
		{
			throw new CException("Find the ODBC_32_Explorer.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}
*/
	DWORD OnTextEffectsCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "TextEffects.zip")))
		{
			throw new CException("Find the TextEffects.zip download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnTimeTrackerCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "TimeTracker.exe")))
		{
			throw new CException("Find the TimeTracker.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnIOMailCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "IOMail.exe")))
		{
			throw new CException("Find the IOMail.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnAHPlayerInstCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "AHPlayerInst.exe")))
		{
			throw new CException("Find the AHPlayerInst.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnUpdateTestCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "UpdateTest.zip")))
		{
			throw new CException("Find the UpdateTest.zip download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnActiveChatInstallationCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "ActiveChatInstallation.exe")))
		{
			throw new CException("Find the ActiveChatInstallation.exe download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

	DWORD OnPortSnifferSetupCount()
	{
		CSprocDownloadsCount sprocDownloadsCount;
		if (FAILED(sprocDownloadsCount.Execute(m_Session, "PortSnifferSetup.msi")))
		{
			throw new CException("Find the PortSnifferSetup.msi download count in the database failed!");
			return false;
		}
		m_HttpResponse << sprocDownloadsCount.CDownloadsCount::GetCount();
		return HTTP_SUCCESS;
	}

#define CUSTOM_REQUEST_HANDLER_DOWNLOADS \
		REPLACEMENT_METHOD_ENTRY("ODBC_32_ExplorerCount", OnODBC_32_ExplorerCount) \
		REPLACEMENT_METHOD_ENTRY("FaxGatewayEnCount", OnFaxGatewayEnCount) \
		REPLACEMENT_METHOD_ENTRY("FaxGatewayRuCount", OnFaxGatewayRuCount) \
		REPLACEMENT_METHOD_ENTRY("andrej_resumeCount", Onandrej_resumeCount) \
		REPLACEMENT_METHOD_ENTRY("TextEffectsCount", OnTextEffectsCount) \
		REPLACEMENT_METHOD_ENTRY("TimeTrackerCount", OnTimeTrackerCount) \
		REPLACEMENT_METHOD_ENTRY("IOMailCount", OnIOMailCount) \
		REPLACEMENT_METHOD_ENTRY("AHPlayerInstCount", OnAHPlayerInstCount) \
		REPLACEMENT_METHOD_ENTRY("UpdateTestCount", OnUpdateTestCount) \
		REPLACEMENT_METHOD_ENTRY("ActiveChatInstallationCount", OnActiveChatInstallationCount) \
		REPLACEMENT_METHOD_ENTRY("PortSnifferSetupCount", OnPortSnifferSetupCount) \
	CUSTOM_REQUEST_HANDLER_ADMINISTRATION
};
//#endif // !defined(_VCUE_REQUESTHANDLER_H___5A542442_2504_4D4D_A667_38B06EA6CFA6___INCLUDED_)
