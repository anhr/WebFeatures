
function App(videoID, useLocalMedia)
{
    consoleLog('App(' + videoID + ')');

    this.videoID = videoID;
    this.useLocalMedia = useLocalMedia;
    this.remoteVideoControl = null;
    this.peerId = null;

    displayWait(this.videoID, true);

    //ВНИМАНИЕ!!! часть проблем описана в D:\My documents\MyProjects\WebFeatures\Documents\Web site setup Server 2012R2.txt

    //I see
    //Could not connect to WebSync. 801::Invalid domain name
    //if I open http://192.168.1.40/icelink/ page on my mobile phone
    //It works only for http://localhost/icelink page
    //also I see 
    //Could not connect to WebSync. 608::Invalid domain key. The Community Edition is limited to the default domain key.
    //See comments for line 
    //this.websyncClient.setDomainKey(new fm.guid('b508ca84-3b51-423d-b047-0f46553d69fc')); // WebSync On-Demand
    //in the Signalling.prototype.start = function(callback)
    //in the D:\My documents\MyProjects\Documents\VodeoConferences\IceLink\IceLink-2.8.8-Community\Examples\JavaScript.Conference.WebRTC\signalling.js
    //Рабочий сервер
    this.icelinkServerAddress = 'demo.icelink.fm:3478';
    this.websyncServerUrl = 'https://v4.websync.fm/websync.ashx'; // WebSync On-Demand
/*    
    //Рабочий локальный сервер
    this.icelinkServerAddress = '192.168.1.40:3478';
    this.websyncServerUrl = 'https://192.168.1.40:8080/websync.ashx'; // WebSync On-Demand
*/

    //не работает на мобильнике потому что ищет сервер на самом мобильнике
/*
    this.icelinkServerAddress = 'localhost:3478';
    this.websyncServerUrl = 'https://localhost:8080/websync.ashx'; // WebSync On-Demand
*/
    //локальный сервер. Ошибка:
    //Mixed Content: The page at 'https://192.168.1.40/SignalRChat/?browserID=729fe5f9-3588-4b12-bf97-0e115f0ae115&Nickname=111&chatRoom=Chat'
    //was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://192.168.1.40:8080/websync.ashx?token=14905860&src=js&AspxAutoDetectCookieSupport=1'.
    //This request has been blocked; the content must be served over HTTPS.
    //нужно использовать защищенный протокол https://192.168.1.40:8080/websync.ashx
/*
    this.icelinkServerAddress = '192.168.1.40:3478';
    this.websyncServerUrl = 'http://192.168.1.40:8080/websync.ashx'; // WebSync On-Demand
*/

//    this.websyncServerUrl = '192.168.1.40:80803'; // WebSync On-Demand
//    this.websyncServerUrl = 'https://localhost:8080/websync.ashx'; // WebSync On-Demand
    
    //Это работает только на компьютере, на котором запущен этот сервер и веб страница имеет адрес http://localhost/icelink
    //если в Chrome открыть страницу http://192.168.1.40/icelink 
    //то появится сообщение 
    //Could not get media. Only secure origins are allowed (see: https://goo.gl/Y0ZkNV)
    //Это наверно потому что надо соединяться по протоколу SSL
    //
    //В IE EDGE могу отрыть страницу http://192.168.1.40/icelink 
    //но не могу получить доступ к вебкамере если открыть еще одну http://192.168.1.40/icelink  страницу 
    //
    //работает в Firefox на Samsung Galaxy S5
    //
    //для проверки SSL сертификата надо в Chrome открыть https://localhost:8080/websync.ashx  
    //См линию: listener.Start(prefixes, "/websync.ashx");
    //В функции : static void StartWebSyncServerSSL(int port, int sslPort)
    //в файле: D:\My documents\MyProjects\Documents\VodeoConferences\IceLink\IceLink-2.8.8-Community\Examples\NET.Server\Program.cs
    //в пректе: D:\My documents\MyProjects\Documents\VodeoConferences\IceLink\IceLink-2.8.8-Community\Examples\NET.Server.sln
    //Запустить на выполение проект: D:\My documents\MyProjects\Documents\VodeoConferences\IceLink\IceLink-2.8.8-Community\Examples\NET.Server.sln
    //В открвышейся консоли появится предупреждение:
    //WARN  2016/01/14-07:32:35 Could not configure SSL! Does a self-signed certificate exist in the local store?
    //надо добавить self-signed certificate
    //В Windows Server выполнить https://technet.microsoft.com/en-us/library/cc753127(v=ws.10).aspx
        //В Windows 10
        //Открыть IIS
        //перейти на PC2014 (PC2014\Andrej)
        //выбрать Server certificates 
        //Create self-signed certificate
        //ввести icelink (можно любое слово) в поле Specify a friendly name for the certificate
        //Select a certificate store for the new certficate: Personal
        //теперь при запуске NET.Server.sln в консоли появится информация: INFO  2016/01/14-07:43:23 WebSync server started on port 8081.
    //
    //если открыть https://localhost:8080/websync.ashx то появтся сообщение:
    //-------------------------------------------------------------------
    //
    //Ваше подключение не защищено
    //
    //Злоумышленники могут пытаться похитить ваши данные с сайта localhost (например, пароли, сообщения или номера банковских карт).
    //NET::ERR_CERT_COMMON_NAME_INVALID
    //Не удалось подтвердить, что это сервер localhost. Его сертификат безопасности относится к PC2014. Возможно, сервер настроен неправильно или кто-то пытается перехватить ваши данные.
    //
    //если открыть https://localhost:8081/websync.ashx то появтся сообщение:
    // и если открыть https://PC2014:8081/websync.ashx то появтся сообщение:
    //-------------------------------------------------------------------
    //
    //Ошибка подключения SSL
    //
    //ERR_SSL_PROTOCOL_ERROR
    //Не удается создать безопасное соединение с сервером. На сервере могла возникнуть проблема, или необходим сертификат клиентской аутентификации, который у вас отсутствует.
    //
    //если открыть https://PC2014:8080/websync.ashx то появтся сообщение:
    //-------------------------------------------------------------------
    //
    //Веб-страница недоступна
    //
    //ERR_CONNECTION_CLOSED
    //Веб-страница по адресу https://pc2014:8080/websync.ashx, возможно, временно недоступна или постоянно перемещена по новому адресу.
    /*
    this.icelinkServerAddress = '192.168.1.40:3478';
    this.websyncServerUrl = 'http://192.168.1.40:8081/websync.ashx'; // WebSync On-Demand
    */
    
    //for SSL version of the NET.Server
    //Line 
    //StartWebSyncServerSSL(8081, 8080);
    //in the static void Main(string[] args) function
    //in the D:\My documents\MyProjects\Documents\VodeoConferences\IceLink\IceLink-2.8.8-Community\Examples\NET.Server\Program.cs
    //in the NET.Server project
    /*
    this.icelinkServerAddress = '192.168.1.40:3478';
    this.websyncServerUrl = 'https://192.168.1.40:8081/websync.ashx'; // WebSync On-Demand
    */
    /*
    this.icelinkServerAddress = 'PC2014:3478';
    this.websyncServerUrl = 'https://PC2014:8081/websync.ashx'; // WebSync On-Demand
    */

    this.localMedia = null;
    this.signalling = null;

    this.audioStream = null;
    this.videoStream = null;
    this.conference = null;

    this.sessionId = null;

    this.addRemoteVideoControlEvent = this.addRemoteVideoControl.bind(this);
    this.removeRemoteVideoControlEvent = this.removeRemoteVideoControl.bind(this);
    this.logLinkInitEvent = this.logLinkInit.bind(this);
    this.logLinkUpEvent = this.logLinkUp.bind(this);
    this.logLinkDownEvent = this.logLinkDown.bind(this);
//    this.onCreateFailure = this.onCreateFailure.bind(this);

    // For backwards-compability with browsers that do not yet support
    // WebRTC, provide a reference to fm.icelink.webrtc.applet.jar, a
    // Java applet that provides a full WebRTC stack through the exact
    // same JavaScript API you use for modern browsers. You can set this
    // for all browsers - only the ones that need it will use it.
    fm.icelink.webrtc.setApplet({
        path: './fm.icelink.webrtc.applet.jar',
        name: 'IceLink WebRTC for JavaScript'
    });

    // For a better experience in Internet Explorer, provide a reference
    // to FM.IceLink.WebRTC.ActiveX.x86/x64.cab, a pair of controls for
    // ActiveX that provide the same WebRTC stack without Java.
    fm.icelink.webrtc.setActiveX({
        path_x86: './FM.IceLink.WebRTC.ActiveX.x86.cab',
        path_x64: './FM.IceLink.WebRTC.ActiveX.x64.cab'
    });

    fm.icelink.webrtc.setChromeExtension({
        extensionId: 'nidjnlpklmpflfmfflalpddmadlgjckn'
    });
        
    // Log to a DOM container.
    //    fm.log.setProvider(new fm.domLogProvider(logContainer, fm.logLevel.Info));
    fm.log.setProvider(new fm.consoleLogProvider(fm.logLevel.Info));//Debug

}; 

App.prototype.startSignalling = function (callback)
{
    consoleLog('App.prototype.startSignalling()');
    this.signalling = new Signalling(this.websyncServerUrl);
    this.signalling.start(callback);
};

App.prototype.stopSignalling = function(callback)
{
    consoleLog('App.prototype.stopSignalling()');
    if (this.signalling)
    {
        this.signalling.stop(callback);
        this.signalling = null;
    }
};

App.prototype.startLocalMedia = function (videoContainer, captureScreen, callback)
{
    consoleLog('App.prototype.startLocalMedia(videoContainer.id = ' + videoContainer.id + ', captureScreen = ' + captureScreen + ', callback)');
    this.localMedia = new LocalMedia(this.videoID);
    this.localMedia.start(videoContainer, captureScreen, this.useLocalMedia, callback);
};

App.prototype.stopLocalMedia = function (callback)
{
    consoleLog('App.prototype.stopLocalMedia');
    if (this.localMedia)
    {
        this.localMedia.stop(callback);
//        this.localMedia = null;
    }
};

App.prototype.startConference = function (callback)
{
    consoleLog('App.prototype.startConference()');
    // Create a WebRTC audio stream description (requires a
    // reference to the local audio feed).
    this.audioStream = new fm.icelink.webrtc.audioStream(this.localMedia.localMediaStream);
        
    // Create a WebRTC video stream description (requires a
    // reference to the local video feed). Whenever a P2P link
    // initializes using this description, position and display
    // the remote video control on-screen by passing it to the
    // layout manager created above. Whenever a P2P link goes
    // down, remove it.
    this.videoStream = new fm.icelink.webrtc.videoStream(this.localMedia.localMediaStream);
//    var useLocalMedia = true;
//    if (!this.useLocalMedia)
    {
        this.videoStream.addOnLinkInit(this.addRemoteVideoControlEvent);
        this.videoStream.addOnLinkDown(this.removeRemoteVideoControlEvent);
    }
        
    // Create a new IceLink conference.
    this.conference = new fm.icelink.conference(this.icelinkServerAddress, [ this.audioStream, this.videoStream ]);

    // Supply TURN relay credentials in case we are behind a
    // highly restrictive firewall. These credentials will be
    // verified by the TURN server.
    this.conference.setRelayUsername('test');
    this.conference.setRelayPassword('pa55w0rd!');

    // Add a few event handlers to the conference so we can see
    // when a new P2P link is created or changes state.
    this.conference.addOnLinkInit(this.logLinkInitEvent);
    this.conference.addOnLinkUp(this.logLinkUpEvent);
    this.conference.addOnLinkDown(this.logLinkDownEvent);

    // Attach signalling to the conference.
    this.signalling.attach(this.conference, this.sessionId, callback);

    if (this.useLocalMedia)
        displayWait(this.videoID, false);

//    this.isAddRemoteVideoControl = true;
};

//var g_addRemoteVideoControl = true;

App.prototype.addRemoteVideoControl = function (e)
{
/*
    if (!this.isAddRemoteVideoControl)
        return;
    this.isAddRemoteVideoControl = false;
*/
    consoleLog('App.prototype.addRemoteVideoControl(e) PeerId = ' + e.getPeerId());

    if (this.useLocalMedia)
        return;

    this.remoteVideoControl = e.getLink().getRemoteVideoControl();

    //Прямо здесь нельзя добавлять RemoteVideoControl потому что будут появляться черные видео окна при каждом добавлении нового зрителя
    //отправляем запрос на клиент this.videoID, транслирующий видео на котором вызывается onAddRemoteVideoControl (см. ниже)
    var videoSource = 'Camera';
    var videoID = this.videoID;
    var captureScreen;
    if (videoID.indexOf(videoSource) != -1) {
        captureScreen = false;
        videoID = videoID.replace(videoSource, '');
    } else {
        var videoSource = 'Screen';
        if (videoID.indexOf(videoSource) != -1) {
            captureScreen = true;
            videoID = videoID.replace(videoSource, '');
        }
    }
    if (videoID.length != 36) {
        consoleError('App.prototype.addRemoteVideoControl(e) failed! videoID.length = ' + videoID.length);
        return;
    }
    $.connection.chatHub.server.addRemoteVideoControl(videoID, e.getPeerId(), captureScreen);
/*
    try {
        this.localMedia.layoutManager.addRemoteVideoControl(e.getPeerId(), this.remoteVideoControl);
    }
    catch (ex) {
        consoleError("Could not add remote video control." + ex.message);
        fm.log.error("Could not add remote video control.", ex);
    }
*/
};

App.prototype.onAddRemoteVideoControl = function (videoID, peerId, connectionId) {
    //Этот клмент транслирует видео
    if (!this.peerId)
        this.peerId = peerId;//к трансляции присоединился первый зритель. Это значит, он передал на этот транслирующий клиент его peerId
    if (this.peerId != peerId){
        consoleLog('App.prototype.onAddRemoteVideoControl(videoID = ' + videoID + ', peerId = ' + peerId + ', connectionId = ' + connectionId + '). '
            + 'this.peerId: ' + this.peerId + ' != peerId. Do not open video for connectionId');
        return;//в дальнейшем, если peerId не совпадает с peerId транслирующего клиента, то не надо добавлять эту трансляцию,
                // потому что эта трансляция не имеет видео потока и появится черное окно видео
    }
    consoleLog('App.prototype.onAddRemoteVideoControl(videoID = ' + videoID + ', peerId = ' + peerId + ', connectionId = ' + connectionId + '). '
        + 'Open video for connectionId');

    //вызываем onAddRemoteVideoControlSucces у connectionId тоесть у себя если RemoteVideoControl транслирует видео
    $.connection.chatHub.server.addRemoteVideoControlSucces(videoID, peerId, connectionId, this.localMedia.captureScreen);
}

App.prototype.onAddRemoteVideoControlSucces = function (peerId) {
    consoleLog('App.prototype.onAddRemoteVideoControlSucces(peerId = ' + peerId + ')');

    try {
        this.localMedia.layoutManager.addRemoteVideoControl(peerId, this.remoteVideoControl);
    }
    catch (ex) {
        consoleError("Could not add remote video control." + ex.message);
        fm.log.error("Could not add remote video control.", ex);
    }
}

App.prototype.removeRemoteVideoControl = function(e)
{
    consoleLog('App.prototype.removeRemoteVideoControl()');

    try
    {
        if (this.localMedia && this.localMedia.layoutManager)
        {
            var peerId = e.getPeerId();
            this.localMedia.layoutManager.removeRemoteVideoControl(peerId);
            if (this.localMedia.layoutManager.getOldestRemoteVideoControl(peerId))
                displayWait(this.videoID, true);//Показывать значек Wait только для клиенетов, получающих эту трансляцию
        }
    }
    catch (ex)
    {
        consoleError("Could not remove remote video control." + ex.message);
        fm.log.error("Could not remove remote video control.", ex);
    }
};

App.prototype.logLinkInit = function(e)
{
    consoleLog('Link to peer initializing... peerId = ' + e.getPeerId());
    fm.log.info('Link to peer initializing...');
    return true;
};

App.prototype.logLinkUp = function(e)
{
    consoleLog('Link to peer is UP. PeerId = ' + e.getPeerId() + '. ContainerID = ' + getContainerID(this.videoID));
    fm.log.info('Link to peer is UP.');
    displayWait(this.videoID, false);

//    var videoContainer = document.getElementById(this.videoID + "VideoContainer");
    var videoContainer = document.getElementById(getContainerID(this.videoID));// + "Container");
    if (videoContainer) {
        var video = videoContainer.childNodes[0].childNodes[0].childNodes[0];
        video.setAttribute('controls', 'controls');//добавил эдлементы управления в окне видео
        //    video.style.transform = 'scale(-1, 1)';
    } else consoleError('App.prototype.logLinkUp(). videoContainer = ' + videoContainer);

    if(this.useLocalMedia)
        $.connection.chatHub.server.videoCount(this.videoID, this.conference.getLinks().length);
};

App.prototype.logLinkDown = function(e)
{
    var errorMessage = e.getException().message;
    consoleLog('Link to peer is DOWN. ' + errorMessage);
    fm.log.info('Link to peer is DOWN. ' + errorMessage);
    /*сообщение об ошибке появляется не у тех клиентов
    if (e.getTimedOut())
        ErrorMessage(lang.openVideoFailed + '\n\n' + errorMessage);//'Open the video broadcast failed!'
    */
    if (this.useLocalMedia)
        $.connection.chatHub.server.videoCount(this.videoID, this.conference.getLinks().length);
};

App.prototype.stopConference = function(callback)
{
    consoleLog('App.prototype.stopConference()');
    // Detach signalling from the conference.
    if (this.signalling)
    {
        this.signalling.detach(function(error)
        {
            if (this.conference)
            {
                this.conference.removeOnLinkInit(this.logLinkInitEvent);
                this.conference.removeOnLinkUp(this.logLinkUpEvent);
                this.conference.removeOnLinkDown(this.logLinkDownEvent);
                this.conference = null;
            }

            if (this.videoStream)
            {
                this.videoStream.removeOnLinkInit(this.addRemoteVideoControlEvent);
                this.videoStream.removeOnLinkDown(this.removeRemoteVideoControlEvent);
                this.videoStream = null;
            }

            if (this.audioStream)
            {
                this.audioStream = null;
            }

            callback(error);
        });
    }
};

App.prototype.toggleAudioMute = function()
{
    return this.localMedia.toggleAudioMute();
};

App.prototype.toggleVideoMute = function()
{
    return this.localMedia.toggleVideoMute();
}; 
/*
App.prototype.onCreateFailure = function () {
    consoleLog("App.prototype.onCreateFailure");
};
*/
