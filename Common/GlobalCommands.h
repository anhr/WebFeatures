//GlobalCommands.h

#pragma once

//For fax
#define TAB "tab"
#define TAB_SENT_ITEMS "SentItems"
#define TAB_OUTBOX "Outbox"

enum Tab
{
	outbox//0
	, sentItems//1
};

struct JobExtStatus
{
	enum enumJobExtStatus
	{
		unknown//0
		, JobAdded//1
		, JobRemoved//2
		, JobNotDetected//3
		, JobCanceled//4
		, jobUnavailable//5
		, JobCancelling//6
		, JobInProgress//7
		, JobCancelling2//8
		, JobCompleted//9
		, JobRemoving//10
		, JobNoApplicationAssociated//11 No application is associated with the specified file for this operation." (0x80070483)Operation failed.
		, OutgoingMessageAdded//12 move job to the Sent Items folder
		, JobRetriesExceeded//13 The fax server exceeded the maximum number of retransmission attempts allowed. The fax will not be sent.
		, JobInProgressEFax//14
		, JobNoAnswer//15 Curerently use in eFax only
		, SendFaxFailed//16
	}m_JobExtStatus;
};

extern LPCTSTR g_lpszClientFaxServerService;//"FaxServerService"
extern LPCTSTR g_lpszClientFaxServerServiceOptions;//"FaxServerServiceOptions";
extern LPCTSTR g_lpszClientWebFax;//"WebFax"
extern LPCTSTR g_lpszClientSpades;//"Spades";
extern LPCTSTR g_lpszClientHearts;//"Hearts";
extern LPCTSTR g_lpszClientOnlineTV;//"OnlineTV";
extern LPCTSTR g_lpszClientTVPlayer;//"TVPlayer"
extern LPCTSTR g_lpszClientRemoteControl;//"RemoteControl";
extern LPCTSTR g_lpszClientRemoteControlInitState;//"RemoteControlInitState"
extern LPCTSTR g_lpszClientChangeTVChannel;//"ChangeTVChannel";

//extern LPCTSTR g_lpszPartner;//"partner";
extern LPCTSTR g_lpszPartner;//"partner";
extern LPCTSTR g_lpszWinner;//"winner";
extern LPCTSTR g_lpszLosing;//"losing";
extern LPCTSTR g_lpszDraw;//"draw";//ничь€

//Commands

extern LPCTSTR g_lpszCommandAgree;//"AGREE%s\r\n";
extern LPCTSTR g_lpszCommandAvailableRegions;//"AVAILABLE REGIONS%s\r\n";
extern LPCTSTR g_lpszCommandBalance;//"BALANCE\r\n";
extern LPCTSTR g_lpszCommandCancelFaxJob;//"CANCEL FAX JOB %s %s\r\n";
extern LPCTSTR g_lpszCommandCAPTCHA;//"CAPTCHA \"%s\" %ld\r\n";
extern LPCTSTR g_lpszCommandCAPTCHA_ID;//"CAPTCHA ID\r\n";
extern LPCTSTR g_lpszCommandCAPTCHA_VALUE;//"CAPTCHA VALUE \"%s\"\r\n";
extern LPCTSTR g_lpszCommandCloseWebClient;//CLOSE WEB CLIENT %s\r\n";
extern LPCTSTR g_lpszCommandCommit;//_T("COMMIT\r\n");
extern LPCTSTR g_lpszCommandEventResponseTimeout;//_T("EVENT RESPONSE TIMEOUT %s\r\n");
extern LPCTSTR g_lpszCommandEventResponseWait;// _T("EVENT RESPONSE WAIT %s \"%s\"\r\n");//For OnlineTV
extern LPCTSTR g_lpszCommandFAX_DEVICE;//_T("FAX DEVICE \"%s\"\r\n);
extern LPCTSTR g_lpszCommandFaxFileType;//_T("FAX FILE TYPE %s\r\n");
extern LPCTSTR g_lpszCommandFaxFileTypeTest;// = _T("FAX FILE TYPE TEST\r\n");
extern LPCTSTR g_lpszCommandFee;//"FEE %ld %ld\r\n";
extern LPCTSTR g_lpszCommandFile;//"FILE %ld '%s' %s\r\n";
extern LPCTSTR g_lpszCommandFileEnd;//"FILE END %ld\r\n"
extern LPCTSTR g_lpszCommandFindBestFaxGateway;//_T("FIND BEST FAX GATEWAY \"%s\" \"%s\"\r\n");
extern LPCTSTR g_lpszCommandGameOver;//"GAME OVER %s\r\n"//"losing" or "winner"
extern LPCTSTR g_lpszCommandGetEvents;//"GET EVENTS"\r\n"
extern LPCTSTR g_lpszCommandGetJobStatus;//"GET JOB STATUS '%s' FaxID = %ld; JobID = %ld\r\n";
extern LPCTSTR g_lpszCommandGUID;//"GUID %s\r\n";
extern LPCTSTR g_lpszCommandHostAddress;//"HOST ADDRESS %s\r\n";
extern LPCTSTR g_lpszCommandKey;//"KEY\r\n";
extern LPCTSTR g_lpszCommandLocation;//"LOCATION '%s'\r\n";
extern LPCTSTR g_lpszCommandLocationDelete;//_T("LOCATION DELETE %ld\r\n");
extern LPCTSTR g_lpszCommandLocationItem;//_T("LOCATION ITEM  %ld \"%s\" %s" \"%s\" %s %ld %ld %d\r\n
extern LPCTSTR g_lpszCommandLocationItemTest;//_T("LOCATION ITEMTEST %ld \"%s\" %s" \"%s\" %s %ld %ld %d\r\n
extern LPCTSTR g_lpszCommandLocations;//_T("LOCATIONS\r\n");//Asks all locations for current Fax Gateway
extern LPCTSTR g_lpszCommandLogon;//"LOGIN %s\r\n";
extern LPCTSTR g_lpszCommandPassword;//"PASS %s\r\n";
extern LPCTSTR g_lpszCommandPasswordState;//"PASS STATE\r\n";
//extern LPCTSTR g_lpszCommandPhaseSetGuid;//"PHASE SET GUID\r\n";
extern LPCTSTR g_lpszCommandPing;// = "PING"
extern LPCTSTR g_lpszCommandPong;// = "PONG"
extern LPCTSTR g_lpszCommandPlayersList;//"PLAYERS LIST\r\n";
extern LPCTSTR g_lpszCommandRealMoney;//"REAL MONEY%s\r\n";
extern LPCTSTR g_lpszCommandRecipientPhoneNumber;//"RECIPIENT PHONE NUMBER '%s' '%s' FaxID = %ld; JobID = %ld\r\n";
extern LPCTSTR g_lpszCommandRemoteControlAddTVChannels;//"REMOTE CONTROL ADD TV CANNELS GUID %s USER LANGUAGE \"%s\" COUNTRY ID \"%s\" CITY ID \"%s\" CATEGURY ID \"%s\" LANGUAGE ID \"%s\" FETCH %ld REMOTE CONTROL %d DELETED %d\r\n"
extern LPCTSTR g_lpszCommandRemoteControlCancel;//"REMOTE CONTROL CANCEL GUID %s\r\n
extern LPCTSTR g_lpszCommandRemoteControlDetectRTMPStream;//"REMOTE CONTROL DETECT RTMP STREAM GUID %s %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlInitID;//"REMOTE CONTROL INIT ID %d GUID %s GUID REMOTE %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlInitState;//"REMOTE CONTROL INIT STATE %d GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlIsPageExists;//"REMOTE CONTROL IS PAGE EXISTS GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVChannel;//"REMOTE CONTROL TV CHANNEL GUID %s TV Channel ID \"%s\" File \"%s\" Streamer \"%s\" Logo \"%s\" Country \"%s\" Category \"%s\" Language \"%s\" TVPlayerID %ld\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVChannelPreview;//"REMOTE CONTROL TV CHANNEL Preview %s GUID %s TV Channel ID \"%s\" File \"%s\" Streamer \"%s\" TVPlayerID %ld TVchannelName \"%s\"\r\n;
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerError;//"REMOTE CONTROL TV PLYER ERROR \"%s\" GUID %s\r\n
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerMode;//"REMOTE CONTROL TV PLYER MODE "%s" GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerMute;//"REMOTE CONTROL TV PLYER MUTE GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerPause;//"REMOTE CONTROL TV PLYER PAUSE GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerReload;//"REMOTE CONTROL TV PLYER RELOAD GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerState;//"REMOTE CONTROL TV PLYER STATE %d GUID %s\r\n// Mute %d PLAYBACK %s Volume %d TVChannelID %ld\r\n"
extern LPCTSTR g_lpszCommandRemoteControlTVPlayerVolume;//"REMOTE CONTROL TV PLYER VOLUME %d GUID %s\r\n"

extern LPCTSTR g_lpszCommandRemoteControlUpdateGUID;//"REMOTE CONTROL UPDATE GUID %s\r\n"
extern LPCTSTR g_lpszCommandRemoteControlUpdateTVChannel;//"REMOTE CONTROL UPDATE TV CHANNEL %s\r\n"
extern LPCTSTR g_lpszCommandRemove;//"REMOVE Fax %ld Job %ld.\r\n";
extern LPCTSTR g_lpszCommandServerName;//"SERVER NAME '%s'\r\n";
extern LPCTSTR g_lpszCommandShareit;//SHAREIT\r\n"
extern LPCTSTR g_lpszCommandTable;//"TABLE %s %d\r\n";
extern LPCTSTR g_lpszCommandTVStreamerState;//"TV STREAMER STATE %s TVStreamerID %ld PlayerError %ld GUID %s\r\n"
extern LPCTSTR g_lpszCommandUpdateFaxJobJobID;//"UPDATE FAX JOB %ld JOBID %s\r\n"
extern LPCTSTR g_lpszCommandUserID;//"USER ID %ld TAB %d WEB CLIENT ID %s\r\n";
extern LPCTSTR g_lpszCommandVersion;// = "VERSION %s"

//Responces
extern LPCTSTR g_lpszSend1;//"1 %s version %s ready\r\n";
extern LPCTSTR g_lpszSend2;//"2 Bad sequence of commands: %s\r\n";
extern LPCTSTR g_lpszSend3;//"3 Player: '%s' %s\r\n";
extern LPCTSTR g_lpszSend6;//"6 Invalid name\r\n";
extern LPCTSTR g_lpszSend7;//"7 Table ok.\r\n";
extern LPCTSTR g_lpszSend8;//"8 The player %s already sits at the table.
extern LPCTSTR g_lpszSend11;//"11 GUID ok.\r\n";
extern LPCTSTR g_lpszSend12;//"12 Username ok.\r\n";
extern LPCTSTR g_lpszSend13;//"13 %s\r\n";//Key response
extern LPCTSTR g_lpszSend14;//"14 Pass ok.\r\n";
//extern LPCTSTR g_lpszSend14;//"14 GUID ok.\r\n";
//extern LPCTSTR g_lpszSend15;//"15 Table ok.\r\n";
extern LPCTSTR g_lpszSend15;//"15 Password supplied for \"%s\" is incorrect\r\n";
extern LPCTSTR g_lpszSend16;//"16 No Pass.\r\n";
extern LPCTSTR g_lpszSend17;//"17 Database error: %s\r\n";
extern LPCTSTR g_lpszSend18;//"18 Your account still unconfirmed.\r\n";
//extern LPCTSTR g_lpszSend19;//"19 Invalid Pass.\r\n";
extern LPCTSTR g_lpszSend19;//"19 Define key first. Use KEY command for it\r\n";
extern LPCTSTR g_lpszSend21;//"21 Username ok. Pass incorrect.\r\n";
extern LPCTSTR g_lpszSend23;//"23 Incorrect version of client. Please update your version.\r\n";
extern LPCTSTR g_lpszSend25;//"25 Version ok.\r\n";
extern LPCTSTR g_lpszSend26;//"26 '%s' Fee %ld %ld Prize %ld %ld Play %d Real Money %d
extern LPCTSTR g_lpszSend27;//"27 RealMoney '%s'%s\r\n";
extern LPCTSTR g_lpszSend28;//"28 Remove '%s'\r\n";
extern LPCTSTR g_lpszSend29;//"29 Agree '%s'%s\r\n";
extern LPCTSTR g_lpszSend30;//"30 PlayGame.\r\n";
extern LPCTSTR g_lpszSend70;//"70 Balance zero.\r\n";
extern LPCTSTR g_lpszSend71;//"71 Balance too small.\r\n"
extern LPCTSTR g_lpszSend72;//"72 Balance: %ld %ld\r\n";
extern LPCTSTR g_lpszSend73;//"73 Type the PASS command first.\r\n";
extern LPCTSTR g_lpszSend74;//"74 Find the RussianBilling Total in the database failed!\r\n"
extern LPCTSTR g_lpszSend75;//"75 You can not decrease fee.\r\n";
extern LPCTSTR g_lpszSend77;//"77 Please update version.\r\n";
extern LPCTSTR g_lpszSend96;//"96 CAPTCHA ok\r\n";
extern LPCTSTR g_lpszSend97;//"97 CAPTCHA failed! %s\r\n";
extern LPCTSTR g_lpszSend98;//"98 CAPTCHA ID %ld\r\n";
extern LPCTSTR g_lpszSend100;//"100 Send the CAPTCHA value first.\r\n";
extern LPCTSTR g_lpszSend101;//"101 CAPTCHA VALUE ok\r\n";
extern LPCTSTR g_lpszSend102;//"102 CAPTCHA VALUE failed!\r\n";
extern LPCTSTR g_lpszSend103;//"103 Game over first.\r\n";
extern LPCTSTR g_lpszSend104;//"104 Play game first.\r\n";
extern LPCTSTR g_lpszSend105;//"105 Client corruption. Probably you or/and another players use pirate copy of the game software. Please remove this software from your PC, download our legal software from our site and run game again.\r\n";
extern LPCTSTR g_lpszSend106;//"106 Prize: %ld %ld %s\r\n";
extern LPCTSTR g_lpszSend107;//"107 Can not get balance '%s'\r\n";
extern LPCTSTR g_lpszSend108;//"108 '%s' Balance too small.\r\n";
extern LPCTSTR g_lpszSend109;//"109 Not all players agree to play for real money.\r\n";
extern LPCTSTR g_lpszSend110;//"110 Not all players agree to play for training.\r\n";
extern LPCTSTR g_lpszSend111;//"111 All players agree to play for real money.\r\n";
extern LPCTSTR g_lpszSend112;//"112 No real money.\r\n";
extern LPCTSTR g_lpszSend113;//"113 Unknown application.\r\n";
extern LPCTSTR g_lpszSend114;//"114 Access denied! The localhost is available only."
extern LPCTSTR g_lpszSend115;//"115 Fax %ld.Status = %d\r\n";
extern LPCTSTR g_lpszSend116;//"116 %ld The recipient phone number access denied.\r\n";
extern LPCTSTR g_lpszSend117;//"117 Fax %ld. Error: %s\r\n";
extern LPCTSTR g_lpszSend118;//"118 Location ok\r\n";
extern LPCTSTR g_lpszSend119;//"119 Fax %ld; Job %ld. Recipient phone number ok.\r\n";
extern LPCTSTR g_lpszSend120;//"120 Fax %ld; Job %ld. JobID: %s; Job Status: %d; Job Ext Status %d; Resipient Name: '%s'; Resipient Number: '%s'; TransmissionStart = %d.%d.%d %d:%d:%d; TransmissionEnd = %d.%d.%d %d:%d:%d\r\n";
extern LPCTSTR g_lpszSend121;//"121 Fax %ld; Job %ld. CountryCode: %s; CityCode %s; JobID: %s Job Status = 0x%x Pages = %ld Size = %ld CurrentPage = %ld DeviceId = %ld CSID: '%s' TSID: '%s' ExtendedStatusCode = 0x%x ExtendedStatus: '%s' AvailableOperations = 0x%x Retries = %ld JobType = 0x%x ScheduledTime = %d.%d.%d %d:%d:%d TransmissionStart = %d.%d.%d %d:%d:%d TransmissionEnd = %d.%d.%d %d:%d:%d CallerId : '%s' RoutingInformation : '%s'\r\n";
extern LPCTSTR g_lpszSend122;//"122 User ID ok.\r\n";
extern LPCTSTR g_lpszSend123;//"123 Job %ld. Error: %s\r\n";
extern LPCTSTR g_lpszSend124;//"124 Fax %ld; Job %ld. No job was detected.\r\n";
extern LPCTSTR g_lpszSend125;//"125 Fax %ld; Job %ld. Status = %d Ext Status = %d\r\n";
extern LPCTSTR g_lpszSend126;//"126 FaxServer %s; JobID %s. No job was detected.\r\n";
extern LPCTSTR g_lpszSend127;//"127 FaxServer %s; JobID %s. cancelled successfully.\r\n";
extern LPCTSTR g_lpszSend128;//"128 Remove Fax %ld Job %ld.\r\n";
extern LPCTSTR g_lpszSend129;//"129 Fax server is not registered.\r\n");
extern LPCTSTR g_lpszSend130;//"130 Fax server '%s' '%s' %d %d\r\n
extern LPCTSTR g_lpszSend131;//"131 location failed. '%s'"\r\n");
extern LPCTSTR g_lpszSend132;//"132 location item failed. '%s'"\r\n");
extern LPCTSTR g_lpszSend133;//_T("133 Location item ok\r\n");
extern LPCTSTR g_lpszSend134;//_T("134 Location item %ld \"%s\" %s \"%s\" %s %ld %ld %d BestCost: %ld %lu\r\n
extern LPCTSTR g_lpszSend135;//_T("135 Commit ok. %d\r\n");
extern LPCTSTR g_lpszSend135fail;//_T("135 Commit failed. %s\r\n");
extern LPCTSTR g_lpszSend136;//_T("136 FaxServer %s Message ID %s deleted successfully.\r\n"
extern LPCTSTR g_lpszSend137;//_T("137 FaxServer %s JobID %s. Not detected.\r\n");
extern LPCTSTR g_lpszSend138;//_T("138 Fax %ld; Job %ld; My cost %ld %ld\r\n");
extern LPCTSTR g_lpszSend139;//_T("139 Job %ld; JobID: %s; Pages %ld\r\n");
//extern LPCTSTR g_lpszSend140;//_T("140 Fax %ld; Job %ld; CostLimit: %ld %lu; CostTotal: %ld %lu\r\n");
extern LPCTSTR g_lpszSend140;//_T("140 Fax %ld; Job %ld; CostLimit: %ld %lu; CostTotal: %s\r\n");
extern LPCTSTR g_lpszSend141;//_T("141 Location item test ok. BestCost: %ld %lu\r\n");
extern LPCTSTR g_lpszSend142;//_T("142 No events\r\n");
extern LPCTSTR g_lpszSend143;//_T("143 AvailableGegion Code \"%s\"; Country \"%s\"; City \"%s\"\r\n");
extern LPCTSTR g_lpszSend144;//_T("144 Best cost: %ld %lu; Country: \"%s\"; City: \"%s\"; File type: \"%s\"\r\n
extern LPCTSTR g_lpszSend145;//_T("145 Added = %d.%d.%d %d:%d:%d.%d; ShareItID = %ld; Product: \"%s\"; Program = %ld; NumberOfLicenses = %ld; ShareItRef = %ld; Reseller: \"%s\"; PromotionName: \"%s\"; strCurrency: \"%s\"; NetSales %ld %ld; NetDiscount %ld %ld; CollectedVAT %ld %ld; Shipping %ld %ld; VATOnShipping %ld %ld; Total %ld %ld; Salutation: \"%s\"; Title: \"%s\"; LastName: \"%s\"; FirstName: \"%s\"; Company: \"%s\"; Street: \"%s\"; ZIP: \"%s\"; City: \"%s\"; Country: \"%s\"; StateProvince: \"%s\"; Phone: \"%s\"; Fax: \"%s\"; EMail: \"%s\"; VATID: \"%s\"; Payment: \"%s\"; RegistrationName: \"%s\"; Language: \"%s\"; DeliveryType: \"%s\"; Error = %ld; SentDate = %d.%d.%d %d:%d:%d.%d\r\n");
extern LPCTSTR g_lpszSend146;//_T("146 %s\r\n");
extern LPCTSTR g_lpszSend147;//_T("147 Job %ld. Error: %s\r\n");
extern LPCTSTR g_lpszSend148;//_T("148 Fax %ld; Job %ld.; Job Status = 0x%x; ExtendedStatusCode = 0x%x\r\n");
extern LPCTSTR g_lpszSend149;//_T("149 Fax %ld; Next file part.\r\n");
extern LPCTSTR g_lpszSend150;//_T("150 FaxServer %s; Fax %ld; File part %ld; File size %ld"\r\n");
extern LPCTSTR g_lpszSend151;//_T("151 GUID %s\r\n");
extern LPCTSTR g_lpszSend152;//_T("152 TV Channel. TV Channel ID \"%s\" File: \"%s\" lpszStreamer: \"%s\" Logo \"%s\" Country \"%s\" Category \"%s\" Language \"%s\" TVPlayerID %ld\r\n");
//extern LPCTSTR g_lpszSend153;//_T("153 Remote Control Cancel %d\r\n");
extern LPCTSTR g_lpszSend153;//_T("153 Remote Control Cancel\r\n");
extern LPCTSTR g_lpszSend154;//_T("154 Remote Control Cancel GUID %s %d\r\n");
extern LPCTSTR g_lpszSend155;//_T("155 Remote Control Page GUID %s %d\r\n");
extern LPCTSTR g_lpszSend156;//_T("156 TV update GUID %s\r\n");
extern LPCTSTR g_lpszSend157;//_T("157 Next TV Channel ID %ld\r\n")
/*
//Ќе работает потому что количество параметров 10 превысило допустимое 9. —мотри Regexp::enum { NSUBEXP = 10 };
extern LPCTSTR g_lpszSend158;//_T("158 TV Channel ID %ld Name \"%s\" File \"%s\" Streamer \"%s\" Status %d Logo \"%s\" Speed %ld Region \"%s\" Category \"%s\" Language \"%s\"\r\n")
*/
extern LPCTSTR g_lpszSend159;//_T("159 Listen RTMPSuck. File: \"%s\" Streamer: \"%s\"\r\n");
extern LPCTSTR g_lpszSend160;//_T("160 TV Player Reload.\r\n");
extern LPCTSTR g_lpszSend161;//_T("161 TV Player Mute.\r\n");
extern LPCTSTR g_lpszSend162;//_T("162 TV Player Pause.\r\n");
extern LPCTSTR g_lpszSend163;//_T("163 TV Player Mode \"%s\"\r\n");
extern LPCTSTR g_lpszSend164;//_T("164 TV Player State %d\r\n//Mute %d Playback %s Volume %d TVChannelID %ld\r\n");
extern LPCTSTR g_lpszSend165;//_T("165 TV Player Volume %d\r\n"
extern LPCTSTR g_lpszSend166;//"166 TV Streamer State %s %ld PlayerError %ld\r\n
extern LPCTSTR g_lpszSend167;//"167 Preview %s. TV Channel ID \"%s\" File: \"%s\" Streamer: \"%s\" TVPlayerID %ld TVchannelName \"%s\"\r\n
