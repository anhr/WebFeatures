function Microphones(microphoneTransfers) {
    this.transfers = new Transfers(microphoneTransfers, {
        branchTransfers: 'branchMicrophoneTransfers'
        , noFileTransfer: 'noMicrophoneTransfer'
        , informerTransfers: 'informerMicrophoneTransfers'
        , branchName: lang.microphones//'Microphones'
        , onclickTransfers: 'onclickMicrophoneTransfers'
    });
}
/*
function elementMicrophone(id) {
    return getElementMedia(elementSoundMeter('style="display:none"'));
}
*/
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