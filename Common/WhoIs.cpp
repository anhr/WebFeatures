// WhoIs.cpp, implementation of the CWhoIs class.

#include "StdAfx.h"
#include ".\whois.h"
#include "..\VCUE\db\GetIP.H"
#include "Regexp.h"
#include "CharsetDecoder.h"

//////////////////////////////////////////////////////////////////////
// Enable debug memory manager
#ifdef _DEBUG
#ifdef THIS_FILE
#undef THIS_FILE
#endif //THIS_FILE
static const char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif //_DEBUG

CWhoIs::CWhoIs(CSession& theSession)
 : m_theSession(theSession)
 , m_lIPCur(0)
{
}

CWhoIs::~CWhoIs(void)
{
}

bool CWhoIs::GetGeo(ULONGLONG lIP)
{
	if(m_lIPCur == lIP)
		return false;
	m_lIPCur = lIP;
	m_sprocWhoIsGetIP.Close();
	if(m_sprocWhoIsGetIP.IsIP(m_theSession, lIP))
		return false;

	CString strIP = VCUE::GetIP2(lIP);

	//http://ip-whois.net/ip_geo.php?ip=196.206.79.149
	CString strPostData = "ip=" + strIP;
	CString strPage("http://ip-whois.net/ip_geo.php?" + strPostData);
//CString strPage("http://localhost/ip_geo.php");
	CString strResponse;
	m_webWorld.Close();
	if(!m_webWorld.GetWebPage(strPage, strResponse))//, strPostData))
	{
		ATLASSERT(FALSE);
		return false;
//				throw new CException("Open " + strPage + " failed! " + webWorld.GetError());
	}

	//Get charset
//			CString strCharset;

	//Страна: Italy<br>
	//Регион: Piemonte<br>
	//Город: Cambiano<br>
	//Широта: 44.9667<br>
	//Долгота: 7.7833<br>
	//Ваш браузер: Microsoft Internet Explorer 7.x<br />
	//Операционная система: Microsoft Windows XP<br />
	//Провайдер: <a href='/provider/isp.php?prov=Vodafone Omnitel N.V.'><u>

	Regexp Re(_T("^"
		".*<meta .* content=\".* charset=([^\"]*)\">"//<meta http-equiv="Content-Type" content="text/html; charset=windows-1251">
		".*Страна: ([^<]*)<br>"//Страна: Italy<br>
		".*Регион: ([^<]*)<br>"//Регион: Piemonte<br>
		".*Город: ([^<]*)<br>"//Город: Cambiano<br>
		".*Широта: ([^<]*)<br>"//Широта: 44.9667<br>
		".*Долгота: ([^<]*)<br>"//Долгота: 7.7833<br>
		".*Ваш браузер: ([^<]*)<br"//Ваш браузер: Microsoft Internet Explorer 7.x<br />
		".*Операционная система: ([^<]*)<br"//Операционная система: Microsoft Windows XP<br />
		".*Провайдер: <a href='([^>]*)><u>"//Провайдер: <a href='/provider/isp.php?prov=Vodafone Omnitel N.V.'><u>
		".*"), FALSE);
	ATLASSERT(Re.CompiledOK());
	if(Re.Match(strResponse) && (Re.SubStrings() == 9))
	{
//				strCharset = Re[1];
		CCharsetDecoder charsetDecoder(Re[1]);//"windows-1251");

		CString strCountry = Re[2];
		CString strRegion = charsetDecoder.ConvertStringToUTF_8(Re[3], FALSE);
		CString strCity = charsetDecoder.ConvertStringToUTF_8(Re[4], FALSE);
		CString strAltitude = Re[5];//Широта
		CString strLongitude = Re[6];//Долгота
		CString strBrowser  = Re[7];
		CString strOS = Re[8];
		CString strProvider = Re[9];

		m_sprocWhoIsAdd.Execute(m_theSession, lIP,
				strCountry, strRegion, strCity,
				(float)::atof(strAltitude),//Широта 44.9667
				(float)::atof(strLongitude),//Долгота 7.7833
				strBrowser, strProvider
			);
	}
	else throw new CException("Get location from " + strPage + "?" + strPostData + " failed! ");
	return true;
}

