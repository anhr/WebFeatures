/**
 * Common Javascript code.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.ucoz.net/AboutMe/
 * source: https://developers.google.com/web/updates/2016/01/mediarecorder
            https://webrtc.github.io/samples/src/content/getusermedia/record/
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

function Recording(blockId, options) {
    //consoleLog('Recording(' + blockId + ')');

    this.options = options;
    this.block = document.getElementById(blockId);
    this.elementRecord = this.block.querySelector('#Record');
    this.recordButton = this.elementRecord.querySelector('#record'); 
    this.playToggleButton = this.elementRecord.querySelector('#playToggle');
    this.downloadButton = this.elementRecord.querySelector('#download');
    this.recordedMedia = this.elementRecord.querySelector(options.media + '#recorded');
    this.recordedMedia.mediaRecording = this;
    this.elementRecordDuration = this.elementRecord.querySelector('#RecordDuration');

    //https://developer.mozilla.org/ru/docs/Web/Guide/Events/Media_events
    this.recordedMedia.addEventListener("error", function (ev) {
        consoleError('MediaRecording.recordedMedia.error()' + JSON.stringify(ev));
        alert(lang.playMediaFailed.replace('%s', this.src));//Your browser can not play\n\n%s\n\n media clip. Use Google Chrome or Mozilla Firefox or Opera browser.
    }, true);

    this.handleDataAvailable = function (event) {
        if (event.data && event.data.size > 0) {
            //consoleLog('Recording. handleDataAvailable ' + this.recordedBlobs.length);
            this.recordedBlobs.push(event.data);
        }
    }

    this.handleStop = function (event) {
        this.src = window.URL.createObjectURL(new Blob(this.recordedBlobs, { type: this.recording.options.clipType + '/webm' }));
        consoleLog('Recorder stopped. src: ' + this.src);
        this.recording.play();
    }

    this.toggleRecording = function () {
        consoleLog('toggleRecording()');
        if ((typeof this.mediaRecorder != 'undefined') && (this.mediaRecorder.state == 'recording'))
            this.stopRecording();
        else this.startRecording();
    }

    // The nested try blocks will be simplified when Chrome 47 moves to Stable
    this.startRecording = function () {
        consoleLog('MediaRecording.startRecording()');
        this.playing = false;
        if (typeof this.mediaRecorder != 'undefined') {
            window.URL.revokeObjectURL(this.mediaRecorder.src);
            delete this.mediaRecorder;
        }
        var stream = this.block.fileTransfer.stream;

        var options = { mimeType: this.options.clipType + '/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            consoleLog(options.mimeType + ' is not Supported');
            options = { mimeType: this.options.clipType + '/webm;codecs=vp8' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                consoleLog(options.mimeType + ' is not Supported');
                options = { mimeType: this.options.clipType + '/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    consoleLog(options.mimeType + ' is not Supported');
                    options = { mimeType: '' };
                }
            }
        }
        try {
            this.mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            consoleError('Exception while creating MediaRecorder: ' + e);
            var message = lang.mediaRecorderError;//'MediaRecorder is not supported by this browser.\n\n%s\n\nTry Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.'
            message = message.replace('%s', e)
            alert(message);
            return;
        }
        this.recordButton.title = lang.stopRecording;//'Stop Recording'
        this.recordButton.textContent = '■';
        this.mediaRecorder.recordedBlobs = [];
        this.mediaRecorder.recording = this;
        this.mediaRecorder.onstop = this.handleStop;
        this.mediaRecorder.ondataavailable = this.handleDataAvailable;
        this.mediaRecorder.onerror = function (e) {
            consoleError("An error has occurred: " + e.message);
        }
        try {
            consoleLog('Recording.mediaRecorder.state: ' + this.mediaRecorder.state);// + ' canRecordMimeType: ' + this.mediaRecorder.canRecordMimeType());
            //ATTENTION!!! crash Opera Android!
            this.mediaRecorder.start(10); // collect 10ms of data
        } catch (e) {
            consoleError('Recording.mediaRecorder.start failed! ' + e.message);
        }

        //ATTENTION!!! crash Firefox!
        //this.recordedMedia.src = '';

        this.displayRecordedMedia('none');

        consoleLog('MediaRecorder started');//, this.mediaRecorder);

        //Record duration
        this.startTime = parseInt(new Date().getTime());
        this.displayRecordDuration = function () {
            window.displayDuration(this.startTime, this.elementRecordDuration);
        }
        this.displayRecordDuration();
        var mediaRecording = this;
        this.intervalDisplayRecordDurationID = window.setInterval(function () {
            //consoleLog('MediaRecording.intervalDisplayRecordDuration');// currentTime = ' + camera.currentTime + '. camera.startTime = ' + camera.startTime + ' time = ' + time);
            mediaRecording.displayRecordDuration.call(mediaRecording);
        }, 1000);

        this.displayRecordDurationStop = function () {
            consoleLog('MediaRecording.displayRecordDurationStop()');
            window.clearInterval(this.intervalDisplayRecordDurationID);
        }
    }

    this.stopRecording = function () {
        this.recordButton.title = lang.startRecording;//'Start recording'
        this.recordButton.innerHTML = '<font style="COLOR: red;">●</font>';
        if ((typeof this.mediaRecorder == 'undefined') || (this.mediaRecorder.state != 'recording'))
            return;
        this.mediaRecorder.stop();
        consoleLog('MediaRecording.stopRecording()');// Recorded Blobs: ' + this.mediaRecorder.recordedBlobs);
        this.recordedMedia.controls = true;
//        this.recordedMedia.duration = parseInt(this.block.querySelector('#recordBlock').querySelector('#RecordDuration').time / 1000);
        resizeVideos();
        this.displayRecordDurationStop();
        this.displayRecordedMedia('block');
    }

    this.displayRecordedMedia = function (display) {
        if (this.playToggleButton)
            this.playToggleButton.style.display = display;
        this.downloadButton.style.display = display;
        this.recordedMedia.style.display = display;
    }

    this.playToggle = function () {
        consoleLog('MediaRecording.playToggle()');
        if (this.recordedMedia.paused)
            this.recordedMedia.play();
        else this.recordedMedia.pause();
    }

    this.play = function () {
        try {
            this.playing = true;
            //не работает в Opera Android. Хотя файл webm открытый в FileTransfer.showVideo здесь открывается. Используй window.chatDebug.src для тестирования
            //var superBuffer = new Blob(this.mediaRecorder.recordedBlobs, { type: this.options.clipType + '/webm' });
            /*
            if (typeof window.chatDebug != 'undefined')
                this.recordedMedia.src = window.chatDebug.src; else
            */
            //this.recordedMedia.src = window.URL.createObjectURL(new Blob(this.mediaRecorder.recordedBlobs, { type: this.options.clipType + '/webm' }));
            this.recordedMedia.src = this.mediaRecorder.src;
            consoleLog('MediaRecording.play() src: ' + this.recordedMedia.src); 
        } catch (e) {
            consoleLog('MediaRecording.play() failed! ' + e);
        }
    }

    this.onplay = function () {
        if (!this.playToggleButton)
            return;
        this.playToggleButton.innerHTML = '❚❚';
        this.playToggleButton.title = lang.pause;//Pause
    }
    this.onpause = function () {
        if (!this.playToggleButton)
            return;
        this.playToggleButton.innerHTML = '►';
        this.playToggleButton.title = lang.play;//Play
    }
    this.onended = function () {
        consoleLog('MediaRecording.onended()');
        if(DetectRTC.browser.isFirefox)
            this.play();//for playing of the webm files in the Firefox
                    //also for twice or more replaying of the recorded stream in the Firefox.
    }
    this.download = function () {
        
        var src = this.mediaRecorder.src;
        window.download(src, options.clipName + '.webm', true);
        consoleLog('MediaRecording.download() src: ' + src);
    }
}