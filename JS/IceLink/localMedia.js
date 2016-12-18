
function LocalMedia(videoID)
{
    consoleLog('LocalMedia(videoID = ' + videoID + ')');

    this.videoID = videoID;
    // We're going to use both audio and video
    // for this example.
    this.audio          = true;
    this.video          = true;
    this.videoWidth     = 640;
    this.videoHeight    = 480;
    this.videoFrameRate = 30;

    this.screenWidth = window.screen.width;
    this.screenHeight = window.screen.height;
    this.screenFrameRate = 3;

    this.localMediaStream = null;
    this.layoutManager = null;

    this.captureScreen = null;
};

LocalMedia.prototype.start = function (videoContainer, captureScreen, useLocalMedia, callback)
{
    consoleLog('LocalMedia.prototype.start(videoContainer.id = ' + videoContainer.id + ', captureScreen = ' + captureScreen + ', useLocalMedia = ' + useLocalMedia + ', callback)');

    if (typeof captureScreen == 'undefined')
        captureScreen = false;
    this.captureScreen = captureScreen;
    if (!useLocalMedia)
        captureScreen = false;

    var me = this;

    // WebRTC audio and video streams require us to first get access to
    // the local media stream (microphone, camera, or both).
    //здесь содается video элемент
    fm.icelink.webrtc.userMedia.getMedia({
        audio: captureScreen ? false : (useLocalMedia ? this.audio : false),
        video: useLocalMedia? this.video : false,
        videoWidth:         captureScreen ? this.screenWidth : this.videoWidth,         // optional
        videoHeight:        captureScreen ? this.screenHeight : this.videoHeight,       // optional
        videoFrameRate:     captureScreen ? this.screenFrameRate : this.videoFrameRate, // optional
        defaultVideoSource: captureScreen ? fm.icelink.webrtc.videoSource.Screen : fm.icelink.webrtc.videoSource.Camera, // optional
        defaultVideoScale: fm.icelink.webrtc.layoutScale.Contain,        // optional
        defaultVideoPreviewScale: fm.icelink.webrtc.layoutScale.Contain, // optional
        onFailure: function(e)
        {
            if (captureScreen && navigator.webkitGetUserMedia && !fm.icelink.webrtc.localMediaStream.chromeExtensionInstalled)
            {
//                chromeExtensionInstallButton.style.display = '';
//                callback('Could not get media. ' + e.getException().message + '\n\nClick "Install Screen-Sharing Extension" to install screen-sharing extension.');
                if (fm.icelink.webrtc.chromeExtensionRequiresUserGesture) {
                    // Try inline install.
                    chrome.webstore.install(fm.icelink.webrtc.localMediaStream.chromeExtensionUrl, function () {
                        location.reload();
                    },
                    function (error) {
                        // Worst case scenario prompt to install manually.
                        message = lang.inlineInstallationFailed//'Inline installation failed. %s\n\n<a href="%s2" target="_blank">Open Chrome Web Store</a>'
                        message = message.replace("%s", error);
                        message = message.replace("%s2", fm.icelink.webrtc.localMediaStream.chromeExtensionUrl);
                        callback(message);
/*
                        if (confirm('Inline installation failed. ' + error + '\n\nOpen Chrome Web Store?')) {
                            window.open(fm.icelink.webrtc.localMediaStream.chromeExtensionUrl, '_blank');
                        }
*/
                    });
                }
                else {
                    // Manual installation required.
//                    window.open(fm.icelink.webrtc.localMediaStream.chromeExtensionUrl, '_blank');
                    message = lang.notGetMedia//'Could not get media. '
                        + e.getException().message
                        + lang.installScreenSharingExtension//'\n\nClick <a href="%s" target="_blank">"Install Screen-Sharing Extension"</a> to install screen-sharing extension.\n\nPlease update web page after installing of the extention.'
                    ;
                    message = message.replace("%s", fm.icelink.webrtc.localMediaStream.chromeExtensionUrl);
                    callback(message);
                }
            }
            else if (captureScreen && navigator.mozGetUserMedia)
            {
//                firefoxExtensionInstallButton.style.display = '';
                message = lang.notGetMedia//'Could not get media. '
                    + e.getException().message
//                    + '\n\nClick <a href="https://addons.mozilla.org/en-US/firefox/addon/icelink-webrtc-screen-capture/" target="_blank">"Install Screen-Sharing Extension"</a> to install screen-sharing extension.'
                    + lang.installScreenSharingExtension//'\n\nClick <a href="%s" target="_blank">"Install Screen-Sharing Extension"</a> to install screen-sharing extension.'
                ;
                message = message.replace("%s", "https://addons.mozilla.org/en-US/firefox/addon/icelink-webrtc-screen-capture/");
                callback(message);
            }
            else
            {
                callback(lang.notGetMedia//'Could not get media. '
                    + e.getException().message);
            }
        },
        onSuccess: function (e)
        {
            consoleLog('LocalMedia.prototype.start() onSuccess');

            // We have successfully acquired access to the local
            // audio/video device! Grab a reference to the media.
            // Internally, it maintains access to the local audio
            // and video feeds coming from the device hardware.
            me.localMediaStream = e.getLocalStream();

//            if (useLocalMedia)
            {
                // This is our local video control, a DOM element
                // that displays video coming from the capture source.
                var localVideoControl = e.getLocalVideoControl();
//                localVideoControl.childNodes[0].setAttribute('controls', 'controls');//добавил эдлементы управления в окне видео
                if (localVideoControl) {//этот елемент транслирует видео
                    var video = localVideoControl.childNodes[0];
                    video.setAttribute('controls', 'controls');//добавил эдлементы управления в окне видео
                    if (!me.captureScreen)
                        video.style.transform = 'scale(-1, 1)';//удаляем зеркальное изображение
                }


                // Create an IceLink layout manager, which makes the task
                // of arranging video controls easy. Give it a reference
                // to a DOM element that can be filled with video feeds.
                me.layoutManager = new fm.icelink.webrtc.layoutManager(videoContainer);

                // Display the local video control.
                me.layoutManager.setLocalVideoControl(localVideoControl);
            }

            callback(null);
        }
    });
};

LocalMedia.prototype.stop = function(callback)
{
    consoleLog('LocalMedia.prototype.stop()');
    // Clear out the layout manager.
    if (this.layoutManager) {
        var boStopingRemoteBroarcasting = false;
        //        this.layoutManager.getLocalVideoControl().parentElement.parentElement.parentElement.parentElement.id
        var videoBlock = this.layoutManager.getLocalVideoControl();
        if (!videoBlock)
            boStopingRemoteBroarcasting = true;
/*
        var indexName;
        if (this.captureScreen)
            indexName = 'Screen';
        else indexName = 'Video';
        indexName += 'Block'
        while (videoBlock && (videoBlock.id.indexOf(indexName) == -1)) {
            videoBlock = videoBlock.parentElement;
        }
*/
        videoBlock = getVideoBlock(this.videoID);
        this.layoutManager.removeRemoteVideoControls();
        this.layoutManager.unsetLocalVideoControl();
        this.layoutManager = null;

        if (boStopingRemoteBroarcasting)
            return;
        if (videoBlock) {
            $("#" + videoBlock.id).remove();
        }
        else consoleError('LocalMedia.prototype.stop() invalid videoBlock');
    }

    // Stop the local media stream.
    if (this.localMediaStream) {
        this.localMediaStream.stop();
        this.localMediaStream = null;
    }

    callback(null);
};

LocalMedia.prototype.toggleAudioMute = function()
{
    consoleLog('LocalMedia.prototype.toggleAudioMute()');
    this.localMediaStream.toggleAudioMute();
    return this.localMediaStream.getAudioIsMuted();
};

LocalMedia.prototype.toggleVideoMute = function()
{
    consoleLog('LocalMedia.prototype.toggleVideoMute()');
    this.localMediaStream.toggleVideoMute();
    return this.localMediaStream.getVideoIsMuted();
};