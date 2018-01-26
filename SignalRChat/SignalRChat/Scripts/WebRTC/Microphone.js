/**
 * Common Javascript code.
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
 *  2015-07-01, : 
 *       + init.
 *
 */
function Microphones(microphoneTransfers) {
    this.transfers = new Transfers(microphoneTransfers, {
        branchTransfers: 'branchMicrophoneTransfers'
        , noFileTransfer: 'noMicrophoneTransfer'
        , informerTransfers: 'informerMicrophoneTransfers'
        , branchName: lang.microphones//'Microphones'
        , onclickTransfers: 'onclickMicrophoneTransfers'
    });
}
function onRecordMicrophone(blockId) {
    //    consoleDebug('onRecordMicrophone(' + blockId + ')');
    onRecordMedia(blockId, {
        media: 'audio'
        , waitMediaRecordPermission: lang.waitAudioRecordPermission//'Waiting for permission from %s for start of the audio recording'
        , mediaRecordingID: 3//Microphone
    });
}

function elementMicrophoneTools(fileTransfer, options) {
    fileTransfer.options.setToolsWidth = function () {
        //consoleLog('Microphone. setToolsWidth');

        var block = fileTransfer.getBlock();

        var audio = block.querySelector('.fileTransferContainer').querySelector('audio');
        if (audio != null)
            audio.style.width = audio.parentElement.clientWidth + 'px';

        var audioRecord = block.querySelector('#Record').querySelector('audio');
        audioRecord.style.width = audioRecord.parentElement.clientWidth + 'px';
    }
    return elementMediaTools({
        mediaRecording: lang.microphoneRecording//'Audio recording'
        , toggleMediaRecording: 'toggleAudioRecording'
        , options: options
        , media: 'audio'
        , recordIcon: '✇'
        , fileTransfer: fileTransfer
        , downloadMedia: lang.downloadAudio//'Download. You can play the downloaded audio clip by Google Chrome or Mozilla Firefox or Opera browser.'
    });
}
/*
function getAudioFromContainer(elementContainer) {
    if (elementContainer == null)
        return;
    var element = elementContainer.querySelector('video');
    if (!element) {
        element = document.createElement('video');
        elementContainer.appendChild(element);
    }
    return element;
}

function getAudio(blockId) {
    return getAudioFromContainer(document.getElementById(blockId).querySelector('.fileTransferContainer'));
}
*/
function AudioRecording(blockId) {
    consoleLog('AudioRecording(' + blockId + ')');
    this.recording = new Recording(blockId, {
        media: 'audio'
//        , getMedia: getAudio
        , clipType: 'audio'
        , clipName: 'audioclip'
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

function toggleAudioRecording(blockId) {
    toggleMediaRecording(blockId, AudioRecording);
}
/*
function closeAudioSession(videoID, noCloseAudioBlock) {
    return closeMediaSession(videoID, noCloseAudioBlock,
        {
            getMediaBlock: getAudioBlock
            , getMediaBlockID: getAudioBlockID
            , toggleBroadcastMedia: toggleBroadcastAudio
            , stopRecording: stopAudioRecording
        });
}
*/