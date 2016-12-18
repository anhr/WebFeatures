//WebRTC PeerConnection и DataChannel: получить файл
//https://habrahabr.ru/post/187270/

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
                    return elementCamera();
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
