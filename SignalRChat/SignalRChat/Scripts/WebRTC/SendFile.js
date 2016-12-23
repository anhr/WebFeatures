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

function SendFile(options) {
    SendDataStream(options);
}

function SendDataStream(options) {

    this.header = function () {
        var header;
        if ((typeof options != 'undefined') && (typeof options.header != 'undefined'))
            header = options.header;
        else header = '📁 ' + lang.sendFile;
        return '<b>' + header + '</b>';//'Send File'
    }

    function setFileInput(fileTransfer, elementBlock) {
        fileTransfer.fileInput = elementBlock.querySelector('#fileInput');
    }

    function leftButton(fileTransfer) {
        //если не использовать element, то возвратит undefined
        var element = '<span   onclick="javascript: getFileTransfer(\'' + fileTransfer.getBlockID() + '\').cancel()" class="sendButton"'
            + ' title="' + (((typeof fileTransfer.options.options != 'undefined') && (typeof fileTransfer.options.options.cancelTitle != 'undefined')) ?
                fileTransfer.options.options.cancelTitle
                : lang.cancelSendFile)//Cancel file transfer
            + '">X</span>';
        return element;
    }

    function elementFileTransfer(fileTransfer) {
        if ((typeof options != 'undefined') && (typeof options.elementFileTransfer != 'undefined'))
            return options.elementFileTransfer(fileTransfer);
        var element =
            '<input onchange="javascript: getFileTransfer(\'' + fileTransfer.getBlockID() + '\').createConnection()" type="file" id="fileInput" name="files" style="margin-top:5px">'
            + '<span id="fileName"></span>'
            ;
        return element;
    }

    var user;
    if ((typeof options != 'undefined') && (typeof options.options != 'undefined') && (typeof options.options.user != 'undefined'))
        user = options.options.user;

    var fileTransfer = new FileTransfer({
        transferIDName: 'SendFile'
        , header: this.header
        , leftButton: leftButton
        , elementFileTransfer: elementFileTransfer
        , setFileInput: setFileInput
        , user: user
        , options: options
    });
/*
    fileTransfer.cancelTransfer = function (noCloseBlock) {
        consoleLog('fileTransfer.cancelTransfer()');

        var element;
        element = this.getBlock();
        if (element) {//cancel File Transfer
            if ((this.fileInput == null) || (this.fileInput.files.length > 0)) {
                if ((typeof this.loadedmetadata == 'undefined')//'не видеокамера
                        || (this.loadedmetadata == true))//видеокамера открылась успешно
                    $.connection.chatHub.server.fileTransferCancel(JSON.stringify(g_user), this.ID, g_chatRoom.RoomName);
            }
            if (!noCloseBlock)
                element.parentElement.removeChild(element);
            else delete element.fileTransfer;
        } else {//Сюда попадает когда посетитель покидает комнату
            return;
        }
        this.toggleFileTransfer();
    }
*/
    fileTransfer.cancel = fileTransfer.cancelTransfer;

    if ((typeof options != 'undefined')) {
        if ((typeof options.options != 'undefined') && (typeof options.options.elementCreated != 'undefined'))
            return options.options.elementCreated();
        if ((typeof options.cancel != 'undefined'))
            fileTransfer.cancel = options.cancel;
        if ((typeof options.closeSession != 'undefined'))
            fileTransfer.closeSession = options.closeSession;
    }
    fileTransfer.peerConnectionSendFile = function () {
        consoleLog('SendFile.peerConnectionSendFile() this.ID: ' + this.ID);

        var block = this.getBlock();
        var fileInput = block.querySelector('#fileInput');
        fileInput.style.display = 'none';
        block.querySelector('#fileName').innerHTML = this.getFileInfo(fileInput.files[0]);
        this.sendFile();
    }

    fileTransfer.createConnection = function () {
        consoleLog('SendFile.createConnection() this.ID: ' + this.ID);

        //Is file sending?
        var informerFileTransfers = document.getElementById('informerFileTransfers');
        if (informerFileTransfers) {
            var block = this.getBlock();
            var fileInput = block.querySelector('#fileInput');
            var file = fileInput.files[0];
            var arrayFileInput = informerFileTransfers.querySelectorAll('#fileInput');
            for (var i = 0; i < arrayFileInput.length; i++) {
                var itemFileInput = arrayFileInput[i];
                if (itemFileInput == fileInput)
                    continue;
                var itemFile = itemFileInput.files[0];
                if (
                    (typeof itemFile != 'undefined')
                    && (itemFile.lastModified == file.lastModified)
                    && (itemFile.name == file.name)
                    && (itemFile.size == file.size)
                    && (itemFile.type == file.type)
                    ) {
                    alert(lang.sendFileTwice.replace("%s", file.name));//You trying to send "%s" file twice
                    return;
                }
            };
        }

        if ((typeof this.options.options != 'undefined') && (typeof this.options.options.fileInput != 'undefined')) {
            this.options.options.fileInput(this);
        } else this.peerConnectionSendFile();
/*
consoleDebug('getUserMedia');
var fileTransfer = this;
navigator.getUserMedia({ video: true, audio: true }, function (stream) {
    consoleLog('navigator.getUserMedia success');
    var element = document.getElementById(getVideoBlockID(fileTransfer.ID));
    element.stream = stream;
});
*/
    }

    fileTransfer.sendFileBase = function (currentTime)
    {
        var fileTransfers;
        if (typeof this.options.options != 'undefined') {
            fileTransfers = this.options.options.fileTransfers;
//            resizeVideos();
        }
        if ((typeof currentTime == 'undefined') && (typeof this.getCurrentTime != 'undefined'))
            currentTime = this.getCurrentTime();
        var fileTransfer = { ID: this.ID, fileTransfers: fileTransfers};//, currentTime: currentTime };
        if ((typeof currentTime != 'undefined') && (currentTime != null))
            fileTransfer.currentTime = currentTime;
        if (this.fileInput != null) {//sending of the file
            if (this.fileInput.files.length == 0)
                return;//file has not selected
            if (this.fileInput.files.length != 1)
                consoleError('SendFile.sendFile() faled! files.length = ' + files.length);
            var file = this.fileInput.files[0];
            fileTransfer.name = file.name;
            fileTransfer.size = file.size;
        }
        consoleLog('SendFile.sendFile() this.ID: ' + this.ID + ' fileTransfer: ' + JSON.stringify(fileTransfer));
        return fileTransfer;
    }
    fileTransfer.sendFile = function (currentTime)//, callback)
    {
/*
        if (typeof callback != 'undefined')
            callback(fileTransfer);
        else
*/
            $.connection.chatHub.server.sendFile(JSON.stringify(g_user), JSON.stringify(this.sendFileBase(currentTime)), g_chatRoom.RoomName);
    }
}

function SendPicture() {
    var pictureTransfers = 'pictureTransfers';
    var pictures = new Pictures(pictureTransfers);
    SendFile({
        header: '🖼 ' + lang.sendPicture//'Send Picture'⌗
        , informerFileTransfers: 'informerPictureTransfers'
        , fileTransfers: pictureTransfers
        , branchFileTransfers: pictures.transfers.branchTransfers
        , noFileTransfer: pictures.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showImage(fileTransfer.fileInput.files[0], {
                fileTransfer: fileTransfer
            });
        }
    });
}

function SendVideo() {
    var videoTransfers = 'videoTransfers';
    var videos = new Videos(videoTransfers);
    SendFile({
        header: '📽 ' + lang.sendVideo//'Send Video'📼
        , informerFileTransfers: 'informerVideoTransfers'
        , fileTransfers: videoTransfers
        , branchFileTransfers: videos.transfers.branchTransfers
        , noFileTransfer: videos.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showVideo(fileTransfer.fileInput.files[0], {
                fileTransfer: fileTransfer
            });
        }
    });
}

function SendAudio() {
    var audioTransfers = 'audioTransfers';
    var audios = new Audios(audioTransfers);
    SendFile({
        header: '📢 ' + lang.sendAudio//'Send Audio'✇
        , informerFileTransfers: 'informerAudioTransfers'
        , fileTransfers: audioTransfers
        , branchFileTransfers: audios.transfers.branchTransfers
        , noFileTransfer: audios.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showAudio(fileTransfer.fileInput.files[0], {
                fileTransfer: fileTransfer
            });
        }
    });
}

function sendFile(dataID, receiver, options)
{
    var receiverId = receiver.id;
    consoleLog('sendFile(dataID: ' + dataID + ', receiverId: ' + receiverId + ')');
    var fileTransfer = document.getElementById(getVideoBlockID(dataID)).fileTransfer;

    if (typeof fileTransfer.peer != 'undefined') {
        consoleError('fileTransfer.peer = ' + fileTransfer.peer);
        return;
    }

    if (typeof fileTransfer.peers == 'undefined')
        fileTransfer.peers = {};

    if (typeof fileTransfer.peers[receiverId] != 'undefined') {
        consoleError('fileTransfer.peers[receiverId] = ' + fileTransfer.peers[receiverId]);
        return;
    }

    fileTransfer.peers[receiverId] = new peer.peer(dataID, receiverId, {
        start: function (peer) {
            consoleLog('sendFile.start() 2');
            if (typeof peer == 'undefined') {//Send file
                peer = this;
                if (typeof peer.options.options == 'undefined') {//send/receive file
                    // Первый параметр – имя канала, второй - настройки. В настоящий момент Chrome поддерживает только UDP-соединения (non-reliable), а Firefox – и UDP, и TCP (reliable)
//                    peer.channel = peer.pc.createDataChannel('RTCDataChannel', DetectRTC.browser.isChrome ? { reliable: false } : {});
                    peer.channel = peer.pc.createDataChannel('RTCDataChannel', {});
                    // Согласно спецификации, после создания канала клиент должен установить binaryType в "blob", но пока это поддерживает только Firefox (Chrome выбрасывает ошибку)
                    if (DetectRTC.browser.isFirefox) peer.channel.binaryType = 'blob';
                    peer.setChannelEvents();
                } else consoleError('peer.options.options = ' + peer.options.options);
            }
            try{
                peer.pc.createOffer().then(function (offer) {
                    consoleLog("---> Creating new description object to send to remote peer");
                    return peer.pc.setLocalDescription(offer);
                })
                .then(function () {
                    consoleLog("---> Sending offer to remote peer");
                    peer.sendToReceiver(receiverId);
                })
                .catch(peer.reportError);
            } catch (e) {
                consoleError('peer.pc.createOffer() failed! ' + e);

                //for Opera android
                var offerAnswerConstraints = {
                    optional: [],
                    mandatory: {
                        OfferToReceiveAudio: true,
                        OfferToReceiveVideo: true
                    }
                };
                peer.pc.createOffer(function (offer) {
                    consoleLog('peer.createOffer(...)');
                    peer.pc.setLocalDescription(offer);
                    peer.sendToReceiver(receiverId);
                }, peer.reportError, offerAnswerConstraints);
            }
            return;
        }
        , options: options
        , onchannelopen: function (event) {
            consoleLog('sendFile.onchannelopen()');
//            this.send('Hello');
//            var fileTransfer = document.getElementById(getVideoBlockID(dataID)).fileTransfer;
            var participantsId = fileTransfer.ID + receiver.nickname;
            var elementReceiver = document.getElementById(participantsId);
            if (elementReceiver == null) {
                elementReceiver = document.createElement("div");
                elementReceiver.id = participantsId;
                elementReceiver.innerHTML = '<span id="user"></span> <meter high="0.25" max="100" value="0"></meter> <span class="value"></span> <span class="duration"></span>';
                elementReceiver.querySelector('#user').appendChild(AddElementUser(receiver, g_chatRoom.RoomName));
                elementReceiver.send = function (channel) {
                    consoleLog('elementReceiver.send() this.ID: ' + this.ID);
                    this.FileSender = {
                        send: function (config) {
                            consoleLog('FileSender.send');
                            if (typeof channel == 'undefined')
                                channel = config.channel;
                            var file = config.file;
                            //https://localhost/WebRTCSamples/src/content/datachannel/filetransfer/
                            //http://webrtc.github.io/samples/src/content/datachannel/filetransfer/
                            var chunkSize = 16384;
                            this.sliceFile = function (offset, elementReceiver) {
                                //consoleLog('sliceFile(' + offset + ')');
                                var reader = new window.FileReader();
                                reader.onload = (function () {
                                    return function (e) {
                                        //consoleLog('sent = ' + (offset + e.target.result.byteLength));
                                        switch (channel.readyState) {
                                            case 'open':
                                                try {
                                                    channel.send(e.target.result);
                                                } catch (error) {
                                                    //один передает файл
                                                    //а второй начал получать файл а потом отменил получение.
                                                    //думаю это потому, что принимающая строна не успела установить channel.readyState 'closed'
                                                    window.setTimeout(function () {
                                                        if (channel.readyState != 'closed')
                                                            consoleError(error.message + ' channel.readyState: ' + channel.readyState);
                                                    }, 0);
                                                }
                                                break;
                                            case 'closed':
                                            case 'closing':
                                                elementReceiver.querySelector('meter').style.display = 'none';
                                                elementReceiver.querySelector('.duration').style.display = 'none';
                                                var value = elementReceiver.querySelector('.value');
                                                value.innerText = '';
                                                value.innerHTML = '<span title="' + lang.fileCancelReceiver + '">😕</span>'//File transfer has been cancelled on the receiver side
                                                return;//data channel have been cancelled
                                            default:
                                                consoleError('channel.readyState = ' + channel.readyState);
                                        }

                                        //progress bar
                                        //var fileTransfer = channel.appFileTransfer.fileTransfer;
                                        var last;
                                        if (typeof elementReceiver == 'undefined')
                                            elementReceiver = config.elementReceiver;
                                        if (file.size > offset + e.target.result.byteLength) {
                                            window.setTimeout(elementReceiver.FileSender.sliceFile, 0, offset + chunkSize, elementReceiver);
                                        } else last = true;

                                        fileTransfer.onFileProgress({
                                            received: offset + e.target.result.byteLength
                                            , length: file.size
                                            , last: last
                                        }, elementReceiver);

                                        if (last) {
                                            elementReceiver.querySelector('meter').style.display = 'none';
                                            elementReceiver.querySelector('.duration').style.display = 'none';
                                            var value = elementReceiver.querySelector('.value');
                                            value.innerText = '';
                                            value.innerHTML = '<span title="' + lang.fileSent + '">😀</span>'//Sent successfully!
                                        }
                                    };
                                })(file);
                                var slice = file.slice(offset, offset + chunkSize);
                                reader.readAsArrayBuffer(slice);
                            };
                            this.sliceFile(0);
                        }
                    };
                    this.FileSender.send({
                        channel: peer.channel
                        //                        , file: channel.appFileTransfer.fileTransfer.file
                        , file: fileTransfer.file
                        , elementReceiver: this
                    });
                }
                fileTransfer.getBlock().querySelector('#participants').appendChild(elementReceiver);
            } else {
                var meter = elementReceiver.querySelector('meter')
                meter.value = 0;
                meter.style.display = 'inline';

                var duration = elementReceiver.querySelector('.duration');
                duration.style.display = 'inline';
                duration.innerText = '';

                elementReceiver.querySelector('.value').innerText = '';
                delete elementReceiver.startTime;
            }
            fileTransfer.file = fileTransfer.getBlock().querySelector('#fileInput').files[0];
            elementReceiver.send(this);
        }
        , onchannelclose: function (event) {
            consoleLog('sendFile.onchannelclose()');
            fileTransfer.peers[receiverId].pc.close();
            delete fileTransfer.peers[receiverId];
        }
    });
}

function sendStream(dataID, receiver) {
    consoleLog('sendStream(...)');
    sendFile(dataID, receiver
        , {
            peerConnection: function (peer) {
                consoleLog('sendStream.peerConnection');
                peer.RTCPeerConnection();
            }
            , start: function (peer) {
                try {
                    //deprecated
                    peer.pc.addStream(document.getElementById(getVideoBlockID(dataID)).fileTransfer.stream);
                    /*
                    //Not support in Chrome
                    var stream = document.getElementById(getVideoBlockID(dataID)).stream;
                    stream.getTracks().forEach(track => self.pc.addTrack(track, stream));
                    */
                    /*не вызывается в Chrome. В остальных браузерах не проверял
                                        peer.pc.onremovestream = function (ev) {
                                            consoleLog("onremovestream event detected!");
                                        };
                    */
                } catch (e) {
                    consoleError(e);
                    return;
                }
                peer.options.start(peer);
            }
            , session: getVideoBlock(dataID).fileTransfer.options.options.session
        });
}
