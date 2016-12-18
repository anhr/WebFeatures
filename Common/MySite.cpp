#include "StdAfx.h"
#include ".\mysite.h"
#include "..\VCUE\VCUE_Config.h"

//////////////////////////////////////////////////////////////////////
// Enable debug memory manager
#ifdef _DEBUG
#ifdef THIS_FILE
#undef THIS_FILE
#endif //THIS_FILE
static const char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif //_DEBUG

CMySite::CMySite(void)
{
}

CMySite::~CMySite(void)
{
}

LPCTSTR CMySite::GetContent()
{
	CString strPageContent;
	if(m_strMySiteContent.IsEmpty())
	{
		if(CWebWorld::GetWebPage(VCUE::CConfig::CSite::GetSite() + CString("/MySite.txt"), strPageContent))//tivenes.narod.ru/MySite.txt");
			m_strMySiteContent = strPageContent;
	}
	if(!m_strMySiteContent.IsEmpty())
		return m_strMySiteContent;
	return VCUE::CConfig::CSite::GetURL();//"83.167.115.178"
}
