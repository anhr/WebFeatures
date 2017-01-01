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

var g_fileTransferID = 0;
/*
//наследование классов
//https://learn.javascript.ru/class-inheritance
function AppFileTransfer(videoID, useLocalMedia, sessionId, addMedia) {
    AppRoot.apply(this, arguments);
    document.getElementById(videoID + 'Block').addMedia = this.peer.addMedia;
}

AppFileTransfer.prototype = Object.create(AppRoot.prototype);

// Желательно и constructor сохранить
//App.prototype.constructor = App;
*/
function FileTransfer(options) {

    consoleLog('FileTransfer("' + this.ID + '")');

    this.options = options;
    this.closeSessionCause = closeSessionCauseEnum.defaultCause;

    this.getBlockID = function () {
        
        if (typeof options.blockId != 'undefined')
            return options.blockId;

        if ((typeof options.options != 'undefined') && (typeof options.options.options != 'undefined') && (typeof options.options.options.id != 'undefined')) {
            if(options.options.options.id != this.ID)
                consoleError('FileTransfer.getBlockID(' + this.ID + ') failed!');
        } else {
            var transferIDName;
            if (typeof options.file == 'undefined')
                transferIDName = options.transferIDName
            else transferIDName = options.file.ID
            if (this.ID.indexOf(transferIDName) == -1) {
                if (
                    (typeof options.options == 'undefined')
                    || (typeof options.options.sendMediaName == 'undefined')
                    || (this.ID != (g_user.id + options.options.sendMediaName))
                )
                consoleError('FileTransfer.getBlockID(' + this.ID + ') failed!');
            }
        }
        return this.ID + "Block";
    }

    this.getBlock = function () {
        return document.getElementById(this.getBlockID());
    }


    this.getFileInfo = function (file) {
        return lang.fileName//File Name
        + ' : ' + file.name
        + '. ' + lang.size//Size
        + ' : ' + file.size.toLocaleString();
    }

    this.fileTransfersCount = function () {
        var fileTransfers;
        if ((typeof options.options != 'undefined') && (typeof options.options.fileTransfers != 'undefined'))
            fileTransfers = this.options.options.fileTransfers;
        else fileTransfers = 'fileTransfers';
        var parentNode = document.getElementById(fileTransfers)
        var fileTransfersCount = parentNode.querySelectorAll('div[name="fileTransfer"]').length
        parentNode.querySelector('#fileTransfersCount').innerHTML = fileTransfersCount;
        return fileTransfersCount;
    }

    this.toggleFileTransfer = function () {
        var noFileTransfersDisplay, fileTransfersDisplay, openBranch;
        if (this.fileTransfersCount()) {
            noFileTransfersDisplay = 'none';
            fileTransfersDisplay = 'block';
            openBranch = true;
        } else {
            noMicrophoneDisplay = 'block';
            fileTransfersDisplay = 'none';
            openBranch = false;
        }
        var fileTransfers, informerFileTransfers, branchFileTransfers, noFileTransfer;
        if ((typeof options.options != 'undefined') && (typeof options.options.fileTransfers != 'undefined')) {
            fileTransfers = this.options.options.fileTransfers;
            informerFileTransfers = this.options.options.informerFileTransfers;
            branchFileTransfers = this.options.options.branchFileTransfers;
            noFileTransfer = this.options.options.noFileTransfer;
        } else {
            fileTransfers = 'fileTransfers';
            informerFileTransfers = 'informerFileTransfers';
            branchFileTransfers = 'branchFileTransfers';
            noFileTransfer = "noFileTransfer";
        }
        document.getElementById(noFileTransfer).style.display = noFileTransfersDisplay;
        document.getElementById(fileTransfers).style.display = fileTransfersDisplay;
        //onbranch(informerFileTransfers, branchFileTransfers, openBranch, DetectRTC.displayResolutionHeight + "px");
    }

    //ATTENTION!!! delete elementBlock.startTime before first calling of this function
    this.onFileProgress = function (e, elementBlock) {
        if (e.received > e.length) {
            consoleError('e.received ' + e.received + ' > e.length ' + e.length);
            return;
        }

        if (typeof elementBlock == 'undefined')
            elementBlock = this.getBlock();
        if (elementBlock == null)
            return;//the sender has canceled sending file

        var curTime = new Date().getTime();
        if ((typeof e.last == 'undefined') && (typeof elementBlock.curTime != 'undefined') && ((curTime - elementBlock.curTime) < 1000)) {
            //consoleLog('fileTransfer.onFileProgress no display')
            return;//display progress every 1 sec
        }
        //else consoleLog('fileTransfer.onFileProgress(...)');
        elementBlock.curTime = curTime;

        var precent = parseInt((e.received * 100) / e.length);
        elementBlock.querySelector('meter').value = precent;
        var received = (e.received * this.file.size) / e.length;
        var remaining = this.file.size - received;

        var speed = '';
        if (typeof elementBlock.startTime == 'undefined')
            elementBlock.startTime = curTime;
        else {
            speed = received / (curTime - elementBlock.startTime);
            window.displayDuration(curTime - parseInt(remaining / speed), elementBlock.querySelector('.duration'), ' ' + lang.sec);//sec.
            speed = '. ' + parseInt(speed) + ' ' + lang.speed//Kb/sec.
        }

        //consoleLog('elementBlock.id: ' + elementBlock.id + ' size' + this.file.size + ' e.received = ' + e.received + ' parseInt((received / 1024)) = ' + parseInt((received / 1024)) + ' parseInt((remaining / 1024)) = ' + parseInt(remaining / 1024));
        elementBlock.querySelector('.value').innerText = precent + '% '
            + speed
            + ' ' + lang.received + ': ' + parseInt(received / 1024).toLocaleString() + ' ' + lang.kb//received
            + '. ' + lang.remaining + ': ' + parseInt(remaining / 1024).toLocaleString() + ' ' + lang.kb//remaining
        ;
    }

    this.showImage = function (blob, options) {
        consoleLog('FileTransfer.ShowImage()');
        var self = this;
        //http://stackoverflow.com/questions/6775767/how-can-i-draw-an-image-from-the-html5-file-api-on-canvas
        var img = new Image;
        img.onload = function () {
            var block = self.getBlock();
            var fileTransferContainer = block.querySelector('.fileTransferContainer');
            var canvas = fileTransferContainer.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'fileInputType';
                canvas.style.width = 'inherit';
                canvas.width = fileTransferContainer.clientWidth;// - 10;
/*
                canvas.setWidth = function (width) {
                    //consoleLog('SendPicture.setWidth(' + width + ')');
                    this.style.width = width + 'px';
                }
*/
                fileTransferContainer.appendChild(canvas);
            }
            canvas.width = fileTransferContainer.clientWidth;// - 10;
            canvas.height = parseInt(((img.height * fileTransferContainer.clientWidth) / img.width));// - 10;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            if (typeof options != 'undefined')
                options.fileTransfer.peerConnectionSendFile();
        }
        img.onerror = function () {
            alert(lang.imageError);//Image loading is failed!
        }
        img.src = URL.createObjectURL(blob);
    }

    this.showMedia = function (blob, options) {
        consoleLog('FileTransfer.showMedia()');
        var self = this;
        //http://stackoverflow.com/questions/6775767/how-can-i-draw-an-image-from-the-html5-file-api-on-canvas
        var block = self.getBlock();
        var fileTransferContainer = block.querySelector('.fileTransferContainer');
        var media = fileTransferContainer.querySelector(options.mediaTagName);
        if (!media) {
            media = document.createElement(options.mediaTagName);
            media.id = 'fileInputType';
            media.setWidth = function (width) {
                //consoleLog('SendPicture.setWidth(' + width + ')');
                this.style.width = width + 'px';
            }
            media.controls = true;
            //http://www.w3schools.com/tags/ref_av_dom.asp
            media.onpause = function () {
                consoleLog(options.mediaTagName + '.onpause()');
                var playToggle = block.querySelector('#playToggle');
                if (!playToggle)
                    return;
                playToggle.innerHTML = '►';
                playToggle.title = lang.play;//Play
            }
            media.onplay = function () {
                consoleLog(options.mediaTagName + '.onplay()');
                var playToggle = block.querySelector('#playToggle');
                if (!playToggle)
                    return;
                playToggle.innerHTML = '❚❚';
                playToggle.title = lang.pause;//Pause
            }

            media.onended = function () {
                consoleLog(options.mediaTagName + '.onended()');
                this.src = window.URL.createObjectURL(blob);//for playing of the webm files in the Firefox
            }
            fileTransferContainer.appendChild(media);
        }
        if (blob.type != '') {
            switch (media.canPlayType(blob.type)) {
                case 'probably':
                case 'maybe':
                    break;
                case '':
                default:
                    alert(lang.cannotPlayType + blob.type);//'Cannot play file type '
                    return;
            }
        }
        media.style.width = fileTransferContainer.clientWidth + 'px';
        media.onloadedmetadata = function () {
            if (typeof options != 'undefined') {
                if (options.loadedmetadata)
                    return;//посетитель проиграл свое видео
                options.loadedmetadata = true;
                if (typeof options.fileTransfer != 'undefined')
                    options.fileTransfer.peerConnectionSendFile();//sending media
            }
        }
        media.onerror = function () {
            alert(options.mediaError);
        }
        media.src = window.URL.createObjectURL(blob);
    }

    this.showVideo = function (blob, options) {
        if (typeof options == 'undefined')
            options = {};
        options.mediaTagName = 'video';
        options.mediaError = lang.videoError;//Video loading is failed!
        this.showMedia(blob, options);
    }

    this.showAudio = function (blob, options) {
        if (typeof options == 'undefined')
            options = {};
        options.mediaTagName = 'audio';
        options.mediaError = lang.audioError;//Audio loading is failed!
        this.showMedia(blob, options);
    }

    this.showTools = function () {
        var element = this.getBlock().querySelector('#tools');
        var expanded = " expanded";
        if (!isBranchExpanded(element))
            element.className += expanded;
        window.setTimeout(function () { resizeVideos() }, 300);//большая задержка нужна для того, что бы успел втянуться обратно толбар перед тем как дать команду изменить размеры блоков
        //consoleLog('FileTransfer.showTools() element.className: ' + element.className);
    }

    this.hideTools = function () {
        var block = this.getBlock();

        var settings = block.querySelector('#Settings');
        var snapshot = block.querySelector('#Snapshot');
        var record = block.querySelector('#Record');
        if (
                (settings && (settings.className.indexOf('expanded') != -1))
            ||
                (snapshot && (snapshot.className.indexOf('expanded') != -1))
            ||
                (record && (record.className.indexOf('expanded') != -1))
            )
            return;//do not hide tools if tool's blocks is visible

        var element = this.getBlock().querySelector('#tools');
        element.className = element.className.replace(' expanded', '');
        window.setTimeout(function () { resizeVideos() }, 1000);//большая задержка нужна для того, что бы успел втянуться обратно толбар перед тем как дать команду изменить размеры блоков
        //consoleLog('FileTransfer.hideTools() element.className: ' + element.className);
    }

    this.playToggle = function () {
        consoleLog('FileTransfer.playToggle()');
        var elementMedia = this.getBlock().querySelector('#fileInputType')
        if(elementMedia.paused)
            elementMedia.play();
        else elementMedia.pause();
    }

    this.cancelTransfer = function (noCloseBlock) {
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

//    consoleLog('FileTransfer("' + this.ID + '")2');

    if ((typeof options.options != 'undefined') && (typeof options.options.options != 'undefined') && (typeof options.options.options.id != 'undefined'))
        this.ID = options.options.options.id;
    else if (typeof options.user == 'undefined') {
        if ((typeof options.options != 'undefined') && (typeof options.options.sendMediaName != 'undefined'))
            this.ID = g_user.id + options.options.sendMediaName;//включить мою камеру или микрофон
        else {
            g_fileTransferID++;
            this.ID = g_user.id + g_fileTransferID + options.transferIDName;
        }
    }
    else {
        this.ID = options.file.ID;
    }
    if (typeof options.user != 'undefined')
        this.user = options.user;
    if (typeof options.file != 'undefined')
        this.file = options.file;

//    consoleLog('FileTransfer("' + this.ID + '")3');

    //create File Transfer Element
    var elementBlock = this.getBlock();
    if (elementBlock) {//блок уже создан
        if ((typeof options.options != 'undefined') && (typeof options.options.sendMediaName != 'undefined')) {
            //restarting of local media. посетитель выбрал другую камеру или микрофон
            options.options.elementCreated(this);
        }
        return null;
    } else {

        //ignore
        var style = '';
        if ((typeof this.user != 'undefined') && isIgnore(this.user.id))
            style = ' style="display:none"';

        var elementFileTransfer =
              '<div id="' + this.getBlockID() + '" name="fileTransfer" class="gradient video"' + style
                    //fileTransfer is undefined когда веб камера занята другим приложением, посетитель двигает мышью на блоке камеры во время периодического вызова restartLocalMedia(), кторая вызывается для проверки того, что, возможно, камера освободилась
                    + ' onmouseover="javascript: var fileTransfer = getFileTransfer(\'' + this.getBlockID() + '\'); if (fileTransfer) fileTransfer.showTools()"'
                    +  ' onmouseout="javascript: var fileTransfer = getFileTransfer(\'' + this.getBlockID() + '\'); if (fileTransfer) fileTransfer.hideTools()">'
                + '<div style="overflow: auto;">'
                    + options.header(this)
                    + options.leftButton(this)
                + '</div>'
                + (((typeof options.options != 'undefined') && options.options.isBranch) ? '<div id="branch" class="b-toggle">' : '')//for streams. При щелчке на заголовке выдвигается окно с плеерои и инструментами
                    + '<div name="fileTransferContainer" class="fileTransferContainer">'//style="width:inherit;">'
                        + options.elementFileTransfer(this)
                    + '</div>'
                    + '<div id="tools" class="b-toggle">'
                        + (((typeof options.options != 'undefined') && (typeof options.options.tools != 'undefined')) ? options.options.tools(this) : '')
                        + '<div id="participants"></div>'
                    + '</div>'
                + (((typeof options.options != 'undefined') && options.options.isBranch) ? '</div>' : '')//for streams
            + '</div>'
        ;
        var informerFileTransfers;
        if ((typeof options.options != 'undefined') && (typeof options.options.informerFileTransfers != 'undefined'))
            informerFileTransfers = options.options.informerFileTransfers;
        else informerFileTransfers = 'informerFileTransfers';
        $('#' + informerFileTransfers).append(elementFileTransfer);

        if ((typeof options.options != 'undefined') && (typeof options.options.elementCreated != 'undefined'))
            options.options.elementCreated(this);
        var elementBlock = document.getElementById(this.getBlockID());
        if (elementBlock == null)
            return;//блок был аварийно удален, например потому, что микрофон не устанвовлен в системе
        elementBlock.fileTransfer = this;
        elementBlock.closeMediaSession = function (elementID) {
            consoleLog('FileTransfer.closeMediaSession()');
            document.getElementById(elementID + 'Block').fileTransfer.cancel();
        };
        options.setFileInput(this, elementBlock);
    }
    this.isReceiver = function () { return this.getBlock().querySelector('#fileInput') == null; }

    this.toggleFileTransfer();
}

function closeFileTransfer(userID) {
    consoleLog('closeFileTransfer("' + userID + '")');
    var fileTransfers = document.getElementsByName('fileTransfer');
    for (i = fileTransfers.length - 1; i >= 0; i--) {
        var fileTransfer = fileTransfers[i];
        if (typeof fileTransfer.fileTransfer.user == 'undefined')
            continue;
        if (fileTransfer.fileTransfer.user.id == userID) {
            fileTransfer.fileTransfer.cancel();
            delete fileTransfer.fileTransfer;
        }
    }
}

function getFileTransfer(blockID)
{
    var fileTransfer = document.getElementById(blockID).fileTransfer;
    if (fileTransfer)
        return fileTransfer
    return null;
}

function setFileTransferContainerWidth(fileTransferContainer) {
    var fileTransferContainerWidth = fileTransferContainer.parentNode.clientWidth;// - 10;
    fileTransferContainer.style.width = fileTransferContainerWidth + 'px';

    var fileInputType = fileTransferContainer.querySelector('#fileInputType');
    if (fileInputType && (typeof fileInputType.setWidth != 'undefined'))
        fileInputType.setWidth(fileTransferContainerWidth);

    var parentElement = fileTransferContainer.parentElement;
    while ((parentElement != null) && (typeof parentElement.fileTransfer == 'undefined'))
        parentElement = parentElement.parentElement;
    if (parentElement == null)
        return;//сюда попадает когда камера занята другим приложением, посетитель двигает мышь по блоку камеры и происходить периодический перезапуск камеры
    var fileTransfer = parentElement.fileTransfer;
    if (typeof fileTransfer.options.setToolsWidth != 'undefined')
        fileTransfer.options.setToolsWidth(fileTransfer.getBlock().querySelector('#tools'));
};

function Transfers(transfersID, options) {
    this.branchTransfers = options.branchTransfers;
    this.noFileTransfer = options.noFileTransfer;
    var element = document.getElementById(transfersID);
    if (element == null) {
        var users = document.getElementById('users');
        element = document.createElement('div');
        element.id = transfersID;
        element.innerHTML =
              '<a href="#" onclick="javascript: ' + options.onclickTransfers + '()">'
                + '<h1>'
                    + '<span id="' + this.branchTransfers + '">▼</span>'
                    + '<span>' + options.branchName + '</span>'
                    + '<span>: </span>'
                    + '<span id="fileTransfersCount"></span>'
                + '</h1>'
            + '</a>'
            + '<div id="' + options.informerTransfers + '" style="margin-top:5px;overflow: auto;">'
                + '<div id="' + this.noFileTransfer + '"></div>'
            + '</div>'
        ;
        users.insertBefore(element, users.querySelector('#invitations').nextElementSibling);
    }
    element.style.display = 'block';
}

function Files() {
    new Transfers('fileTransfers', {
        branchTransfers: 'branchFileTransfers'
        , noFileTransfer: 'noFileTransfer'
        , informerTransfers: 'informerFileTransfers'
        , branchName: lang.fileTransfers//Files
        , onclickTransfers: 'onclickFileTransfers'
    });
}

function Pictures(pictureTransfers) {
    this.transfers = new Transfers(pictureTransfers, {
        branchTransfers: 'branchPictureTransfers'
        , noFileTransfer: 'noPictureTransfer'
        , informerTransfers: 'informerPictureTransfers'
        , branchName: lang.pictureTransfers//Pictures
        , onclickTransfers: 'onclickPictureTransfers'
    });
}

function onclickPictureTransfers(expand) {
    return onbranchFast('informerPictureTransfers', 'branchPictureTransfers');
//    return onbranch('informerPictureTransfers', 'branchPictureTransfers', expand, document.getElementById("users").clientHeight + "px");
};

function Videos(videoTransfers) {
    this.transfers = new Transfers(videoTransfers, {
        branchTransfers: 'branchVideoTransfers'
        , noFileTransfer: 'noVideoTransfer'
        , informerTransfers: 'informerVideoTransfers'
        , branchName: lang.videoTransfers//Videos
        , onclickTransfers: 'onclickVideoTransfers'
    });
}

function onclickVideoTransfers(expand) {
    return onbranchFast('informerVideoTransfers', 'branchVideoTransfers');
};

function Audios(audioTransfers) {
    this.transfers = new Transfers(audioTransfers, {
        branchTransfers: 'branchAudioTransfers'
        , noFileTransfer: 'noAudioTransfer'
        , informerTransfers: 'informerAudioTransfers'
        , branchName: lang.audioTransfers//Audioclips
        , onclickTransfers: 'onclickAudioTransfers'
    });
//    onclickAudioTransfers(true);
}

function onclickAudioTransfers(expand) {
    return onbranchFast('informerAudioTransfers', 'branchAudioTransfers', expand, document.getElementById("users").clientHeight + "px");
//    return onbranch('informerAudioTransfers', 'branchAudioTransfers', expand, document.getElementById("users").clientHeight + "px");
};

closeSessionCauseEnum = {
    defaultCause: 0
    , permissionDenied: 1
    , setupWebcam: 2
    , webcamBusy: 3
    , error: 4
    , incompatibleBrowser: 5
    , restartLocalMedia: 6
    , restartLocalMediaNext: 7
    , updateSettings: 8
    , setupMicrophone: 9
    , notSupported: 10
}

function getCauseMessage(closeSessionCause) {
    switch (closeSessionCause) {
        case closeSessionCauseEnum.defaultCause://0
            return '';
        case closeSessionCauseEnum.permissionDenied://1
            return lang.permissionDeniedShort;//Permission to media devices is denied.
        case closeSessionCauseEnum.setupWebcam://2
            return lang.MediaNotDetected;//Media device is not detected.
        case closeSessionCauseEnum.webcamBusy://3
            return lang.MediaBusy;//Media device is busy.
        case closeSessionCauseEnum.error://4
            return lang.MediaError;//'Error of the media device.'
        case closeSessionCauseEnum.incompatibleBrowser://5
            return lang.incompatibleBrowser;//'Incompatible browser.'
        case closeSessionCauseEnum.restartLocalMedia://6
            return lang.restartLocalMedia;//'Restart media device.'
        case closeSessionCauseEnum.restartLocalMediaNext://7
            return 'restart local media next';
        case closeSessionCauseEnum.updateSettings://8
            return 'update settings';
        case setupMicrophone://9
            return 'setup microphone';
        case closeSessionCauseEnum.notSupported://10
            return lang.notSupported;//'Only secure origins are allowed. Please use protocol for secure communication HTTPS for opening this web page.'
        default: consoleError('Unknown closeSessionCause = ' + closeSessionCause);
    }
    return ''; 
}

