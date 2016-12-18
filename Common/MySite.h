#pragma once
#include "webworld.h"

class CMySite :
	private  CWebWorld
{
public:
	CMySite(void);
	~CMySite(void);
	LPCTSTR GetContent();
private:
	CString m_strMySiteContent;
};
