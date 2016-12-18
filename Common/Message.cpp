//Message.cpp

#include "StdAfx.h"

//////////////////////////////////////////////////////////////////////
// Enable debug memory manager
#ifdef _DEBUG
#ifdef THIS_FILE
#undef THIS_FILE
#endif //THIS_FILE
static const char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif //_DEBUG

CString MessageReplace(LPCTSTR lpszMessage)
{
	CString strMessage(lpszMessage);

	//http://www.rusjoomla.ru/gadgets/misc/html-sings

	// Сначала надо преобразовать & потомучто потом переобразуется уже новые & от последующих преобразований
	strMessage.Replace(_T("&"), _T("&amp;"));//"%26");

	strMessage.Replace("<", "&lt;");
	strMessage.Replace(">", "&gt;");
	return strMessage;
}

CString Message(LPCTSTR lpszMessage)
{
	return "\t<message>" + MessageReplace(lpszMessage) + "</message>\n";
}

CString Alert(LPCTSTR lpszMessage)
{
	return "\t<alert>" + CString(lpszMessage) + "</alert>\n";
}