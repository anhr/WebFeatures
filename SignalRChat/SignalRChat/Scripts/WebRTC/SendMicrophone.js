/**
 * Common Javascript code.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.ucoz.net/AboutMe/
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

function SendMicrophone() {
    consoleLog('SendMicrophone()');
    var microphoneTransfers = 'microphoneTransfers';
    loadScript("Scripts/WebRTC/Microphone.js", function () {
        var microphones = new Microphones(microphoneTransfers);
        loadScript("Scripts/WebRTC/Media.js", function () {
            loadScript("Scripts/WebRTC/SendStream.js", function () {
                new SendStream({
                    header: '🎤 ' + lang.myMicrophone//'My microphone'
                        + elementMediaHeader(lang.listenersNumber)//Listeners number'
                    , informerFileTransfers: 'informerMicrophoneTransfers'
                    , fileTransfers: microphoneTransfers
                    , sendMediaName: 'sendMicrophone'
                    , branchFileTransfers: microphones.transfers.branchTransfers
                    , noFileTransfer: microphones.transfers.noFileTransfer
                    , session: {
                        audio: true
//                        , video: true
                    }
                    , elementFileTransfer: function (fileTransfer) {
                        return getElementMedia(elementSoundMeter('style="display:none"')
                            + '<span id = "SendMicrophone"></span>');//For isBroadcastMicrophone()
//                        return elementMicrophone('SendMicrophone');
                    }
                    , sendMedia: function () { new SendMicrophone(); }
                    , isUserMediaSuccess: function (stream) {
                        if (stream.getAudioTracks().length == 0) {
                            alert(lang.noAudioStream + browserSettings());//Audio stream is not detected. Probably your microphone is blocked for our web site.
                            return false;
                        }
                        return true;
                    }
                    , tools: function (fileTransfer) {
                        var blockId = fileTransfer.getBlockID();
                        fileTransfer.onToggleMedia = function () {
                            toggleMedia(this.stream.getAudioTracks()[0], this);
                        }
                        fileTransfer.onSettings = function () {
                            consoleLog('Microphone settings');
                            var elementSettings = document.getElementById(fileTransfer.getBlockID()).querySelector('#Settings');
                            var mediaStream = fileTransfer.stream;
                            if (elementSettings.innerHTML == '') {
                                var elementСameraSettingsBody =
                                    '<p align="center"><b>' + lang.microphoneSettings + '</b></p>';//'My microphone settings'

                                var blockId = fileTransfer.getBlockID();

                                //Направить аудио выход на аудиовход
                                //http://www.howtogeek.com/howto/39532/how-to-enable-stereo-mix-in-windows-7-to-record-audio/

                                //audio sources
                                var curAudioLabel;
                                if (typeof mediaStream == 'undefined')
                                    curAudioLabel = '';
                                else {
                                    var audioTracks = mediaStream.getAudioTracks();
                                    if (audioTracks.length == 0)
                                        curAudioLabel = '';
                                    else {
                                        if (audioTracks.length > 1)
                                            consoleError('audioTracks.length = ' + audioTracks.length);
                                        curAudioLabel = audioTracks[0].label;
                                    }
                                }

                                var audioInputDevices = DetectRTC.audioInputDevices;
/*
                                elementСameraSettingsBody += '<div><label for="' + blockId + 'audioSource">🎤 ' + lang.audioSource + ': </label>'//Audio source
                                    + '<select id="' + blockId + 'audioSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia()">';
*/
                                elementСameraSettingsBody += '<div><label for="audioSource">🎤 ' + lang.audioSource + ': </label>'//Audio source
                                    + '<select id="audioSource" onchange="document.getElementById(\'' + blockId + '\').fileTransfer.restartLocalMedia()">';
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
//                                elementСameraSettingsBody += elementSoundMeter();

                                //permissons
                                var allowMicrophoneRecordName = 'AllowMicrophoneRecord';
                                var allowMicrophoneRecord = get_cookie(allowMicrophoneRecordName, 'ask');
                                elementСameraSettingsBody +=
                                      '<hr>'
                                    + '<p align="center"><b>' + lang.permissions + '</b></p>'//Permissions
                                    + '<INPUT id="allow" type="radio" ' + ((allowMicrophoneRecord == 'true') ? 'checked' : '') + ' name="AllowMicrophone"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowMicrophoneRecordName + '\',\'true\')">' + lang.allowAllListenersTitle + '<br>'//'Allow all listeners to record sound from my microphone'
                                    + '<INPUT id="deny" type="radio" ' + ((allowMicrophoneRecord == 'false') ? 'checked' : '') + ' name="AllowMicrophone"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowMicrophoneRecordName + '\',\'false\')">' + lang.neverAllowAudioRecord + '<br>'//'Never allow to record sound from my microphone'
                                    + '<INPUT id="ask" type="radio" ' + ((allowMicrophoneRecord == 'ask') ? 'checked' : '') + ' name="AllowMicrophone"'
                                    + ' language="javascript" onclick="SetCookie(\'' + allowMicrophoneRecordName + '\',\'ask\')">' + lang.askPermission + '<br>'//Ask permission
                                ;

                                elementSettings.innerHTML = elementСameraSettingsBody;
                                if (typeof mediaStream != 'undefined')
                                    window.createSoundMeter(fileTransfer);
                            }
                            return onbranchelement(elementSettings);
                        }

                        fileTransfer.onclickMute = function () {
                            if (this.stream.getAudioTracks().length == 0) {
                                alert(lang.invalidAudio);//'The audio tracks is not avaialble on your system. Please setup a microphone.'
                                return false;
                            }
                            var audioTrack = this.stream.getAudioTracks()[0];
                            consoleLog('onclickMute() muted = ' + audioTrack.muted + ' enabled = ' + audioTrack.enabled);
                            if (audioTrack.enabled)
                                audioTrack.enabled = false;
                            else audioTrack.enabled = true;
                            return audioTrack.enabled;
                        }

                        fileTransfer.elementMicrophoneTools = true;//for restarting of the microphone

                        return elementMicrophoneTools(fileTransfer, {
                            localMediaTools: getToolMediaButtons(blockId, lang.microphoneSettings)//'My microphone settings'
                            , fileTransfer: fileTransfer
                            , onRecordMedia: 'onRecordMicrophone'
                        });
                    }
                    , elementCreated: function (fileTransfer) {
                        if (typeof fileTransfer.elementMicrophoneTools == 'undefined')
                            this.tools(fileTransfer);//restarting of the microphone

                        if (!DetectRTC.hasMicrophone) {
                            var message;
                            message = lang.setupMicrophone//'Please setup your microphone first.'
                            consoleError(message);
                            alert(message);
                            fileTransfer.closeSessionCause = closeSessionCauseEnum.setupMicrophone;
                            fileTransfer.cancelTransfer();
                            return;
                        }

                        this.elementCreatedSend(fileTransfer, {
                            devicesNotFoundError: lang.setupMicrophone//'Please setup your microphone first.'
                            , video: false
                            , getUserMediaSuccess: function (stream) {
                                consoleLog('SendMicrophone getUserMediaSuccess');
//                                fileTransfer.stream = stream;
                                window.createSoundMeter(fileTransfer);

                                var block = fileTransfer.getBlock();

                                var elementMedia = block.querySelector('#' + getSoundMeterID());//для камеры это video тег

                                fileTransfer.getCurrentTime = function () {
                                    return parseInt((parseInt(new Date().getTime()) - fileTransfer.startTime) / 1000);
                                }

                                fileTransfer.mediaSuccess(elementMedia);
                            }
                        });
                    }
                    , closeSession: function () {
//                        consoleLog('closeSession()');
/*
                        if (typeof this.options == 'undefined')
                            return;//аварийное закрытие блока микрофона. Например когда микрофон не обнаружен в системе
*/
                        this.options.options.stopLocalMedia(this, 'Microphone');
                    }
                });
            });
        });
    });
}
