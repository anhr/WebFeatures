//GlobalCommands.cpp

#include "stdafx.h"

LPCTSTR g_lpszClientFaxServerService = _T("FaxServerService");
LPCTSTR g_lpszClientFaxServerServiceOptions = _T("FaxServerServiceOptions");
LPCTSTR g_lpszClientWebFax = _T("WebFax");
LPCTSTR g_lpszClientSpades = _T("Spades");
LPCTSTR g_lpszClientHearts = _T("Hearts");
LPCTSTR g_lpszClientOnlineTV = _T("OnlineTV");
LPCTSTR g_lpszClientTVPlayer = _T("TVPlayer");
LPCTSTR g_lpszClientRemoteControl = _T("RemoteControl");
LPCTSTR g_lpszClientRemoteControlInitState = _T("RemoteControlInitState");
LPCTSTR g_lpszClientChangeTVChannel = _T("ChangeTVChannel");

LPCTSTR g_lpszPartner = _T("partner");
LPCTSTR g_lpszWinner = _T("winner");
LPCTSTR g_lpszLosing = _T("losing");
LPCTSTR g_lpszDraw = _T("draw");//ничь€

//Commands
//ABCDEFGHIJKLMNOPQRSTUVWXYZ   
LPCTSTR g_lpszCommandAgree = _T("AGREE")
	_T("%s")//" NO" or ""
	_T("\r\n");
LPCTSTR g_lpszCommandAvailableRegions = _T("AVAILABLE REGIONS")
	_T("%s")//" NEXT" or ""
	_T("\r\n");
LPCTSTR g_lpszCommandBalance = _T("BALANCE")
	_T("\r\n");
LPCTSTR g_lpszCommandCancelFaxJob = _T("CANCEL FAX JOB")
	_T(" %s")//FaxServerID
	_T(" %s")//JobID
	_T("\r\n");
LPCTSTR g_lpszCommandCAPTCHA = _T("CAPTCHA")
	_T(" \"%s\"")//Random Code
	_T(" %ld")//ID
	_T("\r\n");
LPCTSTR g_lpszCommandCAPTCHA_VALUE = _T("CAPTCHA VALUE")
	_T(" \"%s\"")//Code, typed by user
	_T("\r\n");
LPCTSTR g_lpszCommandCAPTCHA_ID = _T("CAPTCHA ID")
	_T("\r\n");
LPCTSTR g_lpszCommandCloseWebClient = _T("CLOSE WEB CLIENT")
	_T(" %s")//GUID
	_T("\r\n");
LPCTSTR g_lpszCommandCommit = _T("COMMIT")
	_T("\r\n");
LPCTSTR g_lpszCommandEventResponseTimeout = _T("EVENT RESPONSE TIMEOUT")//For OnlineTV
	_T(" %s")//guid
	_T("\r\n");
LPCTSTR g_lpszCommandEventResponseWait = _T("EVENT RESPONSE WAIT")//For OnlineTV
	_T(" %s")//guid
	_T(" \"%s\"")//guidRemote
	_T("\r\n");
LPCTSTR g_lpszCommandFAX_DEVICE = _T("FAX DEVICE")
	_T(" \"%s\"")//fax device state
	_T("\r\n");
LPCTSTR g_lpszCommandFaxFileType = _T("FAX FILE TYPE")
	_T(" %s")//Extension
	_T("\r\n");
LPCTSTR g_lpszCommandFaxFileTypeTest = _T("FAX FILE TYPE TEST\r\n");
LPCTSTR g_lpszCommandFee = _T("FEE")
	_T(" %ld")//Fee Hi
	_T(" %ld")//Fee Lo
	_T("\r\n");
LPCTSTR g_lpszCommandFile = _T("FILE")
	_T(" %ld")//FaxID
	_T(" \"%s\"")//File name
	_T(" %s")//base64 data
	_T("\r\n");
LPCTSTR g_lpszCommandFileEnd = _T("FILE END")
	_T(" %ld")//FaxID
	_T("\r\n");
LPCTSTR g_lpszCommandFindBestFaxGateway = _T("FIND BEST FAX GATEWAY")
	_T(" \"%s\"")//Country code
	_T(" \"%s\"")//City code
	_T("\r\n");
LPCTSTR g_lpszCommandGameOver = _T("GAME OVER")
	_T(" %s")//"losing" or "winner" or "draw"(ничь€)
	_T("\r\n");
LPCTSTR g_lpszCommandGetEvents = _T("GET EVENTS")
	_T("\r\n");
LPCTSTR g_lpszCommandGetJobStatus = _T("GET JOB STATUS")
	_T(" \"%s\"")//Job
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T("\r\n");
LPCTSTR g_lpszCommandGUID = _T("GUID")
	_T(" %s")//GUID
	_T("\r\n");
LPCTSTR g_lpszCommandHostAddress = _T("HOST ADDRESS")
	_T(" %s")
	_T("\r\n");
LPCTSTR g_lpszCommandKey = _T("KEY")
	_T("\r\n");
LPCTSTR g_lpszCommandLocation = _T("LOCATION")
/*
	_T(" \"%s\"")//Country
	_T(" %ld")//Country code
	_T(" \"%s\"")//City
	_T(" %ld")//City code
*/
	_T(" \"%s\"")//Phone number
	_T("\r\n");
LPCTSTR g_lpszCommandLocationDelete = _T("LOCATION DELETE")
	_T(" %ld")//ID
	_T("\r\n");
LPCTSTR g_lpszCommandLocationItem = _T("LOCATION ITEM")
	_T(" %ld")//ID
	_T(" \"%s\"")//Country
	_T(" %s")//Country code
	_T(" \"%s\"")//City
	_T(" %s")//City code
	_T(" %ld")//Cost Hi
	_T(" %ld")//Cost Lo
	_T(" %d")//Call type
	_T("\r\n");
LPCTSTR g_lpszCommandLocationItemTest = _T("LOCATION ITEMTEST")
	_T(" %ld")//ID
	_T(" \"%s\"")//Country
	_T(" %s")//Country code
	_T(" \"%s\"")//City
	_T(" %s")//City code
	_T(" %ld")//Cost Hi
	_T(" %ld")//Cost Lo
	_T(" %d")//Call type
	_T("\r\n");
LPCTSTR g_lpszCommandLocations = _T("LOCATIONS")//Asks all locations for current Fax Gateway
	_T("\r\n");
LPCTSTR g_lpszCommandLogon = _T("LOGIN")
	_T(" \"%s\"")//User name
	_T("\r\n");
LPCTSTR g_lpszCommandPassword = _T("PASS")
	_T(" %s")//password
	_T("\r\n");
LPCTSTR g_lpszCommandPasswordState = _T("PASS STATE")
	_T("\r\n");
//LPCTSTR g_lpszCommandPhaseSetGuid = _T("PHASE SET GUID")
//	_T("\r\n");
LPCTSTR g_lpszCommandPing = _T("PING")
	_T("\r\n");
LPCTSTR g_lpszCommandPong = _T("PONG")
	_T("\r\n");
LPCTSTR g_lpszCommandPlayersList = _T("PLAYERS LIST")
	_T("\r\n");
LPCTSTR g_lpszCommandRealMoney = _T("REAL MONEY")
	_T("%s")//" NO" or ""
	_T("\r\n");
LPCTSTR g_lpszCommandRecipientPhoneNumber = _T("RECIPIENT PHONE NUMBER")
	_T(" \"%s\"")//Prefix
	_T(" \"%s\"")//RecipientPhoneNumber
	_T(" \"%s\"")//ResipientName
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlAddTVChannels = _T("REMOTE CONTROL ADD TV CANNELS")
	_T(" GUID %s")
	_T(" USER LANGUAGE \"%s\"")
	_T(" COUNTRY ID \"%s\"")
	_T(" CITY ID \"%s\"")
	_T(" CATEGURY ID \"%s\"")
	_T(" LANGUAGE ID \"%s\"")
	_T(" FETCH %ld")
	_T(" REMOTE CONTROL %d")
	_T(" DELETED %d")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlCancel = _T("REMOTE CONTROL CANCEL")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlDetectRTMPStream = _T("REMOTE CONTROL DETECT RTMP STREAM")
	_T(" GUID %s")
	_T(" %s")//true/false
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlInitID = _T("REMOTE CONTROL INIT ID")
	_T(" %d")
	_T(" GUID %s")
	_T(" GUID REMOTE %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlInitState = _T("REMOTE CONTROL INIT STATE")
	_T(" %d")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlIsPageExists = _T("REMOTE CONTROL IS PAGE EXISTS")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVChannel = _T("REMOTE CONTROL TV CHANNEL")
	_T(" GUID %s")
	_T(" TV Channel ID \"%s\"")
	_T(" File \"%s\"")
	_T(" Streamer \"%s\"")
	_T(" Logo \"%s\"")
	_T(" Country \"%s\"")
	_T(" Category \"%s\"")
	_T(" Language \"%s\"")
	_T(" TVPlayerID %ld")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVChannelPreview = _T("REMOTE CONTROL TV CHANNEL")
	_T(" Preview %s")
	_T(" GUID %s")
	_T(" TV Channel ID \"%s\"")
	_T(" File \"%s\"")
	_T(" Streamer \"%s\"")
	_T(" TVPlayerID %ld")
	_T(" TVchannelName \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerError = _T("REMOTE CONTROL TV PLYER ERROR")
	_T(" \"%s\"")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerMode = _T("REMOTE CONTROL TV PLYER MODE")
	_T(" \"%s\"")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerMute = _T("REMOTE CONTROL TV PLYER MUTE")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerPause = _T("REMOTE CONTROL TV PLYER PAUSE")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerReload = _T("REMOTE CONTROL TV PLYER RELOAD")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerState = _T("REMOTE CONTROL TV PLYER STATE")
	_T(" %d")//NO_TV_PLAYER: 0
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlTVPlayerVolume = _T("REMOTE CONTROL TV PLYER VOLUME")
	_T(" %d")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlUpdateGUID = _T("REMOTE CONTROL UPDATE GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemoteControlUpdateTVChannel = _T("REMOTE CONTROL UPDATE TV CHANNEL")
	_T(" %s")
	_T("\r\n");
LPCTSTR g_lpszCommandRemove = _T("REMOVE")
	_T(" Fax %ld")
	_T(" Job %ld.")
	_T("\r\n");
LPCTSTR g_lpszCommandShareit = _T("SHAREIT")
	_T("\r\n");
LPCTSTR g_lpszCommandServerName = _T("SERVER NAME")
	_T(" \"%s\"")//Server name
	_T("\r\n");
LPCTSTR g_lpszCommandTable = _T("TABLE")
	_T(" %s")//Table ID
	_T(" %d")//nPosition
	_T("\r\n");
LPCTSTR g_lpszCommandTVStreamerState = _T("TV STREAMER STATE")
	_T(" %s")//error, playing
	_T(" TVStreamerID %ld")
	_T(" PlayerError %ld")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandUpdateFaxJobJobID = _T("UPDATE FAX")
	_T(" JOB %ld")
	_T(" JOBID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandUserID = _T("USER ID")
	_T(" %ld")//UserID
	_T(" TAB %d")//Folder ID
	_T(" WEB CLIENT ID %s")
	_T("\r\n");
LPCTSTR g_lpszCommandVersion = _T("VERSION")
	_T(" %s")//PhoneClient/PhoneServer <version>
	_T("\r\n");

//Responces
LPCTSTR g_lpszSend1 = _T("1 %s version %s ready\r\n");
LPCTSTR g_lpszSend2 = _T("2 Bad sequence of commands: %s\r\n");
LPCTSTR g_lpszSend3 = _T("3 Player:")
	_T(" \"%s\"")//Nickname
	_T(" %s")//Partner
	_T("\r\n");
LPCTSTR g_lpszSend6 = _T("6 Invalid name\r\n");
LPCTSTR g_lpszSend7 = _T("7 Table ok.\r\n");
LPCTSTR g_lpszSend8 = _T("8 The player %s already sits at the table.");
LPCTSTR g_lpszSend11 = _T("11 GUID ok.\r\n");
LPCTSTR g_lpszSend12 = _T("12 Username ok.\r\n");
LPCTSTR g_lpszSend13 = _T("13 %s\r\n");//Key response
//LPCTSTR g_lpszSend14 = "14 GUID ok.\r\n";
LPCTSTR g_lpszSend14 = _T("14 Pass ok.\r\n");
LPCTSTR g_lpszSend15 = _T("15 Password supplied for \"%s\" is incorrect\r\n");
LPCTSTR g_lpszSend16 = _T("16 No Pass.\r\n");
//LPCTSTR g_lpszSend15 = "15 Table ok.\r\n";
LPCTSTR g_lpszSend17 = _T("17 Database error: %s\r\n");
LPCTSTR g_lpszSend18 = _T("18 Your account still unconfirmed.\r\n");
//LPCTSTR g_lpszSend19 = "19 Invalid Pass.\r\n";
LPCTSTR g_lpszSend19 = _T("19 Define key first. Use KEY command for it\r\n");
LPCTSTR g_lpszSend21 = _T("21 Username ok. Pass incorrect.\r\n");
LPCTSTR g_lpszSend23 = _T("23 Incorrect version of client. Please update your version.\r\n");
LPCTSTR g_lpszSend25 = _T("25 Version ok.\r\n");
LPCTSTR g_lpszSend26 = _T("26 \"%s\"")//Nickname
	_T(" Fee")
	_T(" %ld")//Fee Hi
	_T(" %ld")//Fee Lo
	_T(" Prize")
	_T(" %ld")//Prize Hi
	_T(" %ld")//Prize Lo
	_T(" Play %d")//1- is play fee, 0 - no play fee
	_T(" Real Money %d")//1 - is real money, 0 - no real money
	_T("\r\n");
LPCTSTR g_lpszSend27 = _T("27 RealMoney")
	_T(" \"%s\"")//Nickname
	_T("%s")//"" or " no"
	_T("\r\n");
LPCTSTR g_lpszSend28 = _T("28 Remove")
	_T(" \"%s\"")//Nickname
	_T("\r\n");
LPCTSTR g_lpszSend29 = _T("29 Agree")
	_T(" \"%s\"")//Nickname
	_T("%s")//"" or " no"
	_T("\r\n");
LPCTSTR g_lpszSend30 = _T("30 PlayGame.\r\n");
LPCTSTR g_lpszSend70 = _T("70 Balance zero.\r\n");
LPCTSTR g_lpszSend71 = _T("71 Balance too small.\r\n");
LPCTSTR g_lpszSend72 = _T("72 Balance:")
	_T(" %ld")//balance Hi
	_T(" %ld")//balance Lo
	_T("\r\n");
LPCTSTR g_lpszSend73 = _T("73 Type the PASS command first.\r\n");
LPCTSTR g_lpszSend74 = _T("74 Find the Money Transactions Total in the database failed!\r\n");
LPCTSTR g_lpszSend75 = _T("75 You can increase fee only.\r\n");
LPCTSTR g_lpszSend77 = _T("77 Please update version.\r\n");
LPCTSTR g_lpszSend96 = _T("96 CAPTCHA ok\r\n");
LPCTSTR g_lpszSend97 = _T("97 CAPTCHA failed!")
	_T(" %s")
	_T("\r\n");
LPCTSTR g_lpszSend98 = _T("98 CAPTCHA ID ")
	_T(" %ld")
	_T("\r\n");
LPCTSTR g_lpszSend100 = _T("100 Send the CAPTCHA value first.\r\n");
LPCTSTR g_lpszSend101 = _T("101 CAPTCHA VALUE ok\r\n");
LPCTSTR g_lpszSend102 = _T("102 CAPTCHA VALUE failed!\r\n");
LPCTSTR g_lpszSend103 = _T("103 Game over first.\r\n");
LPCTSTR g_lpszSend104 = _T("104 Play game first.\r\n");
LPCTSTR g_lpszSend105 = _T("105 Client corruption. Probably you or/and another players use pirate copy of the game software. Please remove this software from your PC, download our legal software from our site and run game again.\r\n");
LPCTSTR g_lpszSend106 = _T("106 Prize:")
	_T(" %ld")//Prize Hi
	_T(" %ld")//Prize Lo
	_T(" %s")//Opponent
	_T("\r\n");
LPCTSTR g_lpszSend107 = _T("107 Can not get balance")
	_T(" \"%s\"")//Nickname
	_T("\r\n");
LPCTSTR g_lpszSend108 = _T("108")
	_T(" \"%s\"")//Nickname
	_T(" Balance too small.\r\n");
LPCTSTR g_lpszSend109 = _T("109 Not all players agree to play for real money.\r\n");
LPCTSTR g_lpszSend110 = _T("110 Not all players agree to play for training.\r\n");
LPCTSTR g_lpszSend111 = _T("111 All players agree to play for real money.\r\n");
LPCTSTR g_lpszSend112 = _T("112 No real money.\r\n");
LPCTSTR g_lpszSend113 = _T("113 Unknown application.\r\n");
LPCTSTR g_lpszSend114 = _T("114 Access denied! The localhost is available only.");
LPCTSTR g_lpszSend115 = _T("115")
	_T(" Fax %ld.")//Fax ID
	_T(" Status = %d\r\n");
LPCTSTR g_lpszSend116 = _T("116")
	_T(" Fax %ld.")//Fax ID
	_T(" The recipient phone number access denied.\r\n");
LPCTSTR g_lpszSend117 = _T("117")
	_T(" Fax %ld.")
	_T(" Error: %s\r\n");//See job error in g_lpszSend147
LPCTSTR g_lpszSend118 = _T("118 Location ok\r\n");
LPCTSTR g_lpszSend119 = _T("119")
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T(" Recipient phone number ok.\r\n");
LPCTSTR g_lpszSend120 = _T("120")
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T(" JobID: %s")
	_T("; Job Status: %d")//Job status
	_T("; Job Ext Status %d")//Job ext status
	_T("; Resipient Name: \"%s\"")
	_T("; Resipient Number: \"%s\"")
	_T("; TransmissionStart = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
	_T("; TransmissionEnd = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
	_T("\r\n");
LPCTSTR g_lpszSend121 = _T("121")
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T(" CountryCode: %s")
	_T("; CityCode: %s")
	_T("; JobID: %s")
	_T("; Job Status = 0x%x")
	_T("; Pages = %ld")
	_T("; Size = %ld")
	_T("; CurrentPage = %ld")
	_T("; DeviceId = %ld")
	_T("; CSID: \"%s\"")
	_T("; TSID: \"%s\"")
	_T("; ExtendedStatusCode = 0x%x")
	_T("; ExtendedStatus: \"%s\"")
	_T("; AvailableOperations = 0x%x")
	_T("; Retries = %ld")
	_T("; JobType = 0x%x")
	_T("; ScheduledTime = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
	_T("; TransmissionStart = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
	_T("; TransmissionEnd = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
	_T("; CallerId : \"%s\"")
	_T("; RoutingInformation : \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszSend122 = _T("122 User ID ok.\r\n");
LPCTSTR g_lpszSend123 = _T("123")
	_T(" Job %ld.")
	_T(" Error: %s\r\n";)
LPCTSTR g_lpszSend124 = _T("124")
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T(" No job was detected.\r\n");
LPCTSTR g_lpszSend125 = _T("125")//See g_lpszSend148 also
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T(" Status = %d")//VCUE::CTableFax::status
	_T(" Ext Status = %d")//JobExtStatus::enumJobExtStatus
	_T("\r\n");
LPCTSTR g_lpszSend126 = _T("126")
	_T(" FaxServer %s;")
	_T(" JobID %s.")
	_T(" No job was detected.\r\n");
LPCTSTR g_lpszSend127 = _T("127")
	_T(" FaxServer %s;")
	_T(" JobID %s.")
	_T(" cancelled successfully.\r\n");
LPCTSTR g_lpszSend128 = _T("128 Remove")
	_T(" Fax %ld")
	_T(" Job %ld.")
	_T("\r\n");
LPCTSTR g_lpszSend129 = _T("129 Fax server is not registered.\r\n");
LPCTSTR g_lpszSend130 = _T("130 Fax server")
	_T(" \"%s\"")//Owner
	_T(" \"%s\"")//PhoneNumber
	_T(" %d")//Locations count
	_T(" %d")//LanguageID
	_T("\r\n");
LPCTSTR g_lpszSend131 = _T("131 location failed.")
	_T(" \"%s\"")//Error
	_T("\r\n");
LPCTSTR g_lpszSend132 = _T("132 location item failed.")
	_T(" \"%s\"")//Error
	_T("\r\n");
LPCTSTR g_lpszSend133 = _T("133 Location item ok\r\n");
LPCTSTR g_lpszSend134 = _T("134 Location item")
	_T(" %ld")//ID;
	_T(" \"%s\"")//Country
	_T(" %s")//CountryCode
	_T(" \"%s\"")//City
	_T(" %s")//CityCode
//	_T(" %s")//Cost
	_T(" %ld")//Cost Hi
	_T(" %ld")//Cost Lo
	_T(" %d")//callType
	_T(" BestCost: %ld")//BestCost Hi
	_T(" %lu")//BestCost Lo
	_T("\r\n");
LPCTSTR g_lpszSend135 = _T("135 Commit ok.")
	_T(" %d")//Locations count
	_T("\r\n");
LPCTSTR g_lpszSend135fail = _T("135 Commit failed.")
	_T(" %s")//Error
	_T("\r\n");
LPCTSTR g_lpszSend136 = _T("136")
	_T(" FaxServer %s")
	_T(" Message ID %s")
	_T(" deleted successfully.\r\n");
LPCTSTR g_lpszSend137 = _T("137")
	_T(" FaxServer %s;")
	_T(" JobID %s.")
	_T(" Not detected.\r\n");
LPCTSTR g_lpszSend138 = _T("138")
	_T(" Fax %ld;")
	_T(" Job %ld;")
	_T(" My cost %ld")//Hi
	_T(" %ld")//Lo
	_T("\r\n");
LPCTSTR g_lpszSend139 = _T("139")
	_T(" Job %ld;")
	_T(" JobID: %s;")
	_T(" Pages %ld")
	_T("\r\n");
LPCTSTR g_lpszSend140 = _T("140")
	_T(" Fax %ld;")
	_T(" Job %ld;")
	_T(" CostLimit: %ld")//Hi
	_T(" %lu;")//Lo
//	_T(" CostTotal: %ld")//Hi
//	_T(" %lu")//Lo
	_T(" CostTotal: %s")//Hi
	_T("\r\n");
LPCTSTR g_lpszSend141 = _T("141 Location item test ok.")
	_T(" BestCost: %ld")//Hi
	_T(" %lu")//Lo
	_T("\r\n");
LPCTSTR g_lpszSend142 = _T("142 No events")
	_T("\r\n");
LPCTSTR g_lpszSend143 = _T("143 AvailableGegion")
	_T(" Code \"%s\"")
	_T("; Country \"%s\"")
	_T("; City \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszSend144 = _T("144")
	_T(" Best cost: %ld")//Hi
	_T(" %lu")//Lo
	_T("; Country: \"%s\"")
	_T("; City: \"%s\"")
	_T("; File type: \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszSend145 = _T("145")
	_T(" Added = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
    _T(".%d")//fraction;
	_T("; ShareItID = %ld")
	_T("; Product: \"%s\"")//We received an order for your product "Faxing via Internet".

//We have received payment in full.

//Please send out the license key or full version of the program to the user:
	_T("; Program = %ld")//Program                           = 300456276
	_T("; NumberOfLicenses = %ld")//Number of licenses                = 1
	_T("; ShareItRef = %ld")//ShareIt Ref #                     = 384636155
	_T("; Reseller: \"%s\"")//Reseller                          = 
	_T("; PromotionName: \"%s\"")//Promotion name                    = 

	_T("; strCurrency: \"%s\"")//USD
	_T("; NetSales %ld")//Lo
	_T(" %ld")//
	_T("; NetDiscount %ld")//Lo
	_T(" %ld")//Hi
	_T("; CollectedVAT %ld")//Lo
	_T(" %ld")//Hi
	_T("; Shipping %ld")//Lo
	_T(" %ld")//Hi
	_T("; VATOnShipping %ld")//Lo
	_T(" %ld")//Hi
	_T("; Total %ld")//Lo
	_T(" %ld")//Hi

//Account information:
	_T("; Salutation: \"%s\"")//Salutation          = 
	_T("; Title: \"%s\"")//Title               = 
	_T("; LastName: \"%s\"")//Last Name           = Hristoliubov
	_T("; FirstName: \"%s\"")//First Name          = Andrej
	_T("; Company: \"%s\"")//Company             = 
	_T("; Street: \"%s\"")//Street              = Ap. 186, House 17 k.3, Shvernika str
	_T("; ZIP: \"%s\"")//ZIP                 = 117449
	_T("; City: \"%s\"")//City                = Moscow
//	CString m_strFullCity//FullCity            = 117449 Moscow
	_T("; Country: \"%s\"")//Country             = Russian Federation
	_T("; StateProvince: \"%s\"")//State / Province    = 
	_T("; Phone: \"%s\"")//Phone               = 
	_T("; Fax: \"%s\"")//Fax                 = 
	_T("; EMail: \"%s\"")//E-Mail              = anhr@mainpine.com
	_T("; VATID: \"%s\"")//VAT ID              = 
	_T("; Payment: \"%s\"")//Payment             = PayPal
	_T("; RegistrationName: \"%s\"")//Registration name   = Andrej Hristoliubov
	_T("; Language: \"%s\"")//Language            = Russian

//Additional information: 
	_T("; DeliveryType: \"%s\"")//The customer selected the following delivery type: electronic.

	_T("; Error = %ld")
	_T("; SentDate = ")
		_T("%d")//wYear;
    _T(".%d")//wMonth;
    _T(".%d")//wDay;
    _T(" %d")//wHour;
		_T(":%d")//wMinute;
    _T(":%d")//wSecond;
    _T(".%d")//fraction;
	_T("\r\n");
LPCTSTR g_lpszSend146 = _T("146 ")
	_T(" %s")//Error
	_T("\r\n");
LPCTSTR g_lpszSend147 = _T("147")
	_T(" Job %ld.")
	_T(" Error: %s\r\n");//See fax error in g_lpszSend117
LPCTSTR g_lpszSend148 = _T("148")//Also see g_lpszSend125
	_T(" Fax %ld;")
	_T(" Job %ld.")
	_T("; Job Status = 0x%x")//FAX_JOB_STATUS_ENUM from CString CFaxServer::GetJobStatus(FAX_JOB_STATUS_ENUM faxJobStatusEnum, ULONG lJobID) from Fax project
	_T("; ExtendedStatusCode = 0x%x")//FAX_JOB_EXTENDED_STATUS_ENUM from CString CFaxServer::GetJobExtendedStatus(FAX_JOB_EXTENDED_STATUS_ENUM faxJobExtendedStatusEnum) from Fax project
	_T("\r\n");
LPCTSTR g_lpszSend149 = _T("149")
	_T(" Fax %ld;")
	_T(" Next file part.")
	_T("\r\n");
LPCTSTR g_lpszSend150 = _T("150")
	_T(" FaxServer %s;")
	_T(" Fax %ld;")
	_T(" File part %ld;")
	_T(" File size %ld")
	_T("\r\n");
LPCTSTR g_lpszSend151 = _T("151")
	_T(" GUID %s")
	_T("\r\n");
LPCTSTR g_lpszSend152 = _T("152 TV Channel.")
	_T(" TV Channel ID \"%s\"")
	_T(" File: \"%s\"")
	_T(" Streamer: \"%s\"")
	_T(" Logo \"%s\"")
	_T(" Country \"%s\"")
	_T(" Category \"%s\"")
	_T(" Language \"%s\"")
	_T(" TVPlayerID %ld")
	_T("\r\n");
LPCTSTR g_lpszSend153 = _T("153 Remote Control Cancel")
//	_T(" %d")//1 - success. 0 - failed
	_T("\r\n");
LPCTSTR g_lpszSend154 = _T("154 Remote Control Cancel")
	_T(" GUID %s")
	_T(" %d")//1 - success. 0 - failed
	_T("\r\n");
LPCTSTR g_lpszSend155 = _T("155 Remote Control Page")
	_T(" GUID %s")
	_T(" %d")//1 - exists. 0 - failed
	_T("\r\n");
LPCTSTR g_lpszSend156 = _T("156 TV update GUID %s")
	_T("\r\n");
LPCTSTR g_lpszSend157 = _T("157 Next TV Channel ID")
	_T(" %ld")
	_T("\r\n");
/*
//Ќе работает потому что количество параметров 10 превысило допустимое 9. —мотри Regexp::enum { NSUBEXP = 10 };
LPCTSTR g_lpszSend158 = _T("158 TV Channel")
	_T(" ID %ld")
	_T(" Name \"%s\"")
	_T(" File \"%s\"")
	_T(" Streamer \"%s\"")
	_T(" Status %d")
	_T(" Logo \"%s\"")
	_T(" Speed %ld")
	_T(" Region \"%s\"")
	_T(" Category \"%s\"")
	_T(" Language \"%s\"")
//				_T(" Checked %d")
	_T("\r\n");
*/
LPCTSTR g_lpszSend159 = _T("159 Listen RTMPSuck.")
	_T(" File: \"%s\"")
	_T(" Streamer: \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszSend160 = _T("160 TV Player Reload.")
	_T("\r\n");
LPCTSTR g_lpszSend161 = _T("161 TV Player Mute.")
	_T("\r\n");
LPCTSTR g_lpszSend162 = _T("162 TV Player Pause.")
	_T("\r\n");
LPCTSTR g_lpszSend163 = _T("163 TV Player Mode")
	_T(" \"%s\"")
	_T("\r\n");
LPCTSTR g_lpszSend164 = _T("164 TV Player State")
	_T(" %d")
/*
	_T(" Mute %d")
	_T(" Playback %s")//IDLE, BUFFERING, PLAYING, PAUSED
	_T(" Volume %d")
	_T(" TVChannelID %ld")
*/
	_T("\r\n");
LPCTSTR g_lpszSend165 = _T("165 TV Player Volume")
	_T(" %d")
	_T("\r\n");
LPCTSTR g_lpszSend166 = _T("166 TV Streamer State")
	_T(" %s")
	_T(" %ld")//StreamerID
	_T(" PlayerError %ld")
	_T("\r\n");
LPCTSTR g_lpszSend167 = _T("167 Preview %s.")
	_T(" TV Channel ID \"%s\"")
	_T(" File: \"%s\"")
	_T(" Streamer: \"%s\"")
	_T(" TVPlayerID %ld")
	_T(" TVchannelName \"%s\"")
	_T("\r\n");

