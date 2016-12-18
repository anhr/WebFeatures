/**
 * Javascript code. WebRTC (Web Real-Time Communications) see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API for details
 *      Receive file, picture, video, audio or stream from camera or microphone
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: https://drive.google.com/file/d/0B5hS0tFSGjBZRXZHVXN5S0VNV28/view?usp=sharing
 * source: https://habrahabr.ru/post/187270/
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2016-12-15, : 
 *       + init.
 *
 */

function ReceiveFileStart(JSONUser, JSONFileTransfer) {
    consoleLog('ReceiveFileStart(' + JSONUser + ', ' + JSONFileTransfer + ')');
    ReceiveFileStart2(JSON.parse(JSONUser), JSON.parse(JSONFileTransfer));
}

function ReceiveFileStart2(user, fileTransfer) {
    consoleLog('ReceiveFileStart2(...)');
    loadScript("Scripts/WebRTC/FileTransfer.js", function () {
        if (typeof fileTransfer.fileTransfers == 'undefined') {
            Files();
            new ReceiveFile(user, fileTransfer);
            return;
        }
        switch (fileTransfer.fileTransfers) {
            case 'pictureTransfers':
                new ReceivePicture(user, fileTransfer);
                break;
            case 'videoTransfers':
                new ReceiveVideo(user, fileTransfer);
                break;
            case 'audioTransfers':
                new ReceiveAudio(user, fileTransfer);
                break;
            case 'cameraTransfers':
                loadScript("Scripts/WebRTC/ReceiveCamera.js", function () {
                    new ReceiveCamera(user, fileTransfer);
                });
                break;
            case 'microphoneTransfers':
                loadScript("Scripts/WebRTC/ReceiveMicrophone.js", function () {
                    new ReceiveMicrophone(user, fileTransfer);
                });
                break;
            default: consoleError('fileTransfer.fileTransfers: ' + fileTransfer.fileTransfers);
        }
    });
}

function ReceiveFile(user, file, options) {
    consoleLog('ReceiveFile(...)');
    function setFileInput(fileTransfer, elementBlock) {
    }
    function header(fileTransfer) {
        var header, headerEnd;
        if (typeof options == 'undefined') {
            header = '📁 <span id="header">' + lang.receiveFile + '</span>'//'Receive File from '
            headerEnd = '';
        } else {
            header = options.header;
            if (typeof options.headerEnd == 'undefined')
                headerEnd = '';
            else headerEnd = options.headerEnd;
        }
        //если не использовать element, то возвратит undefined
        var element =
          '<h2 onclick="javascript: getFileTransfer(\'' + fileTransfer.getBlockID() + '\').receiveFile()" style="float:none;margin:0px;" class="sendButton">'
            + header
            + '<span id="user"></span>'
            + headerEnd
        + '</h2>'
        //+ '<a onclick="javascript: receiveStream(\'' + fileTransfer.ID + '\', \'' + fileTransfer.user.id + '\')">RF</a>'
        //+ '<a onclick="javascript: receiveFile(\'' + fileTransfer.ID + '\', \'' + fileTransfer.user.id + '\')">RF</a>'
        return element;
    }

    function elementFileTransfer(fileTransfer) {
        if ((typeof options != 'undefined') && (typeof options.elementFileTransfer != 'undefined'))
            return options.elementFileTransfer(fileTransfer);
        //если не использовать element, то возвратит undefined
        var element =
              '<div>'
                + fileTransfer.getFileInfo(this.file)
            + '</div>'
            + '<div id="toggle" class="b-toggle" style="margin-top:5px;">'
                + '<span id="wait"><img src="../img/Wait.gif" style="width: 20px; height:20px" alt="wait" /></span>'
                + '<meter style="display:none;" high="0.25" max="100" value="0"></meter> <span class="value"></span> <span class="duration"></span>'
                + '<h1 id="download" onclick="javascript: getFileTransfer(\'' + fileTransfer.getBlockID() + '\').download()" class="sendButton" style="display:none;margin:0px" title="' + lang.download + '">'//Download
                    + '💾</h1>'
            + '</div>'
        ;
        return element;
    }
    function leftButton(fileTransfer) {
        return '';
    }
    var fileTransfer = new FileTransfer({
        transferIDName: 'ReceiveFile'
        , header: header
        , leftButton: leftButton
        , elementFileTransfer: elementFileTransfer
        , setFileInput: setFileInput
        , user: user
        , file: file
        , options: options
    });

    //cancel of receiving of the file
    fileTransfer.cancel = function () {
        consoleLog('ReceiveFile.cancel()');

        if (this.fileReceived) {
            this.cancelled = true;
            return;//do not close fileTransfer block if file has received
        }

        var element;
        element = this.getBlock();
        if (element) {//cancel File Transfer
            element.parentElement.removeChild(element);
            AddEventToChat(((typeof this.options.options != 'undefined') && (typeof this.options.options.stopped != 'undefined')) ? options.stopped()
                : (lang.canceledSendingFile + ' "' + this.file.name + '"'), this.user);//' canceled sending file'
        } else {//Сюда попадает когда посетитель покидает комнату
            return;
        }
        this.toggleFileTransfer();

        this.disconnect();

        if (typeof this.intervalID != 'undefined')
            window.clearInterval(this.intervalID);
    }

    //////////////////////////////////////////////////////////////
    //for receive stream from camera and microphone

    fileTransfer.waitPermission = function (waitPermission, permissionId, message) {
        waitPermission.style.display = 'block';
        waitPermission.querySelector('#message').innerText = message;
        waitPermission.querySelector('#respoce').innerHTML = getWaitIcon();
        $.connection.chatHub.server.waitPermission(JSON.stringify({
            from: g_user
            , to: fileTransfer.user//ID of user for waiting of snapshot permission
            , id: permissionId//1- Snapshot, 2 - camera, 3 - Microphone
        }));
    }

    fileTransfer.onaddstream = function (event, mediaTagName) {
        consoleDebug('fileTransfer.onaddstream(...)');
        this.stream = event.stream
        resizeVideos();
        var mediaBlock = getVideoBlock(fileTransfer.ID);
        var media = mediaBlock.querySelector(mediaTagName);
        media.src = window.URL.createObjectURL(event.stream);
        media.style.display = 'block';
        mediaBlock.querySelector('#wait').style.display = 'none';
        mediaBlock.querySelector('#Message').innerText = '';
        mediaBlock.querySelector('#tools').style.display = 'block';
    }

    fileTransfer.stopRecording = function () {
        var mediaRecording = this.getBlock().querySelector('#Record').mediaRecording;
        if ((typeof mediaRecording != 'undefined') && (mediaRecording.recording.mediaRecorder.state == 'recording')) {
            consoleLog('fileTransfer.stopRecording()');
            mediaRecording.stopRecording();
        }
    }

    //for receive stream from camera and microphone
    //////////////////////////////////////////////////////////////

    var elementUser = fileTransfer.getBlock().querySelector('#user');
    if (elementUser.childNodes.length == 0)
        elementUser.appendChild(AddElementUser(user, g_chatRoom.RoomName));
    else {
        consoleError('duplicate user');
        return;
    }

    fileTransfer.receiveFile = function () {
        if ((typeof options != 'undefined') && (typeof options.receiveStream != 'undefined'))
            return options.receiveStream(fileTransfer);

        var elementToggle = this.getBlock().querySelector('#toggle');
        var header;
        var message;
        if (!this.fileReceived && isBranchExpanded(elementToggle)) {//stop receive file
            consoleLog('stop receive file. this.ID: ' + this.ID);
            if (typeof this.options.options == 'undefined') {
                header = lang.receiveFile;//'Receive File from '
            } else {
                header = this.options.options.headerReceive;
            }
            message = lang.receivingCanceled;//'Receiving canceled.'
            this.disconnect();
        } else {
            consoleLog('Start receive file. this.ID: ' + this.ID);

            if (this.cancelled) {
                alert(lang.canceledFileTransfer.replace("%s", this.user.nickname));//The visitor %s has canceled the file transfer
                return;
            }

            header = lang.cancelReceive;//'Cancel Receive from '
            message = lang.connectionWaiting;//'Connection waiting.'

            var elementBlock = this.getBlock();
            elementBlock.querySelector('.duration').style.display = 'inline';
            elementBlock.querySelector('#download').style.display = 'none';
            delete elementBlock.startTime;

            var meter = elementBlock.querySelector('meter');
            meter.style.display = 'none';
            meter.value = 0;

            //Peer connection
            var self = this;
            loadScript("Scripts/WebRTC/PeerReceive.js", function () {
                self.receiveBuffer = [];
                self.receivedSize = 0;
                peerReceive(self);
            });
        }
        var elementBlock = this.getBlock();
        elementBlock.querySelector('#header').innerText = header;
        elementBlock.querySelector('.value').innerText = message;
        elementBlock.querySelector('#wait').style.display = 'inline';

        if (!this.fileReceived)
            onbranchelement(elementToggle);
        this.fileReceived = false;
    }

    fileTransfer.onChannelOpened = function () {
        consoleLog('ReceiveFile.onChannelOpened');
        var elementBlock = this.getBlock();
        elementBlock.querySelector('meter').style.display = 'inline';
        elementBlock.querySelector('#wait').style.display = 'none';
        elementBlock.querySelector('.value').innerText = lang.successfulConnection;//Successful connection
    }

    fileTransfer.disconnect = function () {
        consoleLog('fileTransfer.disconnect()');
        if (typeof this.peer != 'undefined') {
            //see Disconnecting the peers of https://developer.mozilla.org/ru/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
            if (typeof this.peer.channel != 'undefined')
                this.peer.channel.close();//file receiving
            else if (typeof this.stream != 'undefined') {
                this.stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                this.peer.socket.send(this.user.id, {
                    //                    user: g_user
                    userLeft: true
                    , userid: g_user.id
                    //                    , stream: ((typeof options != 'undefined') && (typeof options.stream != 'undefined')) ? options.stream : false//true - receive stream, false - receive file
                });
            } else consoleError('fileTransfer.disconnect() failed!');
            this.peer.pc.close();
            delete this.peer;
        }
    }

    fileTransfer.onFileReceived = function () {
        consoleLog('ReceiveFile.onFileReceived()');

        //consoleError('clearInterval addMedia.oniceTimeoutId = ' + this.getBlock().addMedia.oniceTimeoutId);
        var addMedia = this.getBlock().addMedia;
        if (typeof addMedia != 'undefined')
            window.clearInterval(addMedia.oniceTimeoutId);//for Firefox

        this.disconnect();
        var elementBlock = this.getBlock();
        elementBlock.querySelector('meter').style.display = 'none';
        elementBlock.querySelector('.duration').style.display = 'none';
        elementBlock.querySelector('#download').style.display = 'inline';

        var value = elementBlock.querySelector('.value');
        value.innerText = '';
        value.innerHTML = '<span title="' + lang.fileReceived + '">😀</span>'//Received successfully!

        this.fileReceived = true;

        var header;
        if (typeof this.options.options == 'undefined') {
            header = lang.receiveFile;//'Receive File from '
        } else {
            this.options.options.fileInput(this);
            header = this.options.options.headerReceive;
        }
        elementBlock.querySelector('#header').innerText = header;
    }

    fileTransfer.download = function () {
        consoleLog('ReceiveFile.download()');
        var fileReceiver = this.fileHangout.fileReceiver;
        var dataURL = fileReceiver.content[fileReceiver.uuidLast].join('');
        var blob = FileConverter.DataUrlToBlob(dataURL);
        var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);

        // todo: should we use virtual-URL or data-URL?
        FileSaver.SaveToDisk(dataURL, fileReceiver.dataName);
    }
    AddEventToChat(((typeof options != 'undefined') && (typeof options.started != 'undefined')) ? options.started()
        : (lang.sendingFile + ' ' + '"' + file.name + '"'), user);//' sends a file'
}

function ReceivePicture(user, fileTransfer) {
    var pictures = new Pictures(fileTransfer.fileTransfers);
    ReceiveFile(user, fileTransfer, {
        header: '🖼 ' + '<span id="header">' + lang.receivePicture + '</span>'//Receive picture from '⌗
//        , headerReceive: lang.receivePicture//Receive picture from '
        , informerFileTransfers: 'informerPictureTransfers'
//        , fileTransfers: pictureTransfers
        , branchFileTransfers: pictures.transfers.branchTransfers
        , noFileTransfer: pictures.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showImage(new window.Blob(fileTransfer.receiveBuffer));
        }
        , fileTransfers: fileTransfer.fileTransfers
    });
}

function ReceiveVideo(user, fileTransfer) {
    var videos = new Videos(fileTransfer.fileTransfers);
    ReceiveFile(user, fileTransfer, {
        header: '📽 ' + '<span id="header">' + lang.receiveVideo + '</span>'//Receive video from '📼
        , headerReceive: lang.receiveVideo//Receive video from '
        , informerFileTransfers: 'informerVideoTransfers'
        , fileTransfers: videoTransfers
        , branchFileTransfers: videos.transfers.branchTransfers
        , noFileTransfer: videos.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showVideo(new window.Blob(fileTransfer.receiveBuffer));
        }
        , fileTransfers: fileTransfer.fileTransfers
    });
}

function ReceiveAudio(user, fileTransfer) {
    var audios = new Audios(fileTransfer.fileTransfers);
    ReceiveFile(user, fileTransfer, {
        header: '📢 ' + '<span id="header">' + lang.receiveAudio + '</span>'//'Receive audio from '✇
        , headerReceive: lang.receiveAudio//'Receive audio from '
        , informerFileTransfers: 'informerAudioTransfers'
        , fileTransfers: audioTransfers
        , branchFileTransfers: audios.transfers.branchTransfers
        , noFileTransfer: audios.transfers.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showAudio(new window.Blob(fileTransfer.receiveBuffer));
        }
        , fileTransfers: fileTransfer.fileTransfers
    });
}

function receiveStream(fileTransfer, options) {
    consoleLog('receiveStream()');
    loadScript("Scripts/WebRTC/PeerReceive.js", function () {
        peerReceive(fileTransfer, {
            stream: true//receive stream
            , session: options.session
            , peerConnection: function (peer) {
                consoleLog('receiveStream.peerConnection');
                peer.RTCPeerConnection();
            }
            , start: function (peer) {
                //deprecated. See https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onaddstream for details
                peer.pc.onaddstream = function (event) {
                    fileTransfer.onaddstream(event, options.mediaTagName);
                };
                /*do not support in Chrome, Opera
                peer.pc.ontrack = function (event) {
                    consoleLog('peer.pc.ontrack(...)');
                };
                */
                peer.options.start(peer);
            }
        });
    });
}
