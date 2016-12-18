//WebRTC PeerConnection и DataChannel: получить файл
//https://habrahabr.ru/post/187270/

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
