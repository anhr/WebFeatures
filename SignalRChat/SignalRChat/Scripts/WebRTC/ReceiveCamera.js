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

function ReceiveCamera(user, options) {
    loadScript("Scripts/WebRTC/Camera.js", function () {
        var cameras = new Cameras(options.fileTransfers);
        loadScript("Scripts/WebRTC/Media.js", function () {
            ReceiveFile(user, options, {
                header: '📹 ' + '<span id="header">' + lang.videoFrom + '</span>'//'Camera of '
                , headerEnd: elementMediaHeader(lang.viewersNumber)//'Viewers number'
                , informerFileTransfers: 'informerCameraTransfers'
                , fileTransfers: options.fileTransfers
                , branchFileTransfers: cameras.transfers.branchTransfers
                , noFileTransfer: cameras.transfers.noFileTransfer
//                , mediaRecordingFunction: 'videoRecording'
                , elementFileTransfer: function (fileTransfer) {
                    var id;
                    return elementCamera(id, 'controls');
                } 
                , started: function () {
                    return lang.startedVideo;//' has started the broadcast from camera'
                }
                , stopped: function () {
                    return lang.closedVideo;//' has closed the broadcast from camera. '
                }
                , tools: function (fileTransfer) {
                    fileTransfer.onRecordVideo = function (blockId) {
                        consoleLog('fileTransfer.onRecordVideo');

                        window.onRecordVideo(blockId);

                        var record = this.getBlock().querySelector('#Record');

                        if (!isBranchExpanded(record))
                            return;//не делать запрос на резрешение при закрытии окна записи медиа

                        if (record.querySelector('#record').disabled) {
                            consoleLog('record is disabled');
//                            alert(options.recordNotAllow);
                            alert(lang.cameraRecordNotAllow);//'The owner of the video camera does not allow to you to request new permissions for video recording.'
                            return; 
                        }

                        var waitPermission = record.querySelector('#waitPermission');
                        record.querySelector('#recordBlock').style.display = 'none';
                        fileTransfer.waitPermission(waitPermission, 2//camera
                            , lang.waitVideoRecordPermission.replace('%s', user.nickname));//Waiting for permission from %s for start of the video recording
                    }
                    fileTransfer.options.onСanvas = function () {
                        consoleLog('ReceiveCamera.onСanvas()');
//                        fileTransfer.onСanvas();
                        var block = fileTransfer.getBlock();
                        var elementSnapshot = block.querySelector('#Snapshot');
                        if (!isBranchExpanded(elementSnapshot)){
                            if (elementSnapshot.querySelector('#takeSnapshot').disabled) {
                                consoleLog('take snapshot is disabled');
                                alert(lang.snapshotNotAllow);//'The owner of the video camera does not allow to you to request a new permissions to take a snapshot'
                                return;
                            }
                            var waitPermission = elementSnapshot.querySelector('#waitPermission');
                            if (waitPermission == null) {
                                waitPermission = document.createElement("div");
                                waitPermission.id = 'waitPermission';
                                waitPermission.innerHTML = '<span id="message"></span> <span id="respoce"></span>';
                                elementSnapshot.appendChild(waitPermission);
                            }
                            elementSnapshot.querySelector('#snapshotBlock').style.display = 'none';
                            elementSnapshot.querySelector('canvas').style.display = 'none';
                            fileTransfer.waitPermission(waitPermission, 1//Snapshot
                                , lang.waitSnapshotPermission.replace('%s', fileTransfer.user.nickname));//Waiting for permission from %s to take a snapshot
                        }

                        onbranchelement(elementSnapshot);
                        resizeVideos();
                    }
                    return elementCameraTools(fileTransfer, {
//                        toggleMediaRecording: 'document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.toggleVideoRecording'
                        onRecordMedia: 'document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.onRecordVideo'
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
                    if (isBranchExpanded(elementToggle)) {//stop receive stream
                        consoleLog('stop receive stream. this.ID: ' + this.ID);
                        fileTransfer.stopRecording();
                        header = lang.videoFrom;//'Camera of '
                        message = lang.broadcastingCanceled;//'The broadcasting canceled.'
                        fileTransfer.disconnect();
                    } else {
                        consoleLog('Start receive stream. this.ID: ' + this.ID);

                        header = lang.cancelStream;//'Cancel broadcast from '
                        message = lang.connectionWaiting;//'Connection waiting.'

                        //Peer connection
                        receiveStream(fileTransfer, {
                            mediaTagName: 'video'
                            , session: {
                                audio: true
                                , video: true
                            }
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
