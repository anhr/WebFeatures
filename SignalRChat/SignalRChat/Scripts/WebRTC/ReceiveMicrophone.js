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

function ReceiveMicrophone(user, options) {
    loadScript("Scripts/WebRTC/Microphone.js", function () {
        var microphones = new Microphones(options.fileTransfers);
        loadScript("Scripts/WebRTC/Media.js", function () {
            ReceiveFile(user, options, {
                header: '🎤 ' + '<span id="header">' + lang.microphoneOf + '</span>'//'Microphone of '
                , headerEnd: elementMediaHeader(lang.listenersNumber)//Listeners number'
                , informerFileTransfers: 'informerMicrophoneTransfers'
                , fileTransfers: options.fileTransfers
                , branchFileTransfers: microphones.transfers.branchTransfers
                , noFileTransfer: microphones.transfers.noFileTransfer
//                , mediaRecordingFunction: 'audioRecording'
                , elementFileTransfer: function (fileTransfer) {
                    return getElementMedia('<audio id="receiver" autoplay controls style="display:none;width:inherit"></audio>');
                } 
                , started: function () {
                    return lang.startedAudio;//' has started the broadcast from microphone'
                }
                , stopped: function () {
                    return lang.closedMicrophone;//' has closed the broadcast from microphone. '
                }
                , tools: function (fileTransfer) {
                    fileTransfer.onRecordAudio = function (blockId) {
                        consoleLog('fileTransfer.onRecordAudio');

                        window.onRecordMicrophone(blockId);

                        var record = this.getBlock().querySelector('#Record');

                        if (!isBranchExpanded(record))
                            return;//не делать запрос на резрешение при закрытии окна записи медиа

                        if (record.querySelector('#record').disabled) {
                            consoleLog('record is disabled');
//                            alert(options.recordNotAllow);
                            alert(lang.microphoneRecordNotAllow);//'The owner of the microphone does not allow to you to request new permissions for audio recording.'
                            return; 
                        }

                        var waitPermission = record.querySelector('#waitPermission');
                        record.querySelector('#recordBlock').style.display = 'none';
                        fileTransfer.waitPermission(waitPermission, 3//Microphone
                            , lang.waitAudioRecordPermission.replace('%s', user.nickname));//'Waiting for permission from %s for start of the audio recording'
                    }
                    return elementMicrophoneTools(fileTransfer, {
                        onRecordMedia: 'document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.onRecordAudio'
                    });
                }
                , elementCreated: function (fileTransfer) {
                    consoleLog('elementCreated(...)');
                    var block = fileTransfer.getBlock();
                    block.querySelector('#tools').style.display = 'none';

                    fileTransfer.startTime = parseInt(new Date().getTime() - parseInt(options.currentTime) * 1000);
                    fileTransfer.intervalID = window.setInterval(function () {
                        //consoleLog('display current time receiving');
                        window.displayDuration(fileTransfer.startTime, block.querySelector('#currentTime'));
                    }, 1000);
                }
                , isBranch: true
                , receiveStream: function (fileTransfer) {
                    var elementBlock = fileTransfer.getBlock();
                    var elementToggle = elementBlock.querySelector('#branch');//toggle');
                    var header;
                    var message;
                    if (isBranchExpanded(elementToggle)) {
                        consoleLog('stop receive stream. this.ID: ' + this.ID);
                        fileTransfer.stopRecording();
                        header = lang.microphoneOf;//'Turn on microphone from '
                        message = lang.broadcastingCanceled;//'The broadcasting canceled.'
                        fileTransfer.disconnect();
                    } else {
                        consoleLog('Start receive stream. this.ID: ' + this.ID);

                        header = lang.cancelStream;//'Cancel broadcast from '
                        message = lang.connectionWaiting;//'Connection waiting.'

                        //Peer connection
                        receiveStream(fileTransfer, {
                            mediaTagName: 'audio'
                            , session: { audio: true }
                        });
                    }
                    elementBlock.querySelector('#header').innerText = header;
                    elementBlock.querySelector('#Message').innerText = message;
                    elementBlock.querySelector('#wait').style.display = 'inline';
                    onbranchelement(elementToggle);
                }
            });
        });
    });
}
