//NormalizePhoneNumber.cpp

#include "StdAfx.h"
#include "util_RF.h"

//////////////////////////////////////////////////////////////////////
// Enable debug memory manager
#ifdef _DEBUG
#ifdef THIS_FILE
#undef THIS_FILE
#endif //THIS_FILE
static const char THIS_FILE[] = __FILE__;
#define new DEBUG_NEW
#endif //_DEBUG

CString NormalizePhoneNumber(LPCTSTR lpszPhoneNumber)
{
	if(!lpszPhoneNumber)
		return "";
	CString strPhoneNumber;
	while(*lpszPhoneNumber)
	{
		TCHAR c = *lpszPhoneNumber;
//		if(::isdigit(c))
		if(RF_isdigit(c))
			strPhoneNumber += c;
		lpszPhoneNumber++;
	}
	return strPhoneNumber;
}