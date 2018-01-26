/**
 * Javascript code. WebRTC (Web Real-Time Communications) see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API for details
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
 *  2016-12-15, : 
 *       + g_iceServers was added.
 *
 */

var g_iceServers;

peer = {
    peer: function (dataID, user, options) {
        var userId = user.id;
        consoleLog('peer.peer(' + dataID + ', ' + userId + ')');
        //https://habrahabr.ru/post/187270/

        this.options = options;
        this.nickname = user.nickname;
        this.dataID = dataID;

        this.RTCPeerConnection = function () {
//            var loadedIceFrame, peerPeer = this;
            var peerPeer = this;
            function loadIceFrame(callback)//, skip)
            {
/*
                if (!DetectRTC.browser.isChrome) {
                    callback();
                    return;
                }
*/
                if (typeof g_iceServers != 'undefined') {
                    callback(g_iceServers);
                    return;
                }
                consoleLog('loadIceFrame(...)');
//                if (loadedIceFrame) return;
//                if (!skip) return loadIceFrame(callback, true);

//                loadedIceFrame = true;

                var iframe = document.createElement('iframe');
                iframe.onload = function () {
                    consoleLog('loadIceFrame(...) onload');
                    iframe.isLoaded = true;

                    function listenEventHandler(eventName, eventHandler) {
                        window.removeEventListener(eventName, eventHandler);
                        window.addEventListener(eventName, eventHandler, false);
                    }

                    listenEventHandler('message', iFrameLoaderCallback);

                    var boTimeOut = true;
                    function iFrameLoaderCallback(event) {
                        if (!event.data || !event.data.iceServers) return;
                        boTimeOut = false;
                        consoleLog('iFrameLoaderCallback(event)');
                        g_iceServers = event.data.iceServers;
                        callback(g_iceServers);

                        // this event listener is no more needed
                        window.removeEventListener('message', iFrameLoaderCallback);
                    }

                    iframe.contentWindow.postMessage('get-ice-servers', '*');

                    window.setTimeout(function () {
                        if (!boTimeOut)
                            return;
                        consoleError('loadedIceFrame timeout');
                        callback(JSON.parse('[{"url":"stun:turn02.uswest.xirsys.com"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turn:turn02.uswest.xirsys.com:80?transport=udp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turn:turn02.uswest.xirsys.com:3478?transport=udp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turn:turn02.uswest.xirsys.com:80?transport=tcp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turn:turn02.uswest.xirsys.com:3478?transport=tcp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turns:turn02.uswest.xirsys.com:443?transport=tcp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"},{"username":"48e24d98-bc3b-11e6-863f-3c13342097f8","url":"turns:turn02.uswest.xirsys.com:5349?transport=tcp","credential":"48e24e2e-bc3b-11e6-baae-24d3461b5f63"}]'));
                    }, 5000);
                };
                /*not works
                iframe.onerror = function () {
                    consoleLog('loadIceFrame(...) onerror');
                };
                */
                iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/'; 
                iframe.style.display = 'none';
                (document.body || document.documentElement).appendChild(iframe);
            }
            loadIceFrame(function (iceServers) {

                //D:\My documents\MyProjects\Documents\VodeoConferences\webrtc\WebRTC-ExperimentNew2\RTCMultiConnection.js
                function setDefaults(connection) {
                    var iceServers = [];

                    iceServers.push({
                        url: 'stun:stun.l.google.com:19302'
                    });

                    iceServers.push({
                        url: 'stun:stun.anyfirewall.com:3478'
                    });

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

                    connection.iceServers = iceServers;

                    connection.rtcConfiguration = {
                        iceServers: null,
                        iceTransports: 'all', // none || relay || all - ref: http://goo.gl/40I39K
                        peerIdentity: false
                    };

                    connection.sdpConstraints = {};

                    // as @serhanters proposed in #225
                    // it will auto fix "all" renegotiation scenarios
                    connection.sdpConstraints.mandatory = {
                        OfferToReceiveAudio: true,
                        OfferToReceiveVideo: true
                    };

                    connection.optionalArgument = {
                        optional: [{
                            DtlsSrtpKeyAgreement: true
                        }, {
                            googImprovedWifiBwe: true
                        }, {
                            googScreencastMinBitrate: 300
                        }],
                        mandatory: {}
                    };

                    // www.RTCMultiConnection.org/docs/preferSCTP/
                    connection.preferSCTP = (
                        DetectRTC.browser.isFirefox
                        || (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 32)
                        || DetectRTC.browser.isOpera
                    ) ? true : false;

                    // www.RTCMultiConnection.org/docs/candidates/
                    connection.candidates = {
                        host: true,
                        stun: true,
                        turn: true
                    };
                }
                var connection = {};
                setDefaults(connection);
                var config = { iceServers: connection.iceServers };
                if (typeof iceServers != 'undefined')
                    config.iceServers = config.iceServers.concat(iceServers);

                //D:\My documents\MyProjects\Documents\VodeoConferences\webrtc\WebRTC-ExperimentNew2\RTCMultiConnection.js
                function setSdpConstraints(config) {
                    var sdpConstraints;

                    var sdpConstraints_mandatory = {
                        OfferToReceiveAudio: !!config.OfferToReceiveAudio,
                        OfferToReceiveVideo: !!config.OfferToReceiveVideo
                    };

                    sdpConstraints = {
                        mandatory: sdpConstraints_mandatory,
                        optional: [{
                            VoiceActivityDetection: false
                        }]
                    };

                    if (!!navigator.mozGetUserMedia && DetectRTC.browser.version > 34) {
                        sdpConstraints = {
                            OfferToReceiveAudio: !!config.OfferToReceiveAudio,
                            OfferToReceiveVideo: !!config.OfferToReceiveVideo
                        };
                    }

                    return sdpConstraints;
                }

                //D:\My documents\MyProjects\Documents\VodeoConferences\webrtc\WebRTC-ExperimentNew2\RTCMultiConnection.js
                function setConstraints() {
                    var session;
                    if (typeof options.options == 'undefined')
                        session = { data: true }//data transfer
                    else session = options.options.session;//stream transfer
                    var sdpConstraints = setSdpConstraints({
                        OfferToReceiveAudio: !!session.audio,
                        OfferToReceiveVideo: !!session.video || !!session.screen
                    });

                    if (connection.sdpConstraints.mandatory) {
                        sdpConstraints = setSdpConstraints(connection.sdpConstraints.mandatory);
                    }

                    connection.constraints = sdpConstraints;
                    /*
                    if (connection.constraints) {
                        consoleLog('sdp-constraints', JSON.stringify(connection.constraints));
                    }
                    */
                    connection.optionalArgument = {
                        optional: connection.optionalArgument.optional || [],
                        mandatory: connection.optionalArgument.mandatory || {}
                    };

                    if (!connection.preferSCTP) {
                        connection.optionalArgument.optional.push({
                            RtpDataChannels: true
                        });
                    }

                    //consoleLog('optional-argument', JSON.stringify(connection.optionalArgument));

                    if (typeof config.iceServers != 'undefined') {
                        var iceCandidates = connection.candidates;

                        var stun = iceCandidates.stun;
                        var turn = iceCandidates.turn;
                        var host = iceCandidates.host;

                        if (typeof iceCandidates.reflexive != 'undefined') stun = iceCandidates.reflexive;
                        if (typeof iceCandidates.relay != 'undefined') turn = iceCandidates.relay;

                        if (!host && !stun && turn) {
                            connection.rtcConfiguration.iceTransports = 'relay';
                        } else if (!host && !stun && !turn) {
                            connection.rtcConfiguration.iceTransports = 'none';
                        }

                        config.iceServers = {
                            iceServers: config.iceServers,
                            iceTransports: connection.rtcConfiguration.iceTransports
                        };
                    } else {
                        consoleError('config.iceServers = ' + config.iceServers);
                        config.iceServers = null;
                    }

                    //consoleLog('rtc-configuration', JSON.stringify(config.iceServers));
                }
                setConstraints();
                function pc(){

                    // Сразу установим обработчики событий
                    peerPeer.pc.onicecandidate = function (evt) {
                        consoleLog('pc.onicecandidate(...)');
                        if (evt.candidate) {
                            // Каждый ICE-кандидат мы будем отправлять другому участнику через сигнальный сервер
                            socket.send(userId, {
                                userid: g_user.id,
                                candidate: evt.candidate
                            });
                        }
                    };
                    peerPeer.pc.onconnection = function () {
                        // Пока это срабатывает только в Firefox
                        consoleLog('RTCPeerConnection connection established');
                    };
                    peerPeer.pc.onclosedconnection = function () {
                        // И это тоже. В Chrome о разрыве соединения придется узнавать другим способом
                        consoleLog('RTCPeerConnection disconnected');
                    };

                    peerPeer.pc.oniceconnectionstatechange = function (event) {
                        if (this.iceConnectionState == 'failed') {
                            consoleError('RTCPeerConnection oniceconnectionstatechange. iceConnectionState: ' + this.iceConnectionState + ' iceGatheringState: ' + this.iceGatheringState + ' signalingState: ' + this.signalingState + ' dataID: ' + dataID);
                            /*сообщение об ошибке появляется на передающей стороне и потом не исчезает
                            var elementBlock = getVideoBlock(dataID);
                            elementBlock.querySelector('#wait').style.display = 'none';
                            var elMessage = elementBlock.querySelector('.value');//receive file
                            if (elMessage == null)
                                elMessage = elementBlock.querySelector('#Message');//send camera
                            elMessage.innerHTML =
                                '<font style="color:red;">' + lang.error + ': iceConnectionState: ' + this.iceConnectionState + '</font>';
                            */
                            return;
                        }
                        consoleLog('RTCPeerConnection oniceconnectionstatechange. iceConnectionState: ' + this.iceConnectionState + ' iceGatheringState: ' + this.iceGatheringState + ' signalingState: ' + this.signalingState);
                    };
                    peerPeer.pc.onnegotiationneeded = function (event) {
                        consoleLog('RTCPeerConnection onnegotiationneeded. iceConnectionState: ' + this.iceConnectionState + ' iceGatheringState: ' + this.iceGatheringState + ' signalingState: ' + this.signalingState);
                    };
                    peerPeer.pc.onremovestream = function (event) {
                        consoleLog('RTCPeerConnection onremovestream. iceConnectionState: ' + this.iceConnectionState + ' iceGatheringState: ' + this.iceGatheringState + ' signalingState: ' + this.signalingState);
                    };
                    peerPeer.pc.onsignalingstatechange = function (event) {
                        consoleLog('RTCPeerConnection onsignalingstatechange. iceConnectionState: ' + this.iceConnectionState + ' iceGatheringState: ' + this.iceGatheringState + ' signalingState: ' + this.signalingState);
                    };
                    try {
                        if (typeof options.options == 'undefined') {//file transfer
                            peerPeer.pc.ondatachannel = function (e) {
                                consoleDebug('peer.pc.ondatachannel(...)');
                                peerPeer.channel = e.channel;
                                if (DetectRTC.browser.isFirefox) peerPeer.channel.binaryType = 'blob';

                                peerPeer.setChannelEvents();
                            };
                            peerPeer.start = options.start;
                            peerPeer.start();
                        } else options.options.start(peerPeer);
                    } catch (e) {
                        consoleError(e);
                    }
                }
                if (DetectRTC.browser.isEdge) {
                    //https://github.com/webrtc/adapter
                    var src = "https://webrtc.github.io/adapter/adapter-latest.js";
                    loadScript(src, function () {//success
//                        var servers = null;
                        peerPeer.pc = new RTCPeerConnection(config.iceServers);//servers);
                        pc();
                    }, function () {//error
                        src = '../WebRTC/adapter/release/adapter.js'
                        loadScript(src, function () {
                            peerPeer.pc = new RTCPeerConnection(config.iceServers);
                            pc();
                        }, function () { alert('Load "' + src + '" failed!'); });
                    });
                } else {
                    var _RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection
                    // || window.RTCIceGatherer;//for edge. also see http://stackoverflow.com/questions/36824585/does-rtcpeerconnection-work-in-microsoft-edge
                    if (typeof _RTCPeerConnection == "undefined") {
                        var error = 'WebRTC 1.0 (RTCPeerConnection) API seems NOT available in this browser.';
                        consoleError(error);
                        alert(lang.uncompatibleBrowser.replace("%s", error));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
                        return;
                    }
                    try {
                        peerPeer.pc = new _RTCPeerConnection(config.iceServers, connection.optionalArgument);
                    } catch (e) {
                        consoleError(e);
                        alert(lang.uncompatibleBrowser.replace("%s", e));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
                        return;
                    }
                    pc();
                }
            });
        }
        this._RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
        if (typeof this._RTCSessionDescription == "undefined") {
            var error = 'RTCSessionDescription: ' + this._RTCSessionDescription;
            consoleError(error);
            alert(lang.uncompatibleBrowser.replace("%s", error));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
            return;
        }
        /*попытка запустить в Safari
        if (typeof this._RTCSessionDescription == "undefined") {
            //https://github.com/webrtc/adapter
            loadScript("https://webrtc.github.io/adapter/adapter-latest.js", function () {
                this._RTCSessionDescription = window.RTCSessionDescription;
                if (typeof this._RTCSessionDescription == "undefined") {
                    var error = 'RTCSessionDescription: ' + this._RTCSessionDescription;
                    consoleError(error);
                    alert(lang.uncompatibleBrowser.replace("%s", error));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
                    return;
                }
            });
        */
        this.socket = {
            send: function (userId, data1) {
                try {
                    var jsonData = JSON.stringify(data1);
                    //consoleLog('socket.send(' + jsonData + ')');
                    if (userId == null)
                        consoleError('userId = ' + userId);
                    else $.connection.chatHub.server.peerSend2(userId, dataID, jsonData);
                } catch (e) {
                    consoleError(e.message);
                }
            }
        };
        var socket = this.socket;
        this.setChannelEvents = function () {
            consoleLog('setChannelEvents()');

            if (typeof options.onchannelopen == 'undefined')
                this.channel.onopen = function () { consoleLog('Channel opened'); };
            else this.channel.onopen = options.onchannelopen;

            if (typeof options.onchannelclose == 'undefined')
                this.channel.onclose = function () { consoleLog('Channel closed'); };
            else this.channel.onclose = options.onchannelclose;

            this.channel.onerror = function (err) { consoleError('Channel error: ' + err); };

            if (typeof options.onchannelmessage == 'undefined')
                this.channel.onmessage = function (e) { consoleLog('Incoming message: ' + e.data); };
            else this.channel.onmessage = options.onchannelmessage;
        }

        this.reportError = function (errMessage) {
            consoleError(errMessage.name + ": " + errMessage.message);
        }
        this.sendToReceiver = function (userId) {
            // Отправляем другому участнику через сигнальный сервер
            this.socket.send(userId, {
                userid: g_user.id,//.nickname,//root.userid,
                sdp: this.pc.localDescription
            });
            // После завершения этой функции начнет срабатывать событие pc.onicecandidate
        }
        this.addPeer = function () {
            this.setPeersCount();
            if (this.options.options == undefined)
                return;
            //media broadcasting
            var receivers = 'receivers';
            var elParticipants = getVideoBlock(dataID).querySelector('#participants');
            var elReceivers = elParticipants.querySelector('.' + receivers);
            if (elReceivers == null) {
                elReceivers = document.createElement('div');
                elReceivers.className = receivers;
                elParticipants.appendChild(elReceivers);
                elReceivers.appendChild(myTreeView.createBranch({
                    name: lang.receivers,//Receivers
/*
                    params: {
                        onOpenBranch: function (a) { this.fileTransfer.showTools(); },
                        onCloseBranch: function (a) { this.fileTransfer.hideTools(); },
                        fileTransfer: getVideoBlock(dataID).fileTransfer
                    }
*/
                }));
            } 
            if (!myTreeView.isBranchExists(user.nickname, elReceivers)) {
                myTreeView.AddNewBranch(elReceivers, {
                    branch: function () {
                        var el = document.createElement("div");
                        el.appendChild(AddElementUser(user, g_chatRoom.RoomName));
                        el.querySelector('.treeView').params.branchId = this.branchId;
                        return el;
                    },
                    branchId: user.nickname
                });
            } else consoleError('duplicate receiver: ' + user.nickname);
        }
        this.setPeersCount = function () {
            var peersCount = 0;
            for (var peer in getVideoBlock(dataID).fileTransfer.peers) {
                peersCount++;
            }
            consoleLog('peersCount = ' + peersCount);
            window.setPeersCount(dataID, peersCount);
        }
        this.onsdp = function (message) {
            consoleLog('peer.onsdp()) sdp.type: ' + message.sdp.type);
            switch (message.sdp.type) {
                case 'offer': {
                    this.setRemoteSDP(message.sdp);
                    break;
                }
                case 'answer': {
                    var aPromise = this.pc.setRemoteDescription(new this._RTCSessionDescription(message.sdp))
                        .then(this.addPeer())
                        .catch(this.reportError);
                    break;
                }
                default: consoleError('message.sdp.type = ' + message.sdp.type);
            }
        }
        this.onice = function (message) {
            consoleLog('peer.onice()');
            var _RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
            if (typeof _RTCIceCandidate == "undefined") {
                consoleError('RTCIceCandidate: ' + _RTCIceCandidate);
                return;
            }
            //https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addIceCandidate
/*uncompatible with Safari
            this.pc.addIceCandidate(new _RTCIceCandidate(message.candidate)).then(_=> {
                consoleLog('candidate is successfully passed to the ICE agent');
            }).catch(e=> {
                consoleError("Failure during addIceCandidate() " + JSON.stringify(e));
            });
*/
            try {
                //ATTENTION!!! Deprecated see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addIceCandidate for details
                this.pc.addIceCandidate(new _RTCIceCandidate(message.candidate));
            } catch (e) {
                consoleError(e);
            }
        }
        try {
            if (typeof options.options == 'undefined') {
                this.RTCPeerConnection();
                //                this.start = options.start;
                //                this.start();
            } else options.options.peerConnection(this);
        } catch (e) {
            consoleError(e);
        }
    }
    , onPeerSend: function (dataID, JSONData) {
        consoleLog('peer.onPeerSend(dataID = ' + dataID + ')');//', JSONData: ' + JSONData + ')');
        
        var message = JSON.parse(JSONData);
        var Id;
        if (message.stream) Id = getVideoBlockID(dataID);
        else Id = dataID + 'Block';
        var peerBlock = document.getElementById(Id);
        if (!peerBlock){
            if (!message.userLeft)//Когда отправитель закрывает трансляцию, получатель отправляет сообщение message.userLeft чтобы удалить peer. Но к этому времени он уже удален
                consoleError('peerBlock = ' + peerBlock);
            return false;
        }

        if (message.participationRequest) {
            if (message.stream)
                sendStream(dataID, message.user);
            else sendFile(dataID, message.user);
        } else {
            var peer;
            if (typeof peerBlock.fileTransfer.peer == 'undefined')
                peer = peerBlock.fileTransfer.peers[message.userid];//sender
            else peer = peerBlock.fileTransfer.peer;//receiver

            if (message.sdp) {
                peer.onsdp(message);
            } else if (message.candidate) {
                peer.onice(message);
            } else if (message.userLeft) {
                peerBlock.fileTransfer.peers[message.userid].pc.close();
                var peer = peerBlock.fileTransfer.peers[message.userid];
                consoleLog('message.userLeft: ' + peer.nickname);
                var elReceivers = getVideoBlock(peer.dataID).querySelector('.receivers');
                myTreeView.removeBranch(peer.nickname, elReceivers);
                delete peerBlock.fileTransfer.peers[message.userid];
                if (myTreeView.branchLength(elReceivers) == 0)
                    elReceivers.parentElement.removeChild(elReceivers);
                peer.setPeersCount();
            } else consoleError('invalid message');
        }
        return true;
    }
}
