function peerReceive(fileTransfer, options) {
    var dataID = fileTransfer.ID, senderId = fileTransfer.user.id;
    consoleLog('peerReceive(dataID: ' + dataID + ', senderId: ' + senderId + ')');
    if (typeof fileTransfer.peer != 'undefined')
        consoleError('fileTransfer.peer = ' + fileTransfer.peer);
    loadScript("Scripts/WebRTC/Peer.js", function () {
        fileTransfer.peer = new peer.peer(dataID, senderId, {
            start: function (peer) {
                consoleLog('peerReceive.start()');
                if (typeof peer == 'undefined')
                    peer = this;
                peer.setRemoteSDP = function (sdp) {
                    peer.pc.setRemoteDescription(new peer._RTCSessionDescription(sdp))
                    .then(function () {
                        if (peer.pc.remoteDescription.type == 'offer') {
                            try {
                                peer.pc.createAnswer().then(function (answer) {
                                    return peer.pc.setLocalDescription(answer);
                                })
                                .then(function () {
                                    peer.sendToReceiver(senderId);
/*
                                    // Отправляем другому участнику через сигнальный сервер
                                    peer.socket.send(senderId, {
                                        userid: g_user.id,//.nickname,//root.userid,
                                        sdp: peer.pc.localDescription
                                    });
*/
                                })
                                .catch(peer.reportError);
                            } catch (e) {
                                consoleError('peer.pc.createAnswer() failed! ' + e);

                                //for Opera android
                                var offerAnswerConstraints = {
                                    optional: [],
                                    mandatory: {
                                        OfferToReceiveAudio: true,
                                        OfferToReceiveVideo: true
                                    }
                                };
                                peer.pc.createAnswer(function (offer) {
                                    consoleLog('peer.createAnswer(...)');
                                    peer.pc.setLocalDescription(offer);
                                    peer.sendToReceiver(senderId);
                                }, peer.reportError, offerAnswerConstraints);
                            }
                        } else consoleError('pc.remoteDescription.type = ' + peer.pc.remoteDescription.type);
                    })
                    .catch(function (errMessage) {
                        consoleError(errMessage.name + ": " + errMessage.message + '. sdp: ' + JSON.stringify(sdp));
                    });
                }
                peer.socket.send(senderId, {
                    user: g_user
                    , participationRequest: true
                    , stream: ((typeof options != 'undefined') && (typeof options.stream != 'undefined')) ? options.stream : false//true - receive stream, false - receive file
                });
            }
            , options: options
            , onchannelopen: function (event) {
                consoleLog('peerReceive.onchannelopen()');
                //                        channel.send('Hello');
                //window.clearInterval(this.appFileTransfer.fileTransfer.getBlock().addMedia.oniceTimeoutId);

                //                            this.send(JSON.stringify({
                //                                receiver: JSON.stringify(g_user)
                //                            }));

                if (typeof fileTransfer.onChannelOpened != 'undefined')
                    fileTransfer.onChannelOpened();
            }
            , onchannelmessage: function (event) {
                //consoleLog('peerReceive.onchannelmessage: ' + event.data);

                var byteLength;
                if (typeof event.data.byteLength == 'undefined') {
                    if (typeof event.data.size == 'undefined') {
                        consoleError('event.data.size = ' + event.data.size + ' ' + event.data);
                        return;
                    }
                    byteLength = event.data.size;//firefox
                } else byteLength = event.data.byteLength;
                /*
                                            if (typeof this.receiveBuffer == 'undefined') {
                                                this.receiveBuffer = [];
                                                this.receivedSize = 0;
                                            }
                                            try {
                                                this.receiveBuffer.push(event.data);
                                            } catch (e) {
                                                consoleError(e);
                                                return;
                                            }
                                            this.receivedSize += byteLength;
                */
                try {
                    fileTransfer.receiveBuffer.push(event.data);
                } catch (e) {
                    consoleError(e);
                    return;
                }
                fileTransfer.receivedSize += byteLength;

                //consoleLog('peerReceive.onmessage(). event.data = ' + event.data + ' event.data.byteLength = ' + event.data.byteLength + ' this.receivedSize = ' + this.receivedSize);

                fileTransfer.onFileProgress({
                    received: fileTransfer.receivedSize
                    , length: fileTransfer.file.size
                });

                if (fileTransfer.receivedSize === fileTransfer.file.size) {

                    fileTransfer.onFileProgress({
                        received: fileTransfer.receivedSize
                        , length: fileTransfer.file.size
                        , last: true
                    });

                    fileTransfer.onFileReceived();
                    fileTransfer.getBlock().querySelector('#download').onclick = function () {
                        consoleLog('download this = ' + this);
                        //                                    var received = new window.Blob(fileTransfer.peer.channel.receiveBuffer);
                        var received = new window.Blob(fileTransfer.receiveBuffer);
                        var hyperlink = document.createElement('a');
                        hyperlink.href = URL.createObjectURL(received);
                        hyperlink.target = '_blank';
                        hyperlink.download = fileTransfer.file.name;

                        var mouseEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });

                        hyperlink.dispatchEvent(mouseEvent);
                        (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
                    }
                }
            }
        });
    });
}
