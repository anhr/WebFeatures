/**
 * Common Javascript code.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.github.io/AboutMe/
 * source: https://github.com/anhr/WebFeatures
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2015-07-01, : 
 *       + init.
 *
 */

var g_attemptCamera = 1;

function SendCamera() {
    consoleLog('SendCamera()');
    var cameraTransfers = 'cameraTransfers';
    loadScript("Scripts/WebRTC/Camera.js", function () {
        var cameras = new Cameras(cameraTransfers);
        loadScript("Scripts/WebRTC/Media.js", function () {
            loadScript("Scripts/WebRTC/SendStream.js", function () {
                new SendStream({
                    header: '📹 ' + lang.myVideoBroadcast//'My camera'
                        + elementMediaHeader(lang.viewersNumber)//'Viewers number'
                    , informerFileTransfers: 'informerCameraTransfers'
                    , fileTransfers: cameraTransfers
                    , sendMediaName: 'sendCamera'
                    , branchFileTransfers: cameras.transfers.branchTransfers
                    , noFileTransfer: cameras.transfers.noFileTransfer
                    , session: {
                        audio: true
                        , video: true
                    }
                    , elementFileTransfer: function (fileTransfer) { return elementCamera('SendCamera', 'muted'); }
                    , sendMedia: function () { new SendCamera(); }
                    , isUserMediaSuccess: function (stream) {
                        if (stream.getVideoTracks().length == 0) {
                            alert(lang.noVideoStream + browserSettings());//Video stream is not detected. Probably your camera is blocked for our web site.
                            return false;
                        }
                        return true;
                    }
                    , tools: function (fileTransfer) {
                        var blockId = fileTransfer.getBlockID();
                        fileTransfer.onToggleMedia = function () {
                            toggleMedia(this.stream.getVideoTracks()[0], this);
                        }
                    
                        fileTransfer.onSettings = function () {
                            consoleLog('Camera settings');
                            var elementSettings = document.getElementById(blockId).querySelector('#Settings');
                            var mediaStream = fileTransfer.stream;
                            var audioTracks = mediaStream.getAudioTracks();
                            if (elementSettings.innerHTML == '') {
                                var elementСameraSettingsBody = '<p align="center"><b>' + lang.cameraSettings + '</b></p>';//My camera settings

                                //Направить аудио выход на аудиовход
                                //http://www.howtogeek.com/howto/39532/how-to-enable-stereo-mix-in-windows-7-to-record-audio/

                                //audio sources
                                var curAudioLabel;
                                if (typeof mediaStream == 'undefined')
                                    curAudioLabel = '';
                                else {
                                    if (audioTracks.length == 0)
                                        curAudioLabel = '';
                                    else {
                                        if (audioTracks.length > 1)
                                            consoleError('audioTracks.length = ' + audioTracks.length);
                                        curAudioLabel = audioTracks[0].label;
                                    }
                                }

                                var audioInputDevices = DetectRTC.audioInputDevices;
//                                elementСameraSettingsBody += '<div><label for="' + blockId + 'audioSource">🎤 ' + lang.audioSource + ': </label>';//Audio source
                                elementСameraSettingsBody += '<div><label for="audioSource">🎤 ' + lang.audioSource + ': </label>';//Audio source
                                if (audioTracks.length == 0)
                                    elementСameraSettingsBody += lang.notAwailable;//Not available
                                else {
//                                    elementСameraSettingsBody += '<select id="' + blockId + 'audioSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia(' + closeSessionCauseEnum.updateSettings + ')">';
                                    elementСameraSettingsBody += '<select id="audioSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia(' + closeSessionCauseEnum.updateSettings + ')">';
                                    for (var i = 0; i < audioInputDevices.length; i++) {
                                        var audioInputDevice = audioInputDevices[i];
                                        var label = audioInputDevice.label;
                                        if (label == 'Please invoke getUserMedia once.')
                                            label = lang.microphone + ' ' + (i + 1);//For Opera mobile
                                        elementСameraSettingsBody += '<option value="' + audioInputDevice.deviceId + '"' + (audioInputDevice.label == curAudioLabel ? ' selected' : '') + '>' + label + '</option>';
                                        //Если не удалить audioInputDevice.toJSON то не будет работать JSON.stringify(audioInputDevice)
                                        //delete audioInputDevice.toJSON;
                                        //consoleLog('audioInputDevices[' + i + ']: ' + JSON.stringify(audioInputDevice));
                                    }
                                    elementСameraSettingsBody += '</select></div>';

                                    //Audio stream volume https://webrtc.github.io/samples/src/content/getusermedia/volume/
                                    elementСameraSettingsBody += elementSoundMeter();
                                }

                                //video sources
                                var curVideoLabel;
                                if (typeof mediaStream == 'undefined')
                                    curVideoLabel = '';
                                else {
                                    var videoTracks = mediaStream.getVideoTracks();
                                    if (videoTracks.length == 0)
                                        curVideoLabel = '';
                                    else {
                                        if (videoTracks.length > 1)
                                            consoleError('videoTracks.length = ' + videoTracks.length);
                                        curVideoLabel = videoTracks[0].label;
                                    }
                                }
/*
                                elementСameraSettingsBody += '<div><label for="' + blockId + 'videoSource">📹 ' + lang.videoSource + ': </label>'//Video source
                                + '<select id="' + blockId + 'videoSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia(' + closeSessionCauseEnum.updateSettings + ')">';
*/
                                elementСameraSettingsBody += '<div><label for="videoSource">📹 ' + lang.videoSource + ': </label>'//Video source
                                + '<select id="videoSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia(' + closeSessionCauseEnum.updateSettings + ')">';
                                var videoInputDevices = DetectRTC.videoInputDevices;
                                for (var i = 0; i < videoInputDevices.length; i++) {
                                    var label = videoInputDevices[i].label;
                                    if (label == 'Please invoke getUserMedia once.')
                                        label = lang.camera + ' ' + (i + 1);//For Opera mobile
                                    elementСameraSettingsBody +=
                                        '<option value="' + videoInputDevices[i].deviceId + '"' + (videoInputDevices[i].label == curVideoLabel ? ' selected' : '') + '>'
                                        + label + '</option>';
                                }
                                elementСameraSettingsBody += '</select></div>'
                                    + ' </div>';
                            
                                //permissons
                                var allowSnapshotName = 'AllowSnapshot';
                                var allowSnapshot = get_cookie(allowSnapshotName, 'ask');
                                elementСameraSettingsBody +=
                                      '<hr>'
                                    + '<p align="center"><b>' + lang.permissions + '</b></p>'//Permissions
                                    + '<INPUT id="allow" type="radio" ' + ((allowSnapshot == 'true') ? 'checked' : '') + ' name="AllowCamera"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowSnapshotName + '\',\'true\')">' + lang.allowAllViewersTitle + '<br>'//Allow all viewers to take snapshot and video recording from my video camera
                                    + '<INPUT id="deny" type="radio" ' + ((allowSnapshot == 'false') ? 'checked' : '') + ' name="AllowCamera"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowSnapshotName + '\',\'false\')">' + lang.neverAllowSnapshot + '<br>'//Never allow viewers to take snapshot
                                    + '<INPUT id="ask" type="radio" ' + ((allowSnapshot == 'ask') ? 'checked' : '') + ' name="AllowCamera"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowSnapshotName + '\',\'ask\')">' + lang.askPermission + '<br>'//Ask permission
                                ;
                            
                                elementSettings.innerHTML = elementСameraSettingsBody;
                                if (typeof mediaStream != 'undefined')
                                    window.createSoundMeter(fileTransfer);
                            }
                            if (typeof mediaStream != 'undefined') {
                                if (isBranchExpanded(elementSettings)) {
                                    if ((audioTracks.length > 0) && (elementSettings.audioTrackEnabled != audioTracks[0].enabled))
                                        this.onToggleAuidoBase();//Восстанвливаем состояние микрофона после закрытия окна настроек веб камеры
                                } else {
                                    var audioTrackEnabled;
                                    if (audioTracks.length == 0)
                                        audioTrackEnabled = false;//В настройка браузера (Chrome: Settings/Content Settings/Microphone/Do not allow sites to acces to your microphone) запрещен доступ к микрофону
                                    else audioTrackEnabled = audioTracks[0].enabled;
                                    elementSettings.audioTrackEnabled = audioTrackEnabled;
                                    if (!audioTrackEnabled)
                                        this.onToggleAuidoBase();//Временно включить микрофон что бы был виден уровень звука в окне настроек камеры
                                }
                            }

                            return onbranchelement(elementSettings);
                        }

                        fileTransfer.onclickMute = function () {
                            if (this.stream.getAudioTracks().length == 0) {
                                alert(lang.invalidAudio + browserSettings());//'The audio tracks is not avaialble on your system. Please setup a microphone.'
                                return false;
                            }
                            var audioTrack = this.stream.getAudioTracks()[0];
                            consoleLog('onclickMute() muted = ' + audioTrack.muted + ' enabled = ' + audioTrack.enabled + ' length = ' + this.stream.getAudioTracks().length);
                            if (audioTrack.enabled)
                                audioTrack.enabled = false;
                            else audioTrack.enabled = true;
                            return audioTrack.enabled;
                        }

                        fileTransfer.onSwitchAuido = function (audioTrackEnabled) {
                            var block = this.getBlock();
                            if (block == null)
                                return;//произошло аварийное закрытие блока камеры. Например когда запрещен доступ к камере
                            var toggleAuido = block.querySelector('#ToggleAuido');
                            if (!toggleAuido) {
                                consoleError('onSwitchAuido(' + audioTrackEnabled + ') failed! toggleAuido = ' + toggleAuido);
                                return;//This is not video camera block. Probably microphone
                            }
                            consoleLog('onSwitchAuido(audioTrackEnabled = ' + audioTrackEnabled + ')');
                            toggleAuido.title = audioTrackEnabled ?
                                    lang.muteMyAudio //Mute My Audio
                                    : lang.unmuteMyAudio//'Unmute My Audio'
                            ;
                            block.querySelector('#ToggleAuidoCross').style.visibility = audioTrackEnabled ? 'hidden' : 'visible';
                        }

                        fileTransfer.onToggleAuidoBase = function () {
                            var audioTrackEnabled = this.onclickMute();
                            this.onSwitchAuido(audioTrackEnabled);
                            return audioTrackEnabled;
                        }

                        fileTransfer.onToggleAuido = function () {
    //                        consoleLog('fileTransfer.onToggleAuido()');
                            SetCookie('audioTrackEnabled', this.onToggleAuidoBase());
                        }

                        fileTransfer.elementCameraTools = true;//for restarting of the camera

                        return elementCameraTools(fileTransfer, {
                            localMediaTools:
                                //Toggle auido
    //                              '<h1 id="ToggleAuido" onclick="javascript: onToggleAuido(\'' + getVideoBlockID(cameraID) + '\', \'' + getToggleAuidoID(cameraID) + '\')" class="sendButton" style="position: relative;" title="' + lang.muteMyAudio + '">'//Mute My Audio
                                  '<h1 id="ToggleAuido"'
                                        + ' onclick="javascript: document.getElementById(\'' + blockId + '\').fileTransfer.onToggleAuido()"'
                                        + ' class="sendButton" style="position: relative;" title="' + lang.muteMyAudio + '">'//Mute My Audio
                                    + '<span>🎤</span>'
                                    + '<font id="ToggleAuidoCross" style="position: absolute; left: 10px; visibility: hidden;" color="red">X</font>'
                                + '</h1>'
                                + getToolMediaButtons(blockId, lang.cameraSettings)//'My camera settings'
                            , fileTransfer: fileTransfer
    //                        , toggleMediaRecording: 'toggleVideoRecording'
                            , onRecordMedia: 'onRecordVideo'
                        });
                    }
                    , elementCreated: function (fileTransfer) {
                        if (typeof fileTransfer.elementCameraTools == 'undefined')
                            this.tools(fileTransfer);//restarting of the camera

                        if (!DetectRTC.hasWebcam) {
                            var message;
                            message = lang.setupWebcam;//'1. Please setup your webcam first.\n2. Reload web page after setup of your webcam.';
                            consoleError(message);
                            alert(message);
                            fileTransfer.closeSessionCause = closeSessionCauseEnum.setupWebcam;
                            fileTransfer.cancelTransfer();
                            return;
                        }

                        this.elementCreatedSend(fileTransfer, {
                            devicesNotFoundError: lang.setupWebcam//'1. Please setup your webcam first.\n2. Reload web page after setup of your webcam.'
                            , video: {
                                optional: [],
                                mandatory: {}
                            }
                            , setVideoDevice: function (hints) {
                                var curVideoLabel = get_cookie('curVideoLabel');
                                for (i = 0; i < DetectRTC.videoInputDevices.length; i++) {
                                    var videoInputDevice = DetectRTC.videoInputDevices[i];
                                    if (typeof videoInputDevice.label == 'undefined')
                                        break;//for Android Firefox 
                                    if (videoInputDevice.label == curVideoLabel) {
                                        hints.video.optional[0] = {
                                            sourceId: videoInputDevice.deviceId
                                        }
                                        break;
                                    }
                                }

                            }
                            , getUserMediaSuccess: function (stream) {
                                consoleLog('SendCamera getUserMediaSuccess');
                                var block = fileTransfer.getBlock();
                                var elementMedia = block.querySelector('video#SendCamera');
                                /*
                                elementMedia.onerror = function (e) {
                                    consoleError('elementMedia.onerror: ', e);
                                }
                                elementMedia.onloadstart = function () {
                                    consoleLog('elementMedia.onloadstart');
                                }
                                elementMedia.onended = function () {
                                    consoleLog('elementMedia.onended');
                                }
                                */

                                //Иногда в Firefox камера открывается не с первой попытки
                                elementMedia.timerId = window.setTimeout(function () {
                                    consoleError('SendCamera. elementMedia.onloadedmetadata failed!');
                                    g_attemptCamera++;
                                    block.querySelector('#Message').innerText = lang.attempt + ': ' + g_attemptCamera;//'attempt'
                                    fileTransfer.restartLocalMedia(); 
                                }, 2000);

                                fileTransfer.loadedmetadata = false;
                                elementMedia.onloadedmetadata = function (e) {
                                    clearTimeout(elementMedia.timerId);
                                    if (fileTransfer.ended)
                                        return;//problem of the media stream in the Chrome. For example camera is busy by another application
                                    consoleLog('elementMedia.onloadedmetadata');
                                    block.querySelector('#tools').style.display = 'block';
                                    fileTransfer.loadedmetadata = true;
                                    g_attemptCamera = 1;
                                    elementMedia.play();
//                                    elementMedia.setAttribute('muted', true);

                                    block.querySelector('#Message').innerText = '';

                                    if (block.querySelector('meter') != null)
                                        window.createSoundMeter(fileTransfer);
                                    if (typeof fileTransfer.onSwitchAuido != 'undefined') {
                                        //for camera. Sets the mute audio buttom to unmute mode if microphone is not detected
                                        var audioTrackEnabled = fileTransfer.stream.getAudioTracks().length != 0;
                                        if (audioTrackEnabled) {
                                            audioTrackEnabled = get_cookie('audioTrackEnabled', audioTrackEnabled) == 'true';
                                            if (!audioTrackEnabled)
                                                fileTransfer.onclickMute();//Mute audio
                                        }
                                        fileTransfer.onSwitchAuido(audioTrackEnabled);
                                    }
                                    fileTransfer.mediaSuccess(elementMedia);
                                };
                                elementMedia.src = window.URL.createObjectURL(stream);

                                var mediaStreamTrack = stream.getVideoTracks()[0];
                                if (typeof mediaStreamTrack != "undefined") {
                                    fileTransfer.ended = false;
                                    mediaStreamTrack.onended = function () {//for Chrome, Opera. For Firefox see function (err)

                                        consoleLog('mediaStreamTrack.onended()');
                                        fileTransfer.ended = true;
                                        //consoleError('mediaStreamTrack.onended(...)');
                                        fileTransfer.restartLocalMediaTimeout();
                                    }
                                    /*
                                    //ATTENTION!!! mediaStreamTrack.readyState is undefined in Firefox
                                    consoleLog('navigator.getUserMedia() onsuccess mediaStreamTrack.readyState: ' + mediaStreamTrack.readyState);
                                    setTimeout(function () {
                                        if (mediaStreamTrack.readyState == "ended") {
                                            app.closeSessionCause = closeSessionCauseEnum.webcamBusy;
                                            closeVideoSession(app.videoID, true);
                   
                                            var message;
                                            message = lang.freeWebcam;//'Your webcam is not setup or busy by other application. Please setup or free your webcam and try again.';
                                            consoleError(message);
                                            alert(message);
                                        }
                                    }, 500);
                                    */
                                } else {
/*
                                    var mediaType = getMediaType(app.videoID);
                                    switch (mediaType) {
                                        case 'Microphone':
                                            break;
                                        case "Camera":
                                            app.closeSessionCause = closeSessionCauseEnum.permissionDenied;
                                            closeVideoSession(app.videoID, false);
                                            var messgae = lang.permissionCameraDenied;//'Permission to camera devices is denied. Please allow to use the camera in your web browser for our web site.'
                                            consoleError(messgae);
                                            if (DetectRTC.browser.isChrome)
                                                messgae += '\n\n' + lang.allowCamera//
                                            alert(messgae);
                                            break;
                                        default: consoleError('mediaType: ' + mediaType);
                                    }
                                    mediaStreamTrack = stream.getAudioTracks()[0];
                                    if (typeof mediaStreamTrack != "undefined") {
                                        consoleLog('navigator.getUserMedia() onsuccess mediaStreamTrack.readyState: ' + mediaStreamTrack.readyState);
                                    }
*/
                                }
                            }
                        });
                    }
                    , closeSession: function () {
                        this.options.options.stopLocalMedia(this, 'Camera');
                    }
                });
            });
        });
    });
}

