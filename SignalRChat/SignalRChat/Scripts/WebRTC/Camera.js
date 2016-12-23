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

function Cameras(cameraTransfers) {
    this.transfers = new Transfers(cameraTransfers, {
        branchTransfers: 'branchCameraTransfers'
        , noFileTransfer: 'noCameraTransfer'
        , informerTransfers: 'informerCameraTransfers'
        , branchName: lang.videos//Cameras
        , onclickTransfers: 'onclickCameraTransfers'
    });
}

function elementCamera(id) {
    return getElementMedia('<video' + ((typeof id == 'undefined') ? '' : ' id="' + id + '"') + ' autoplay style="display:none;width:inherit"></video>');
}

function onRecordVideo(blockId) {
    //    consoleDebug('onRecordVideo(' + blockId + ')');
    onRecordMedia(blockId, {
        media: 'video'
        , waitMediaRecordPermission: lang.waitVideoRecordPermission//Waiting for permission from %s for start of the video recording
        , mediaRecordingID: 2//video
//        , recordNotAllow: lang.cameraRecordNotAllow//'The owner of the video camera does not allow to you to request new permissions for video recording.'
    });
}

function elementCameraTools(fileTransfer, options) {
    consoleLog('elementCameraTools');
    fileTransfer.onСanvas = function () {
        consoleLog('fileTransfer.onСanvas()');
        var elementSnapshot = this.getBlock().querySelector('#Snapshot');
        if (!isBranchExpanded(elementSnapshot))
            this.onTakeSnapshot();
        return onbranchelement(elementSnapshot);
    }
    fileTransfer.onDownloadImg = function () {
        consoleLog('fileTransfer.onDownloadImg()');
        var url = this.getBlock().querySelector('#Snapshot').querySelector('canvas').toDataURL();

        //substring использую потому что медленно работает с фотографиями больших размеров
        var array = url.substring(0, url.indexOf(';') + 1).match(/data:(.*)\/(.*);.*/);
        if (array.length != 3)
            consoleError('onDownloadImg() failed! array.length = ' + array.length);

        window.download(url, array[1] + '.' + array[2]);
    }
    fileTransfer.onTakeSnapshot = function () {//https://webrtc.github.io/samples/src/content/getusermedia/canvas/
        consoleLog('fileTransfer.onTakeSnapshot()');
        var block = this.getBlock();
        var snapshot = block.querySelector('#Snapshot');
        if (snapshot.querySelector('#takeSnapshot').disabled) {
            consoleLog('take snapshot is disabled');
            return;
        }
        var canvas = snapshot.querySelector('canvas');
        var video = block.querySelector('.fileTransferContainer').querySelector('video');
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        snapshot.querySelector('canvas').style.display = 'block';//for ReceiveCamera
        resizeVideos(); 
    }
    fileTransfer.options.setToolsWidth = function () {
        //consoleLog('camera. setToolsWidth');

        var block = fileTransfer.getBlock();

        var video = block.querySelector('.fileTransferContainer').querySelector('video');
        video.style.width = video.parentElement.clientWidth + 'px';

        var videoRecord = block.querySelector('#Record').querySelector('video');
        videoRecord.style.width = videoRecord.parentElement.clientWidth + 'px';

        var canvas = block.querySelector('#Snapshot').querySelector('canvas');
        canvas.style.width = canvas.parentElement.clientWidth + 'px';
        canvas.style.height = video.clientHeight + 'px';
    }

    return elementMediaTools({
        mediaRecording: lang.videoRecording//'Video recording'
        , toggleMediaRecording: 'toggleVideoRecording'
        , options: options
//        , onRecordMedia: 'onRecordVideo'
        , media: 'video'
        , recordIcon: '📼'
        , fileTransfer: fileTransfer
        , downloadMedia: lang.downloadVideo//'Download. You can play the downloaded video clip by Google Chrome or Mozilla Firefox or Opera browser.'
        , toolButtons: '<h1'
            + ' onclick="javascript: document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.'
                + ((typeof fileTransfer.options.onСanvas == 'undefined') ? '' : 'options.') + 'onСanvas()"'
            + ' class="sendButton" style="position: relative;" title="' + lang.takeSnapshot + '">'//Take snapshot
            + '📷</h1>'//🖼🎴
        , toolFunctions:
            //Take snapshot
              '<div id="Snapshot" class="b-toggle gradient_gray" style="padding:0px;">'
                + '<div id="snapshotBlock">'
                    + '<div style="overflow:auto;">'
                        + '<h2 id="takeSnapshot" onclick="javascript: document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.onTakeSnapshot()"'
                            + ' class="sendButton" style="margin-bottom:5px;float:left;">📷 ' + lang.takeSnapshot + '</h2>'//Take snapshot
                        + '<h2 id="download" onclick="javascript: document.getElementById(\'' + fileTransfer.getBlockID() + '\').fileTransfer.onDownloadImg()"'
                            + ' class="sendButton" style="float:left;" title="' + lang.download + '">'//Download
                            + '💾</h2>'
                    + '</div>'
                    + '<canvas style="width:inherit;display:none"></canvas>'
                + '</div>'
            + '</div>'
    });
}
/*
function getVideoFromContainer(elementContainer) {
    if (elementContainer == null)
        return;
    var element = elementContainer.querySelector('video');
    if (!element) {
        element = document.createElement('video');
        elementContainer.appendChild(element);
    }
    return element;
}

function getVideo(blockId) {
    return getVideoFromContainer(document.getElementById(blockId).querySelector('.fileTransferContainer'));
}
*/
function VideoRecording(blockId) {
    consoleLog('VideoRecording(' + blockId + ')');
    this.recording = new Recording(blockId, {
        media: 'video'
//        , getMedia: getVideo
        , clipType: 'video'
        , clipName: 'videoclip'
    })
    this.toggleRecording = function () {
        this.recording.toggleRecording();
    }
    this.playToggle = function () {
        this.recording.playToggle();
    }
    this.onplay = function () {
        this.recording.onplay();
    }
    this.onpause = function () {
        this.recording.onpause();
    }
    this.onended = function () {
        this.recording.onended();
    }
    this.download = function () {
        this.recording.download();
    }
    this.stopRecording = function () {
        this.recording.stopRecording();
    }
}

function toggleVideoRecording(blockId) {
    toggleMediaRecording(blockId, VideoRecording);
}
