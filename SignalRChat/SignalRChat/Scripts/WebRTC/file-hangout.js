// Muaz Khan       - wwww.MuazKhan.com
// MIT License     - www.WebRTC-Experiment.com/licence
// Documentation   - github.com/muaz-khan/WebRTC-Experiment/tree/master/file-hangout
// =============
// file-hangout.js
/*
(function selfInvoker() {
    setTimeout(function() {
        if (typeof window.RTCPeerConnection != 'undefined') setUserInterface();
        else selfInvoker();
    }, 1000);
})();
*/
function FileHangout(fileTransfer) {
    console.log('FileHangout');
    this.fileTransfer = fileTransfer;
    this.setUserInterface = function () {
        console.log('FileHangout.setUserInterface');
//        hangoutUI = this.hangoutUI = this.hangout(this.config);
        if (typeof this.hangoutUI == 'undefined')
            this.hangoutUI = this.hangout(this.config, this.fileTransfer);
        else this.hangoutUI.fileHangout.openDefaultSocket();//connection again

        console.log('FileHangout.setUserInterface() this.hangoutUI = ' + this.hangoutUI);

        //currently not used
        startConferencing = document.getElementById('start-conferencing');
        if (startConferencing)
            startConferencing.onclick = function () {
                hangoutUI.createRoom({
                    userName: prompt('Enter your name', 'Anonymous'),
                    roomName: (document.getElementById('conference-name') || {}).value || 'Anonymous'
                });
                hideUnnecessaryStuff();
            };

        participants = document.getElementById('participants');
        roomsList = document.getElementById('rooms-list');

        chatOutput = document.getElementById('chat-output');

        //currently not used
        fileElement = document.getElementById('file');
        if (fileElement) {
            fileElement.onchange = function () {
                var file = fileElement.files[0];

                FileSender.send({
                    channel: hangoutUI,
                    file: file,
                    onFileSent: function (file) {
                        quickOutput(file.name, 'sent successfully!');
                        disable(false);
                        statusDiv.innerHTML = '';
                    },
                    onFileProgress: function (e) {
                        statusDiv.innerHTML = e.sent + ' packets sent. ' + e.remaining + ' packets remaining.';
                    }
                });

                return disable(true);
            };
        }

        outputPanel = document.getElementById('output-panel');
        statusDiv = document.getElementById('status');
        unnecessaryStuffVisible = true;

        var uniqueToken = document.getElementById('unique-token');
        if (uniqueToken)
            if (location.hash.length > 2)
                uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this Link!</a></h2>';
            else
                uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.round(Math.random() * 999999999) + 999999999);
    }

    this.config = {
        fileHangout: this,
        openSocket: function (config) {
            // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
            // This method "openSocket" can be defined in HTML page
            // to use any signaling gateway either XHR-Long-Polling or SIP/XMPP or WebSockets/Socket.io
            // or WebSync/SignalR or existing implementations like signalmaster/peerserver or sockjs etc.

    //        var channel = config.channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
            var channel = config.channel || 'MyChannelUnderConstraction';
            config.fileHangout = this.fileHangout
            var firebaseURL = 'https://webrtc.firebaseIO.com/' + channel;
            var socket = new Firebase(firebaseURL);
            console.log('config.openSocket ' + firebaseURL);
            socket.channel = channel;
            socket.on("child_added", function(data) {
                config.onmessage && config.onmessage(data.val());
            });
            socket.send = function(data) {
                this.push(data);
            };
            config.onopen && setTimeout(config.onopen, 1);
            socket.onDisconnect().remove();
            return socket;
        },
        onRoomFound: function (room) {
            console.log('config.onRoomFound');
            var alreadyExist = document.getElementById(room.broadcaster);
            if (alreadyExist) return;

            if (typeof roomsList === 'undefined') roomsList = document.body;

            if (typeof this.fileHangout.hangoutUI != 'undefined')
                this.fileHangout.hangoutUI.joinRoom({
                    roomToken: room.roomToken,
                    joinUser: room.broadcaster,
                    userName: g_user.nickname,//prompt('Enter your name', 'Anonymous')
                });
//            hideUnnecessaryStuff();
/*
            var tr = document.createElement('tr');
            tr.setAttribute('id', room.broadcaster);
            tr.style.fontSize = '.8em';
            tr.innerHTML = '<td>' + room.roomName + '</td>' +
                '<td><button class="join" id="' + room.roomToken + '">Join</button></td>';

            roomsList.insertBefore(tr, roomsList.firstChild);

            tr.onclick = function() {
                var tr = this;
                hangoutUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id,
                    userName: prompt('Enter your name', 'Anonymous')
                });
                hideUnnecessaryStuff();
            };
*/
        },
        onChannelOpened: function () {
            //console.log('config.onChannelOpened');
            unnecessaryStuffVisible && hideUnnecessaryStuff();
            if (fileElement) fileElement.removeAttribute('disabled');
            if (typeof this.fileHangout.fileTransfer.onChannelOpened != 'undefined')
                this.fileHangout.fileTransfer.onChannelOpened();
        },
        onChannelMessage: function (data) {
            //console.log('config.onChannelMessage');
            if (data.sender && participants) {

                var fileTransfer = this.fileHangout.fileTransfer;
                if (fileTransfer.isReceiver())
                    return;
                var file = fileTransfer.getBlock().querySelector('#fileInput').files[0];
                FileSender.send({
                    channel: this.fileHangout.hangoutUI,
                    file: file,
                    onFileSent: function (file) {
                        quickOutput(file.name, 'sent successfully!');
                        disable(false);
                        statusDiv.innerHTML = '';
                    },
                    onFileProgress: function (e) {
                        statusDiv.innerHTML = e.sent + ' packets sent. ' + e.remaining + ' packets remaining.';
                    }
                });

/*
                var tr = document.createElement('tr');
                tr.innerHTML = '<td>' + data.sender + ' is ready to receive files!</td>';
                participants.insertBefore(tr, participants.firstChild);
*/
            } else this.fileHangout.onMessageCallback(data);
        }
    };

    // Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/file-hangout
    // ----------
    // hanogut.js

    this.hangout = function (config, fileTransfer) {
        console.log('hangout');
        var self = {
            userToken: uniqueToken(),
            userName: 'Anonymous'
        },
            channels = '--',
            isbroadcaster,
            sockets = [],
            isGetNewRoom = true,
            arrayUsers = [];

        this.defaultSocket = {}, RTCDataChannels = [];

        this.openDefaultSocket = function () {
            console.log('hangout.openDefaultSocket');
            this.defaultSocket = config.openSocket({
                onmessage:  onDefaultSocketResponse,
                callback: function (socket) {
                    defaultSocket = socket;
                }
                , channel: this.fileTransfer.ID
            });
        }

        function onDefaultSocketResponse(response) {
            //console.log('hangout.onDefaultSocketResponse');
            if (response.userToken == self.userToken) return;

            if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

            console.debug('response.newParticipant = ' + response.newParticipant + ' self.joinedARoom = ' + self.joinedARoom + ' self.broadcasterid = ' + self.broadcasterid + ' response.userToken = ' + response.userToken);
            if (response.newParticipant && self.joinedARoom && self.broadcasterid == response.userToken) onNewParticipant(response.newParticipant);

            if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
                channels += response.userToken + '--';
                //consoleError('user: ' + response.userName);
                arrayUsers.forEach(function (item, i, arr) {
                    if (item == response.userName) {
                        consoleError('Duplicate user: ' + response.userName);
                        return;
                    }
                });
                arrayUsers.push(response.userName);
                openSubSocket({
                    isofferer: true,
                    channel: response.channel || response.userToken,
                    closeSocket: true
                });
            }
        }

        function openSubSocket(_config) {
            console.log('hangout.openSubSocket');
            if (!_config.channel) return;
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function () {
                    if (isofferer && !peer) initPeer();
                    sockets.push(socket);
                }
            };

            socketConfig.callback = function (_socket) {
                socket = _socket;
                this.onopen();
            };

            var socket = config.openSocket(socketConfig),
                isofferer = _config.isofferer,
                gotstream,
                inner = {},
                peer;

            var peerConfig = {
                onICE: function (candidate) {
                    socket.send({
                        userToken: self.userToken,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onChannelOpened: onChannelOpened,
                onChannelMessage: function (event) {
                    config.onChannelMessage(event.data.size ? event.data : JSON.parse(event.data));
                }
                , fileHangout: config.fileHangout
            };

            function initPeer(offerSDP) {
                console.log('hangout.openSubSocket.initPeer');
                if (!offerSDP) {
                    peerConfig.onOfferSDP = sendsdp;
                } else {
                    peerConfig.offerSDP = offerSDP;
                    peerConfig.onAnswerSDP = sendsdp;
                }

                peer = RTCPeerConnection(peerConfig);
            }

            function onChannelOpened(channel) {
                console.log('hangout.openSubSocket.onChannelOpened');
                RTCDataChannels.push(channel);
                channel.send(JSON.stringify({
                    sender: self.userName
                }));

                if (config.onChannelOpened) config.onChannelOpened(channel);

                if (isbroadcaster && channels.split('--').length > 3) {
                    /* broadcasting newly connected participant for video-conferencing! */
                    defaultSocket.send({
                        newParticipant: socket.channel,
                        userToken: self.userToken
                    });
                }

                /* closing subsocket here on the offerer side */
                if (_config.closeSocket) socket = null;

                gotstream = true;
            }

            function sendsdp(sdp) {
                console.log('hangout.openSubSocket.sendsdp');
                sdp = JSON.stringify(sdp);
                var part = parseInt(sdp.length / 3);

                var firstPart = sdp.slice(0, part),
                    secondPart = sdp.slice(part, sdp.length - 1),
                    thirdPart = '';

                if (sdp.length > part + part) {
                    secondPart = sdp.slice(part, part + part);
                    thirdPart = sdp.slice(part + part, sdp.length);
                }

                socket.send({
                    userToken: self.userToken,
                    firstPart: firstPart
                });

                socket.send({
                    userToken: self.userToken,
                    secondPart: secondPart
                });

                socket.send({
                    userToken: self.userToken,
                    thirdPart: thirdPart
                });
            }

            function socketResponse(response) {
                //console.log('hangout.openSubSocket.socketResponse');
                if (response.userToken == self.userToken) return;

                if (response.firstPart || response.secondPart || response.thirdPart) {
                    if (response.firstPart) {
                        inner.firstPart = response.firstPart;
                        if (inner.secondPart && inner.thirdPart) selfInvoker();
                    }
                    if (response.secondPart) {
                        inner.secondPart = response.secondPart;
                        if (inner.firstPart && inner.thirdPart) selfInvoker();
                    }

                    if (response.thirdPart) {
                        inner.thirdPart = response.thirdPart;
                        if (inner.firstPart && inner.secondPart) selfInvoker();
                    }
                }

                if (response.candidate && !gotstream) {
                    peer && peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.left) {
                    if (peer && peer.peer) {
                        peer.peer.close();
                        peer.peer = null;
                    }
                }
            }

            var invokedOnce = false;

            function selfInvoker() {
                console.log('hangout.openSubSocket.selfInvoker');
                if (invokedOnce) return;

                invokedOnce = true;

                inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

                if (isofferer) peer.addAnswerSDP(inner.sdp);
                else initPeer(inner.sdp);
            }
            return socket;
        }

        function leave() {
            console.log('hangout.leave');
            var length = sockets.length;
            for (var i = 0; i < length; i++) {
                var socket = sockets[i];
                if (socket) {
                    socket.send({
                        left: true,
                        userToken: self.userToken
                    });
                    delete sockets[i];
                }
            }
        }

        fileTransfer.leave = leave;

        window.onunload = function () {
            leave();
        };

        window.onkeyup = function (e) {
            if (e.keyCode == 116) leave();
        };

        this.startBroadcasting = function () {
            //console.log('hangout.startBroadcasting');
            this.defaultSocket && this.defaultSocket.send({
                roomToken: self.roomToken,
                roomName: self.roomName,
                broadcaster: self.userToken
            });
            setTimeout(this.startBroadcasting, 3000);
        }

        function onNewParticipant(channel) {
            console.log('hangout.onNewParticipant');
            if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
            channels += channel + '--';

            var new_channel = uniqueToken();
            openSubSocket({
                channel: new_channel,
                closeSocket: true
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: channel,
                channel: new_channel
            });
        }

        function uniqueToken() {
            console.log('hangout.uniqueToken');
            var s4 = function () {
                return Math.floor(Math.random() * 0x10000).toString(16);
            };
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }

        this.openDefaultSocket();
        return {
            fileHangout: this,
//            defaultSocket: defaultSocket,
            self: self,
//            arrayUsers: arrayUsers,
            createRoom: function (_config) {
                console.log('hangout.createRoom');
                self.roomName = _config.roomName || 'Anonymous';
                self.roomToken = uniqueToken();
                if (_config.userName) self.userName = _config.userName;

                isbroadcaster = true;
                isGetNewRoom = false;
                _config.fileHangout.startBroadcasting();
            },
            joinRoom: function (_config) {
                consoleLog('hangout.joinRoom');
/*
                if (typeof this.arrayUsers == 'undefined')
                    this.arrayUsers = [];
                this.arrayUsers.forEach(function (item, i, arr) {
                    if (item == _config.userName) {
                        consoleError('Duplicate user: ' + _config.userName);
                        return;
                    }
                });
                this.arrayUsers.push(_config.userName);
*/

                self.roomToken = _config.roomToken;
                if (_config.userName) self.userName = _config.userName;
                isGetNewRoom = false;

                self.joinedARoom = true;
                self.broadcasterid = _config.joinUser;

                this.subSocket = openSubSocket({
                    channel: self.userToken
                });

                this.fileHangout.defaultSocket.send({
                    participant: true,
                    userToken: self.userToken,
                    joinUser: _config.joinUser,
                    userName: _config.userName//for debugging
                });
            },
            leaveRoom: function () {
                console.log('hangout.leaveRoom');
//                this.arrayUsers = [];
                this.fileHangout.defaultSocket.send({
                    left: true,
                    userToken: self.userToken
                });
                this.fileHangout.defaultSocket.onDisconnect().remove();
                delete this.fileHangout.defaultSocket;
                this.subSocket.onDisconnect().remove();
                delete this.subSocket;
            },
            send: function (data) {
                //console.log('hangout.send');
                var length = RTCDataChannels.length;
                if (!length) return;
                for (var i = length - 1; i >= 0; i--) {
                    switch (RTCDataChannels[i].readyState) {
                        case 'open':
                            RTCDataChannels[i].send(data);
                            break;
                        case 'closed':
                            //console.log('RTCDataChannels[' + i + '].readyState = ' + RTCDataChannels[i].readyState);
//                            delete RTCDataChannels[i];
                            RTCDataChannels.splice(i, 1);
                            if (RTCDataChannels.length == 0)
                                return false;//all data channels have been cancelled
                            break;
                        default:
                            consoleError('RTCDataChannels[' + i + '].readyState = ' + RTCDataChannels[i].readyState);
                    }
                }
                return true;
            }
        };
    }

    this.onMessageCallback = function (data) {
        //console.log('onMessageCallback');
        if (data.connected) {
            quickOutput('Your friend is connected.');
            return;
        }

        disable(true);

        // receive file packets
        this.fileReceiver.receive(data, {
            fileTransfer: this.fileTransfer,
            onFileReceived: function (fileName) {
                //console.log('onFileReceived');
                fileTransfer.onFileReceived();
/*
                quickOutput(fileName, 'received successfully!');
                disable(false);
                statusDiv.innerHTML = '';
*/
            },
            onFileProgress: function (e) {
                //console.log('onFileProgress');
                fileTransfer.onFileProgress(e);
//                statusDiv.innerHTML = e.received + ' packets received. ' + e.remaining + ' packets remaining.';
            }
        });
    }

    this.setUserInterface();
}


//var fileReceiver = new FileReceiver();

// -------------------------

function getRandomString() {
    return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
}

var FileSender = {
    send: function (config) {
        console.log('FileSender.send');
        var channel = config.channel,
            file = config.file;

        var packetSize = 10 * 1000,
            textToTransfer = '',
            numberOfPackets = 0,
            packets = 0;

        // uuid is used to uniquely identify sending instance
        var uuid = getRandomString();

        //https://localhost/WebRTCSamples/src/content/datachannel/filetransfer/
        //http://webrtc.github.io/samples/src/content/datachannel/filetransfer/
        var chunkSize = 16384;
        var sliceFile = function (offset) {
            console.log('sliceFile(' + offset + ')');
            var reader = new window.FileReader();
            reader.onload = (function () {
                return function (e) {
                    console.log('received = ' + (offset + e.target.result.byteLength));
//                    sendChannel.send(e.target.result);
                    if (!channel.send(e.target.result))
                        return;//all data channels have been cancelled
                    if (file.size > offset + e.target.result.byteLength) {
                        window.setTimeout(sliceFile, 0, offset + chunkSize);
                    }
//                    sendProgress.value = offset + e.target.result.byteLength;
                };
            })(file);
            var slice = file.slice(offset, offset + chunkSize);
            reader.readAsArrayBuffer(slice);
        };
        sliceFile(0);

/*
        var reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = onReadAsDataURL;

        function onReadAsDataURL(event, text) {
            //console.log('FileSender.onReadAsDataURL');
            var data = {
                type: 'file',
                uuid: uuid
            };

            if (event) {
                text = event.target.result;
                numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
            }

            if (config.onFileProgress)
                config.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets
                }, uuid);

            if (text.length > packetSize) data.message = text.slice(0, packetSize);
            else {
                data.message = text;
                data.last = true;
                data.name = file.name;

                if (config.onFileSent) config.onFileSent(file);
            }

            // WebRTC-DataChannels.send(data, privateDataChannel)
            if (!channel.send(JSON.stringify(data)))
                return;//all data channels have been cancelled

            textToTransfer = text.slice(data.message.length);

            if (textToTransfer.length) {
                setTimeout(function() {
                    onReadAsDataURL(null, textToTransfer);
                }, 100);
            }
        }
*/
    }
};

function FileReceiver() {
    console.log('FileReceiver');
    var content = {};
        packets = {},
        numberOfPackets = {};

    function receive(data, config) {
        //console.log('FileReceiver.receive');
        // uuid is used to uniquely identify sending instance
        uuid = data.uuid;

        if (data.packets)
            numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);

        if (config.onFileProgress && (typeof numberOfPackets[uuid] != 'undefined'))
            config.onFileProgress({
                remaining: packets[uuid]--,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid]
            }, uuid);

        if (!this.content[uuid]) this.content[uuid] = [];

        this.content[uuid].push(data.message);

        if (data.last) {
            this.uuidLast = uuid;
            this.dataName = data.name;
            /*
            var dataURL = this.content[uuid].join('');
            var blob = FileConverter.DataUrlToBlob(dataURL);
            var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);
            
            // todo: should we use virtual-URL or data-URL?
            FileSaver.SaveToDisk(dataURL, data.name);
            */
            if (config.onFileReceived) config.onFileReceived(data.name);
//            delete content[uuid];
        }
    }

    return {
        receive: receive
        , content: content
    };
}

var FileSaver = {
    SaveToDisk: function (fileUrl, fileName) {
        console.log('FileSaver.SaveToDisk');
        var hyperlink = document.createElement('a');
        hyperlink.href = fileUrl;
        hyperlink.target = '_blank';
        hyperlink.download = fileName || fileUrl;

        var mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        hyperlink.dispatchEvent(mouseEvent);
        (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
    }
};

var FileConverter = {
    DataUrlToBlob: function (dataURL) {
        console.log('FileConverter.DataUrlToBlob');
        var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1));
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        var type;

        try {
            type = dataURL.substr(dataURL.indexOf(':') + 1).split(';')[0];
        } catch(e) {
            type = 'text/plain';
        }

        return new Blob([new Uint8Array(array)], { type: type });
    }
};

function hideUnnecessaryStuff() {
    console.log('hideUnnecessaryStuff');
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;

    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    unnecessaryStuffVisible = false;
    if (startConferencing) startConferencing.style.display = 'none';
}

function quickOutput(message, message2) {
    if (!outputPanel) return;
    if (message2) message = '<strong>' + message + '</strong> ' + message2;

    var tr = document.createElement('tr');
    tr.innerHTML = '<td style="width:80%;">' + message + '</td>';
    outputPanel.insertBefore(tr, outputPanel.firstChild);
}

function disable(_disable) {
    if (!fileElement) return;
    if (!_disable) fileElement.removeAttribute('disabled');
    else fileElement.setAttribute('disabled', true);
}

// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
// -------------------------
// RTCPeerConnection-v1.6.js

// Last time updated at April 16, 2014, 08:32:23

// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

window.moz = !!navigator.mozGetUserMedia;
var chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]);

function RTCPeerConnection(options) {
    console.log('RTCPeerConnection');
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var iceServers = [];

    if (moz) {
        iceServers.push({
            url: 'stun:23.21.150.121'
        });

        iceServers.push({
            url: 'stun:stun.services.mozilla.com'
        });
    }

    if (!moz) {
        iceServers.push({
            url: 'stun:stun.l.google.com:19302'
        });

        iceServers.push({
            url: 'stun:stun.anyfirewall.com:3478'
        });
    }

    if (!moz && chromeVersion < 28) {
        iceServers.push({
            url: 'turn:homeo@turn.bistri.com:80',
            credential: 'homeo'
        });
    }

    if (!moz && chromeVersion >= 28) {
        iceServers.push({
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        });

        iceServers.push({
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        });
    }

    if (options.iceServers) iceServers = options.iceServers;

    iceServers = {
        iceServers: iceServers
    };

    //console.debug('ice-servers', JSON.stringify(iceServers.iceServers, null, '\t'));

    var optional = {
        optional: []
    };

    var peer = new PeerConnection(iceServers, optional);

    openOffererChannel();

    peer.onicecandidate = function (event) {
        //console.log('peer.onicecandidate');
        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            peer.addStream(streams[i]);
        }
    }

    peer.onaddstream = function (event) {
        console.log('peer.onaddstream');
        var remoteMediaStream = event.stream;

        // onRemoteStreamEnded(MediaStream)
        remoteMediaStream.onended = function () {
            console.log('remoteMediaStream.onended');
            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
        };

        // onRemoteStream(MediaStream)
        if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

        console.debug('on:add:stream', remoteMediaStream);
    };

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    //console.debug('sdp-constraints', JSON.stringify(constraints.mandatory, null, '\t'));

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        console.log('RTCPeerConnection.createOffer');
        if (!options.onOfferSDP) return;

        peer.createOffer(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);

            //console.debug('offer-sdp', sessionDescription.sdp);
        }, onSdpError, constraints);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        console.log('RTCPeerConnection.createAnswer');
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        //console.debug('offer-sdp', options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
        peer.createAnswer(function (sessionDescription) {
            console.log('peer.createAnswer');
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
            //console.debug('answer-sdp', sessionDescription.sdp);
        }, onSdpError, constraints);
    }

    // if Mozilla Firefox & DataChannel; offer/answer will be created later
    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    // options.bandwidth = { audio: 50, video: 256, data: 30 * 1000 * 1000 }
    var bandwidth = options.bandwidth;

    function setBandwidth(sdp) {
        console.log('RTCPeerConnection.setBandwidth');
        if (moz || !bandwidth /* || navigator.userAgent.match( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i ) */) return sdp;

        // remove existing bandwidth lines
        sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

        if (bandwidth.audio) {
            sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
        }

        if (bandwidth.video) {
            sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
        }

        if (bandwidth.data) {
            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
        }

        return sdp;
    }

    // DataChannel management
    var channel;

    function openOffererChannel() {
        console.log('RTCPeerConnection.openOffererChannel');
        if (!options.onChannelMessage || !options.onOfferSDP)
            return;

        _openOffererChannel();

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createOffer();
            }, useless);
    }

    function _openOffererChannel() {
        console.log('RTCPeerConnection._openOffererChannel');
        // protocol: 'text/chat', preset: true, stream: 16
        // maxRetransmits:0 && ordered:false
        var dataChannelDict = { };
        channel = peer.createDataChannel(options.channel || 'sctp-channel', dataChannelDict);
        channel.onmessage = function (event) {
            //console.log('channel.onmessage');
            if (options.onChannelMessage) options.onChannelMessage(event);
        };
        setChannelEvents();
    }

    function setChannelEvents() {
        console.log('RTCPeerConnection.setChannelEvents');
/*
        channel.onmessage = function (event) {
            //console.log('channel.onmessage');
            if (options.onChannelMessage) options.onChannelMessage(event);
        };
*/
        channel.onopen = function () {
            console.log('channel.onopen');
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function(event) {
            if (options.onChannelClosed) options.onChannelClosed(event);

            console.warn('WebRTC DataChannel closed', event);
        };
        channel.onerror = function(event) {
            if (options.onChannelError) options.onChannelError(event);

            console.error('WebRTC DataChannel error', event);
        };
    }

    if (options.onAnswerSDP && options.onChannelMessage) {
        openAnswererChannel(options.fileHangout);
    }

    function openAnswererChannel(fileHangout) {
        console.log('RTCPeerConnection.openAnswererChannel');
        peer.fileHangout = fileHangout;
        peer.ondatachannel = function (event) {
            channel = event.channel;
            channel.fileHangout = this.fileHangout;

            //https://localhost/WebRTCSamples/src/content/datachannel/filetransfer/
            //http://webrtc.github.io/samples/src/content/datachannel/filetransfer/
            channel.receiveBuffer = [];
            channel.receivedSize = 0;
            channel.onmessage = function (event) {

                if (typeof event.data.byteLength == 'undefined') {
                    consoleError('event.data.byteLength = ' + event.data.byteLength + ' ' + event.data);
                    return;
                }

                this.receiveBuffer.push(event.data);
                this.receivedSize += event.data.byteLength;

                //console.log('channel.onmessage(). event.data = ' + event.data + ' event.data.byteLength = ' + event.data.byteLength + ' this.receivedSize = ' + this.receivedSize);

                var fileTransfer = this.fileHangout.fileTransfer;
                fileTransfer.onFileProgress({
                    received: this.receivedSize
                    , length: fileTransfer.file.size
                });

                if (this.receivedSize === fileTransfer.file.size) {
                    fileTransfer.onFileReceived();
                    fileTransfer.getBlock().querySelector('#download').onclick = function () {
                        console.log('download this = ' + this);
/*
                        var fileReceiver = this.fileHangout.fileReceiver;
                        var dataURL = fileReceiver.content[fileReceiver.uuidLast].join('');
                        var blob = FileConverter.DataUrlToBlob(dataURL);
                        var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);

                        // todo: should we use virtual-URL or data-URL?
                        FileSaver.SaveToDisk(dataURL, fileReceiver.dataName);
*/
                        var received = new window.Blob(this.channel.receiveBuffer);
/*
                        receiveBuffer = [];

                        downloadAnchor.href = URL.createObjectURL(received);
                        downloadAnchor.download = file.name;
*/

                        var hyperlink = document.createElement('a');
                        hyperlink.href = URL.createObjectURL(received);
                        hyperlink.target = '_blank';
                        hyperlink.download = this.channel.fileHangout.fileTransfer.file.name;

                        var mouseEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });

                        hyperlink.dispatchEvent(mouseEvent);
                        (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
                    }
                }

            };
            channel.fileHangout.fileTransfer.getBlock().querySelector('#download').channel = channel;

            setChannelEvents();
        };

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createAnswer();
            }, useless);
    }

    // fake:true is also available on chrome under a flag!

    function useless() {
        console.error('Error in fake:true');
    }

    function onSdpSuccess() {
        console.log('RTCPeerConnection.onSdpSuccess');
    }

    function onSdpError(e) {
        var message = JSON.stringify(e, null, '\t');

        console.error('onSdpError:', message);
    }

    return {
        addAnswerSDP: function(sdp) {
            //console.debug('adding answer-sdp', sdp.sdp);
            peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            console.log('RTCPeerConnection.addICE');
            candidate = new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            });

            peer.addIceCandidate(candidate);
        },

        peer: peer,
        channel: channel,
        sendData: function(message) {
            channel && channel.send(message);
        }
    };
}

// getUserMedia
var video_constraints = {
    mandatory: { },
    optional: []
};

function getUserMedia(options) {
    console.log('getUserMedia');
    var n = navigator,
        media;
    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
            audio: true,
            video: video_constraints
        }, streaming, options.onerror || function(e) {
            console.error(e);
        });

    function streaming(stream) {
        console.log('getUserMedia.streaming');
        var video = options.video;
        if (video) {
            video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
            video.play();
        }
        options.onsuccess && options.onsuccess(stream);
        media = stream;
    }

    return media;
}
