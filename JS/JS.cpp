// JS.cpp : Defines the entry point for the DLL application.
//

#include "stdafx.h"
// For custom assert and trace handling with WebDbg.exe
#ifdef _DEBUG
CDebugReportHook g_ReportHook;
#endif

#include "JS.h"

class CJSModule : public CAtlDllModuleT<CJSModule>
{
public:
	BOOL WINAPI DllMain(DWORD dwReason, LPVOID lpReserved) throw()
	{
#if defined(_M_IX86)
		if (dwReason == DLL_PROCESS_ATTACH)
		{
			// stack overflow handler
			_set_security_error_handler( AtlsSecErrHandlerFunc );
		}
#endif
		return __super::DllMain(dwReason, lpReserved);
	}
};

CJSModule _AtlModule;


// TODO: Add additional request handlers to the handler map

BEGIN_HANDLER_MAP()
	HANDLER_ENTRY("Default", CJSHandler)
END_HANDLER_MAP()


// DLL Entry Point
//
extern "C"
BOOL WINAPI DllMain(HINSTANCE hInstance, DWORD dwReason, LPVOID lpReserved)
{
	hInstance;
	return _AtlModule.DllMain(dwReason, lpReserved); 
}
