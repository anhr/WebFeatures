﻿/**
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

function SendStream(options) {
    if (typeof options == 'undefined')
        options = {}; 
    options.cancelTitle = lang.cancelStream2//'Cancel Broadcast'
    options.cancel = function (noCloseBlock) {
        consoleLog('SendStream.cancel()');
        for (var peer in this.peers) {
            this.peers[peer].pc.close();
        }
        this.closeSession();
        this.cancelTransfer(noCloseBlock);
        if (typeof this.intervalID != 'undefined')
            window.clearInterval(this.intervalID);
        //        closeVideoSession(options.options.id);
        toggleMenuItems();
    }
    options.stopLocalMedia = function (fileTransfer, mediaName) {
        consoleLog('SendStream.stopLocalMedia(' + mediaName + ')');

        if (fileTransfer.soundMeter != undefined)
            fileTransfer.soundMeter.stop();

        if (typeof fileTransfer.stream != 'undefined')//stream == 'undefined' при неудачном открытии камеры например если она занята другим приложением
            fileTransfer.stream.getTracks().forEach(function (track) {
                track.stop();//free media device
            });

        var arrayWaitPermissions = document.getElementsByName("waitPermission");
        for (i = (arrayWaitPermissions.length - 1) ; i >= 0; i--) {
            var waitPermission = document.getElementsByName("waitPermission")[i];
            if (waitPermission.mediaName == mediaName) {
                var id = waitPermission.id;
                $('#' + id).remove();
                removeInvitations(id);
            }
        }
    }
    options.elementCreatedSend = function (fileTransfer, options) {
        consoleLog('SendStream.elementCreated');
        var block = fileTransfer.getBlock();

        //Это сторка дублирует строку elementBlock.fileTransfer = this; в function FileTransfer(options)
        //Это нужно в случае перезапуска трансляции когда посетиьтель сменил камеру или микрофон
        //если этого не сделать, то останется старое значение block.fileTransfer и у получателя трансляции появится пустой видео экран 
        if (typeof block.fileTransfer != 'undefined')
            consoleError('block.fileTransfer = ' + block.fileTransfer);
        block.fileTransfer = fileTransfer;

        block.querySelector('#wait').style.display = 'block';
        //https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia

        if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
            fileTransfer.restartLocalMedia = function (closeSessionCause) {
                if (typeof closeSessionCause != 'undefined')
                    fileTransfer.closeSessionCause = closeSessionCause;
                consoleLog('restartLocalMedia() ' + getCauseMessage(fileTransfer.closeSessionCause));

                if (typeof this.soundMeter != 'undefined') {
                    window.clearInterval(this.soundMeterIntervalID);
                    this.soundMeter.stop();
                    this.soundMeter.mic = null;
                    delete this.soundMeter;
                }
/*
                var blockId = this.getBlockID();
                var videoSource = document.getElementById(blockId + 'videoSource');
*/
                var block = this.getBlock();
                var videoSource = block.querySelector('#videoSource');
                if (videoSource) {
                    for (i = 0; i < videoSource.length; i++) {
                        if (videoSource[i].selected) {
                            SetCookie('curVideoLabel', videoSource[i].innerText);
                            break;
                        }
                    }
                }
//                var audioSource = document.getElementById(blockId + 'audioSource');
                var audioSource = block.querySelector('#audioSource');
                if (audioSource) {
                    for (i = 0; i < audioSource.length; i++) {
                        if (audioSource[i].selected) {
                            SetCookie('curAudioLabel' + fileTransfer.options.options.sendMediaName, audioSource[i].innerText);
                            break;
                        }
                    }
                } else consoleError('audioSource = ' + audioSource);
                //остановить трансляцию без закрытия окна трансляции
                this.cancel(true);

                //запусить трансляцию снова
//                sendFileBase(function () { new SendCamera(); });
                sendFileBase(function () { fileTransfer.options.options.sendMedia(); });
            }
            fileTransfer.restartLocalMediaTimeout = function () {
                switch (fileTransfer.closeSessionCause) {
                    case closeSessionCauseEnum.updateSettings:
                        return;
                }
                var block = fileTransfer.getBlock();
                var elementMessage = block.querySelector('#Message');
                elementMessage.innerHTML = '<font style="COLOR: red;"> ' + lang.MediaBusy + '</font>';//'Media device is busy.'
                block.querySelector('#tools').style.display = 'none';
                window.setTimeout(function () {
                    if (getVideoBlock(fileTransfer.ID) != null) {
                        consoleError('Camera is busy. Restart local media...');
                        fileTransfer.restartLocalMedia();
                    }
                }, 2000);
            }
            if (!DetectRTC.isGetUserMediaSupported) {
                var message = lang.uncompatibleBrowser;//'Your web browser is not compatible with our web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.'
                message = message.replace("%s", 'GetUserMedia is not supported');
                consoleError(message);
                alert(message);
                //                            app.closeSessionCause = closeSessionCauseEnum.incompatibleBrowser;
                return;
            }
            var hints = {
                //            audio: true,
                //https://simpl.info/getusermedia/sources/
                audio: {
                    optional: []
                },
                video: options.video
            };

            if (typeof options.setVideoDevice != 'undefined') {
                options.setVideoDevice(hints);
            }
            var curAudioLabel = get_cookie('curAudioLabel' + fileTransfer.options.options.sendMediaName);
            for (i = 0; i < DetectRTC.audioInputDevices.length; i++) {
                var audioInputDevice = DetectRTC.audioInputDevices[i];
                if (audioInputDevice.label == curAudioLabel) {
                    hints.audio.optional[0] = {
                        sourceId: audioInputDevice.deviceId
                    }
                    break;
                }
            }

            fileTransfer.mediaSuccess = function (elementMedia) {
                var block = fileTransfer.getBlock();
                if (block == null)
                    return;//произошло аварийное закрытие блока камеры. Например когда запрещен доступ к камере

                block.addEventListener('touchstart', function (event) {
                    consoleLog('elementMedia touchstart. event.targetTouches.length = ' + event.targetTouches.length);
                    if (event.targetTouches.length == 1) {// Если 1 палец внутри элемента
                        if (isBranchExpanded(fileTransfer.getBlock().querySelector('#tools')))
                            fileTransfer.hideTools()
                        else fileTransfer.showTools();
                    }
                }, false);

                block.querySelector('#wait').style.display = 'none';
                fileTransfer.startTime = parseInt(new Date().getTime());
                fileTransfer.intervalID = window.setInterval(function () {
                    //consoleLog('display current time sending');
                    window.displayDuration(fileTransfer.startTime, block.querySelector('#currentTime'));
                }, 1000);
                window.setTimeout(function () {
                    resizeVideos();//снова изменить размер если появился скрол в окне users
                    elementMedia.style.display = 'block';
                }, 100);//если не поставить таймаут, то при открытии размер тега video устанавливается по умолчанию, а потом только устанавливается правильно вызовом resizeVideos();. В результате размер окна прыгает

                toggleMenuItems();

                fileTransfer.sendFile(fileTransfer.getCurrentTime());
            }

            getMedia(hints, function (stream) {//success
                if (!fileTransfer.options.options.isUserMediaSuccess(stream)) {
                    fileTransfer.loadedmetadata = false;
                    fileTransfer.cancel();
                    return;
                }
                fileTransfer.stream = stream;
                options.getUserMediaSuccess(stream);
            }, function (err) {
                consoleError("The following error occurred:", err);
                var message;
                switch (err.name) {
                    case 'NotFoundError':
                    case 'DevicesNotFoundError':
                        message = options.devicesNotFoundError;
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.setupWebcam;
                        break;
                    case 'NotReadableError'://Firefox
                    case 'SourceUnavailableError':
                    case 'TrackStartError':
                        fileTransfer.restartLocalMediaTimeout();
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.webcamBusy;
                        return;
                    case 'NotSupportedError':
                        if (window.location.protocol == "https:") {
                            message = err.name + ' ' + err.message;
                            fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                        } else message = lang.notSupported;//'Only secure origins are allowed. Please use protocol for secure communication HTTPS for opening this web page.'
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.notSupported;
                        break;
                    case 'PermissionDeniedError':
                        if (window.location.protocol == "https:") {
                            message = lang.permissionDeniedShort + browserSettings();//'Permission to media devices is denied.'
                        } else message = lang.permissionDenied;//'Permission to media devices is denied. Please use protocol for secure communication HTTPS for opening this web page.'
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.permissionDenied;
                        break;
                    case 'ReferenceError':
                    case 'SecurityError':
                    case 'NotAllowedError'://for Firefox
                        message = lang.securityError.replace('%s', err.message) + browserSettings();//'Permission to media devices is denied.\n\n%s\n\nPlease allow to use the camera and microphone in your web browser for our web site.'
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.permissionDenied;
                        break;
                    case 'InternalError'://for Firefox
                        message = err.name + ' ' + err.message;
                        switch (err.message) {
                            case 'Starting audio failed':
                            case 'Starting video failed':
                                consoleError(message);
                                restartLocalMediaTimeout();
                                return;
                            default:
                                fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                        }
                        break;
                    default:
                        message = err.name + ' ' + err.message;
                        fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                        break;
                }
                alert(message);
                fileTransfer.loadedmetadata = false;
                fileTransfer.cancel();
            });
        } else {
            var message = 'getUserMedia not supported';
            consoleError(message);
            alert(lang.uncompatibleBrowser.replace("%s", message));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
        }
    }
    SendDataStream(options);
}

function createSoundMeter(fileTransfer) {
    var MediaStream = fileTransfer.stream;
    if (typeof MediaStream == 'undefined') {
        consoleError('MediaStream: ' + MediaStream);
        return;
    }

    if (MediaStream.getAudioTracks().length == 0) {
        consoleLog('createSoundMeter: no audio tracks');//Возможно запрещен доступ к микрофону в браузере (Chrome: Settings/Content Settings/Microphone/Do not allow sites to acces to your microphone)
        return;
    }

//    var blockId = fileTransfer.getBlockID();
    var soundMeter = fileTransfer.getBlock().querySelector('#' + getSoundMeterID());
/*Непонятно зачем я это добавил. Если оставить, то появляется сообщение об ошибке, когда окрывается окно settings для камеры и нажата кнопка "Отключить мой микрофон"
    if (!MediaStream.getAudioTracks()[0].enabled) {
        consoleError('Audio track is not enabled');
    }
*/
    //Audio stream volume https://webrtc.github.io/samples/src/content/getusermedia/volume/
    // Put variables in global scope to make them available to the
    // browser console.
    loadScript("../js/soundmeter.js", function () {
        //consoleLog('createSoundMeter(videoID = ' + videoID + ', fileTransfer = ' + fileTransfer + ', MediaStream = ' + MediaStream + ')');
        //        fileTransfer.videoID = blockId;
        fileTransfer.soundMeter = new SoundMeter(window.audioContext);
        fileTransfer.soundMeterCallback = function (e) {
            if (e) {
                //alert(e);
                return;
            }
            //            var soundMeter = document.getElementById(getSoundMeterID(blockId));
            if (!soundMeter) {
                consoleError('soundMeter = ' + soundMeter);
                return;
            }
            soundMeter.style.display = 'block';
            //http://javascript.ru/setinterval
            window.clearInterval(fileTransfer.soundMeterIntervalID);
            fileTransfer.soundMeterIntervalID = setInterval(function () { fileTransfer.soundMeterInterval.call(fileTransfer) }, 200);
        }
        fileTransfer.soundMeterInterval = function () {
            //consoleLog('soundMeterInterval()');
//            var soundMeter = document.getElementById(getSoundMeterID(blockId));
            if (soundMeter == null) {//окно с идикатором уровня звука было закрыто
                window.clearInterval(this.soundMeterIntervalID);
                fileTransfer.soundMeter.stop();
                return;
            }
            var instantMeter = soundMeter.querySelector('meter');
            if (!instantMeter) {
                consoleError('soundMeter failed!');
                return;
            }
            var instantValueDisplay = soundMeter.querySelector('.value');
            instantMeter.value = this.soundMeter.instant.toFixed(2);
            instantValueDisplay.innerText = (this.soundMeter.instant * 100).toFixed();
        }
        fileTransfer.soundMeter.connectToSource(MediaStream, fileTransfer.soundMeterCallback);
    });
}

function onWaitPermissionOKAll(toID, waitPermissionId) {
    consoleLog('onWaitPermissionOKAll(' + toID + ')');
    var allConfirm, cookieName, elementPermissionID, mediaID;
    switch (parseInt(waitPermissionId)) {
        case 1: //Snapshot
        case 2: //Camera record
            mediaID = getCameraID(g_user.id);
            allConfirm = lang.allowAllConfirm;//Any viewer can take a snapshot from your video camera without your permission.\n\nYou can change the permissions in the settings of your camera. Place your mouse over your video broadcasting and click the ⚙ button for this.\n\nAre you shure you want to allow all the viewers to take a snapshot from your video camera?
            cookieName = 'AllowSnapshot';
            break;
        case 3://Microphone record
            mediaID = getMicrophoneID(g_user.id);
            allConfirm = lang.allowAllConfirmMicrophone;//Any listener can make audio recording from my microphone without permission.\n\nYou can change the permissions in the settings of my microphone. Place your mouse over my microphone and click the ⚙ button for this.\n\nAre you shure you want to allow all the listeners can make audio recording from my microphone without permission?
            cookieName = 'AllowMicrophoneRecord';
            break;
        default: {
            consoleError('onWaitPermissionOKAll(toID = ' + toID + ', waitPermissionId = ' + waitPermissionId + ')');
            return;
        }
    }
    if (!confirm(allConfirm))
        return;
    SetCookie(cookieName, 'true');
    var permission = getVideoBlock(mediaID).querySelector('#Settings').querySelector('#allow');
    if (permission)
        permission.checked = true;
    $.connection.chatHub.server.waitPermissionOK(toID, JSONWaitPermission(waitPermissionId));
    removeWaitPermission(toID, waitPermissionId);
}

function onWaitPermissionDenieAll(fromID, waitPermissionId) {
    consoleLog("onWaitPermissionDenieAll(" + fromID + ")");
    var allConfirm, cookieName, elementPermissionID, mediaID;
    switch (parseInt(waitPermissionId)) {
        case 1: //Snapshot
        case 2: //Camera record
            mediaID = getCameraID(g_user.id);
            allConfirm = lang.denieAllConfirm;//Any viewer can not take a snapshot from your video camera.\n\nYou can change the permissions in the settings of your camera. Place your mouse over your video broadcasting and click the ⚙ button for this.\n\nAre you shure you want to deny all the viewers to take a snapshot from your video camera?
            cookieName = 'AllowSnapshot';
            break;
        case 3://Microphone record
            mediaID = getMicrophoneID(g_user.id);
            allConfirm = lang.denieAllConfirmMicrophone;//Any listener can make audio recording from my microphone without permission.\n\nYou can change the permissions in the settings of my microphone. Place your mouse over my microphone and click the ⚙ button for this.\n\nAre you shure you want to allow all the listeners can make audio recording from my microphone without permission?
            cookieName = 'AllowMicrophoneRecord';
            break;
        default: {
            consoleError('onWaitPermissionDenieAll(toID = ' + toID + ', waitPermissionId = ' + waitPermissionId + ')');
            return;
        }
    }
    if (!confirm(allConfirm))
        return;
    SetCookie(cookieName, 'false');
    var permission = getVideoBlock(mediaID).querySelector('#Settings').querySelector('#deny');
    if (permission)
        permission.checked = true;
    $.connection.chatHub.server.waitPermissionDenie(fromID, JSONWaitPermission(waitPermissionId));
    removeWaitPermission(fromID, waitPermissionId);
}

function toggleMedia(track, fileTransfer) {
    consoleLog('toggleMedia() muted = ' + track.muted + ' enabled = ' + track.enabled);
    if (track.enabled)
        track.enabled = false;
    else track.enabled = true;

    var elementToggleMedia = fileTransfer.getBlock().querySelector('#toggleMedia');
    elementToggleMedia.title =
        track.enabled ?
            lang.pause//'Pause'
            : lang.continueBroadcast//'Continue broadcast'
    ;
    elementToggleMedia.innerHTML = track.enabled ? '❚❚' : '►';
}

function getToolMediaButtons(blockId, settingsTitle) {
    //Settings
    return '<h1 onclick="javascript: document.getElementById(\'' + blockId + '\').fileTransfer.onSettings()"'
        + ' class="sendButton" title="' + settingsTitle + '">'
        + '⚙</h1>'

        //Pause
        + '<h1 id="toggleMedia" onclick="javascript: document.getElementById(\'' + blockId + '\').fileTransfer.onToggleMedia()"'
            + ' class="sendButton" style="position: relative;" title="' + lang.pause + '">'//Pause
        + '❚❚</h1>';
}

