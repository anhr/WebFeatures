rem run as administrator

cd /D "D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\JS"
set FolderWWW=C:\inetpub\wwwroot\
set jsFolderDest=%FolderWWW%js\
set jsFolderCommon=..\Common\js\

set FolderGoogleSiteWWW=%FolderWWW%GoogleSite\

set jsFolderInputKeyFilter=C:\inetpub\wwwroot\GoogleSite\InputKeyFilter\
set jsFolderMyRequest=C:\inetpub\wwwroot\GoogleSite\MyRequest\
set FolderColorSelector=C:\inetpub\wwwroot\GoogleSite\ColorSelector\
set FolderMyRequest=%FolderGoogleSiteWWW%MyRequest\
set FolderResizer=%FolderGoogleSiteWWW%Resizer\

set FolderGoogleSite=..\GoogleSite\
set jsFolderGoogleSiteInputKeyFilter=..\GoogleSite\InputKeyFilter\
set jsFolderGoogleSiteMyRequest=..\GoogleSite\MyRequest\
set FolderGoogleSiteColorSelector=..\GoogleSite\ColorSelector\
set FolderGoogleSiteMyRequest=%FolderGoogleSite%myRequest\
set FolderGoogleSiteResizer=%FolderGoogleSite%resizer\

rem xcopy /?
xcopy %jsFolderCommon%XMLHttpRequest.js %jsFolderDest%XMLHttpRequest.js /Y
xcopy detectFlash.js %jsFolderDest%detectFlash.js /Y
xcopy detectVLC.js %jsFolderDest%detectVLC.js /Y
xcopy encoder.js %jsFolderDest%encoder.js /Y
xcopy linkToScripts.js %jsFolderDest%linkToScripts.js /Y
xcopy PluginDetect_Flash_VLC.js %jsFolderDest%PluginDetect_Flash_VLC.js /Y
xcopy PluginDetect_Flash_VLC_Debug.js %jsFolderDest%PluginDetect_Flash_VLC_Debug.js /Y
xcopy PluginDetect_Flash_VLC_Readable.js %jsFolderDest%PluginDetect_Flash_VLC_Readable.js /Y
xcopy toggle.js %jsFolderDest%toggle.js /Y
xcopy screenfull.min.js %jsFolderDest%screenfull.js /Y
rem xcopy ajax.js %jsFolderDest%ajax.js /Y
xcopy QueryString.js %jsFolderDest%QueryString.js /Y

xcopy IceLink\app.js %jsFolderDest%IceLink\app.js /Y
xcopy IceLink\localMedia.js %jsFolderDest%IceLink\localMedia.js /Y
xcopy IceLink\signalling.js %jsFolderDest%IceLink\signalling.js /Y

rem peer to peer
rem set jsFolderWebRTCSrc=D:\My documents\MyProjects\Documents\VodeoConferences\webrtc\WebRTC-Experiment\MyWebRTC
set jsFolderWebRTCSrc=..\..\..\..\Documents\VodeoConferences\webrtc\WebRTC-Experiment\MyWebRTC
set jsFolderWebRTCDest=%jsFolderDest%WebRTC
rem xcopy "%jsFolderWebRTCSrc%\PeerConnection.js" %jsFolderWebRTCDest%\PeerConnection.js /Y
xcopy "%jsFolderWebRTCSrc%\websocket.js" %jsFolderWebRTCDest%\websocket.js /Y
xcopy "%jsFolderWebRTCSrc%\commits.js" %jsFolderWebRTCDest%\commits.js /Y
rem xcopy WebRTC\app.js %jsFolderWebRTCDest%\app.js /Y
xcopy soundmeter.js %jsFolderDest%soundmeter.js /Y
xcopy WebRTC\pubnub\pubnub.js %jsFolderDest%WebRTC\pubnub\pubnub.js /Y

rem jquery
set jsFolderJqueryUi_1_11_4_Src=jquery\ui\1.11.4
set jsFolderJqueryUi_1_11_4_Dest=%jsFolderDest%jquery\ui\1.11.4
xcopy "%jsFolderJqueryUi_1_11_4_Src%\jquery-ui.css" %jsFolderJqueryUi_1_11_4_Dest%\jquery-ui.css /Y
xcopy "%jsFolderJqueryUi_1_11_4_Src%\jquery-ui.js" %jsFolderJqueryUi_1_11_4_Dest%\jquery-ui.js /Y

xcopy Common.js %jsFolderDest%Common.js /Y
xcopy Common.js %jsFolderInputKeyFilter%Common.js /Y
xcopy Common.js %jsFolderGoogleSiteInputKeyFilter%Common.js /Y
xcopy Common.js %FolderColorSelector%Common.js /Y
xcopy Common.js %FolderGoogleSiteColorSelector%Common.js /Y
xcopy Common.js %FolderMyRequest%Common.js /Y
xcopy Common.js %FolderGoogleSiteMyRequest%Common.js /Y

xcopy InputKeyFilter.js %jsFolderDest%InputKeyFilter.js /Y
xcopy InputKeyFilter.js %jsFolderInputKeyFilter%InputKeyFilter.js /Y
xcopy InputKeyFilter.js %jsFolderGoogleSiteInputKeyFilter%InputKeyFilter.js /Y

xcopy myRequest.js %jsFolderDest%myRequest.js /Y
xcopy myRequest.js %jsFolderMyRequest%myRequest.js /Y
xcopy myRequest.js %jsFolderGoogleSiteMyRequest%myRequest.js /Y

xcopy ColorSelector.js %jsFolderDest%ColorSelector.js /Y
xcopy ColorSelector.js %FolderColorSelector%ColorSelector.js /Y
xcopy ColorSelector.js %FolderGoogleSiteColorSelector%ColorSelector.js /Y

xcopy "WebRTC\DetectRTC.js" %jsFolderWebRTCDest%\DetectRTC.js /Y

set FolderMyIsapi=..\MyIsapi\
set FolderMyIsapiWeb=C:\inetpub\wwwroot\MyIsapi\

xcopy %FolderMyIsapi%ColorSelector.css %FolderMyIsapiWeb%ColorSelector.css /Y
xcopy %FolderMyIsapi%ColorSelector.css %FolderColorSelector%ColorSelector.css /Y
xcopy %FolderMyIsapi%ColorSelector.css %FolderGoogleSiteColorSelector%ColorSelector.css /Y

xcopy resizer.js %jsFolderDest%resizer.js /Y
xcopy resizer.js %FolderResizer%resizer.js /Y
xcopy resizer.js %FolderGoogleSiteResizer%resizer.js /Y

pause

