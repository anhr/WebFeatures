/**
 * Speech recognition: https://github.com/anhr/web-speech-api/
 * D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\GoogleSite\web-speech-api\web-speech-api\phrase-matcher\index.html
 * Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
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
 *  2018-01-17, :  
 *       + init.
 *
 */
speechRecognition = {
    speechRecognition: 'speechRecognition',
    elSpeechRecognition: document.getElementById('speechRecognitionButton'),
    speechRecognitionTest: function () {
        if ((typeof SpeechRecognition == 'undefined') && (typeof webkitSpeechRecognition == 'undefined')) {
            consoleError('SpeechRecognition: ' + typeof SpeechRecognition);
            alert(lang.SRSetup.noSpeechRecognition)//Your browser does not support Speech Recognition. Try Google Chrome.
            return false;
        }
        return true;
    },
    init: function () {
        loadScript("./Scripts/SpeechRecognition/lang/" + getLanguageCode() + ".js", function () {
            if (!speechRecognition.speechRecognitionTest())
                return;
            consoleLog('speechRecognition.init()');
            speechRecognition.elSRSetup = document.getElementById('speechRecognitionSetup');
            var elSRClose = speechRecognition.elSRSetup.querySelector('#SRClose');
            speechRecognition.checkboxSR = speechRecognition.elSRSetup.querySelector('#checkboxSR');
            if (elSRClose.title == '') {
                elSRClose.title = lang.close;//'Close'
                //            this.elSRSetup.querySelector('#SRHeader').innerHTML = lang.speechRecognitionSetup;//Speech recognition setup
                speechRecognition.elSRSetup.querySelector("#checkboxSRLabel").innerHTML = lang.SRSetup.speechRecognition;//Speech Recognition

                //Language
                speechRecognition.elSRSetup.querySelector("#SRLanguageLabel").innerHTML = lang.SRSetup.language + ': ';//Language
                speechRecognition.selectLanguage = speechRecognition.elSRSetup.querySelector("#SRLanguage"); 
                navigator.languages.forEach(function (language) {
                    var option = document.createElement('option');
                    option.textContent = language;
                    speechRecognition.selectLanguage.appendChild(option);
                });
                var selectedIndex = speechRecognition.getSelectedLanguage();
                if (selectedIndex == undefined) selectedIndex = 0;
                if (selectedIndex >= speechRecognition.selectLanguage.length) selectedIndex = 0;
                speechRecognition.selectLanguage.selectedIndex = selectedIndex;
                speechRecognition.elLanguageHelp = speechRecognition.elSRSetup.querySelector("#SRLanguageHelp");
                speechRecognition.elLanguageHelp.innerHTML = lang.SRSetup.languageHelp//The language of the current speech recognition. You can add/remove language in your browser settings.
                    + (DetectRTC.browser.isChrome ? ' ' + lang.SRSetup.chromeLanguagesSettings//Open chrome://settings/ page, click Advanced and go to the Languages pharagraph.
                    : '');

                speechRecognition.elSRSetup.querySelector("#SRHelp").innerHTML = lang.SRSetup.help;//Please click the 🎤 button in the bottom right corner of the panel and say a message
            }
            if (speechRecognition.isRecognition()) {
                speechRecognition.checkboxSR.checked = true;
                speechRecognition.toggleSpeech();
            }
            speechRecognition.elSRSetup.style.display = speechRecognition.elSRSetup.style.display == 'none' ? 'block' : 'none';
            onresize();
        });
    },
    onclickSpeechRecognition: function (event) {
        var el = getElementFromEvent(event);
        consoleLog('speech.onclickSpeechRecognition() checked = ' + el.checked);
        this.toggleSpeech();
        this.setCookie();
        var width = el.checked ? this.elSpeechRecognition.scrollWidth + 'px' : '0px';
        this.elSpeechRecognition.style.width = width;
        var elSpeechRecognitionTranslate = document.getElementById('speechRecognitionTranslate');
        if(elSpeechRecognitionTranslate != undefined) elSpeechRecognitionTranslate.style.width = width;
    },
    toggleSpeech: function () {
        var elSRSettings = this.elSRSetup.querySelector('#SRSettings');/*,
            expanded = 'expanded';
        if (
            (this.checkboxSR.checked && elSRSettings.classList.contains(expanded))
            || (!this.checkboxSR.checked && !elSRSettings.classList.contains(expanded))
            )
            consoleError('speechRecognition.toggleSpeech error');
        elSRSettings.classList.toggle(expanded);
        */
        elSRSettings.style.display = elSRSettings.style.display == 'none' ? 'block' : 'none';
        onresize();
    },
    setCookie: function (recognition) {
        SetCookie(speechRecognition.speechRecognition, JSON.stringify({
            recognition: 
                ((this.checkboxSR != undefined)//создан диалог SpeechRecognition
                && this.checkboxSR.checked //разрешен SpeechRecognition
                )
                || ((recognition != undefined)
                && recognition //успешный звпуск SpeechRecognition
                ),
            selectedLanguage: this.selectLanguage == undefined ? this.selectLanguage : this.selectLanguage.selectedIndex,
        }));
    },
    getSelectedLanguage: function () { return this.getCookie().selectedLanguage; },
    getCookie: function () {
        var cookie = get_cookie(speechRecognition.speechRecognition);
        if (cookie == '')
            return cookie;//for edge
        return JSON.parse(cookie);
    },
    isRecognition: function () {
        var recognition = this.getCookie().recognition;
        if (recognition == undefined)
            return false;//default is not recognition. При первом открытии страницы появляется кнопка speechRecognition
        //если пользователь не нажал кнопку speechRecognition при первом открытии странцы,
        //  то при повторном открытии станицы кнопка speechRecognition исчезает
        //если пользователь нажал кнопку speechRecognition при первом открытии странцы,
        //  то this.getCookie().recognition = true, и при повторном открытии станицы кнопка speechRecognition остается видимой
        return recognition;
    },
    toggle: function (el) {
        loadScript("./Scripts/SpeechRecognition/lang/" + getLanguageCode() + ".js", function () {
            if (speechRecognition.status == 'start') {
                speechRecognition.speechRecognitionIn(false, el);//stop speech recognition
                delete speechRecognition.status;
//                consoleError('speechRecognition start twice');
                consoleLog('speechRecognition stop');
                return;
            }
            if (!speechRecognition.speechRecognitionTest())
                return;
            consoleLog('speechRecognition start');
            var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
//            var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
            var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

            var recognition = new SpeechRecognition();
/*
            var phrase = 'Ok bonalink';
            var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase + ';';
            var speechRecognitionList = new SpeechGrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
*/
            //language
            var selectedIndex = speechRecognition.getSelectedLanguage(),
                language = 'en';
            if ((selectedIndex == undefined) || (selectedIndex >= navigator.languages.length)) selectedIndex = 0;
            for (var i = 0; i < navigator.languages.length; i++) {
                if (i == selectedIndex) {
                    language = navigator.languages[i];
                    break;
                }
            }
            recognition.lang = language;//getLanguageCode();//'en-US';

            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();
            speechRecognition.status = 'start';

            recognition.onresult = function (event) {
                // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
                // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
                // It has a getter so it can be accessed like an array
                // The first [0] returns the SpeechRecognitionResult at position 0.
                // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
                // These also have getters so they can be accessed like arrays.
                // The second [0] returns the SpeechRecognitionAlternative at position 0.
                // We then return the transcript property of the SpeechRecognitionAlternative object 
                var speechResult = event.results[0][0].transcript;
                consoleLog('Speech received: ' + speechResult + '.');
                /*if (speechResult === phrase) consoleLog('I heard the correct phrase!');
                else */ {
//                    consoleLog('That didn\'t sound right.');
                    var elText = el.parentElement.querySelector('#text');
                    if (elText == null) {
                        var body = CKEDITOR.instances.editor.document.getBody();
                        body.setText(body.getText() + ' ' + speechResult);
                    } else elText.value +=  ' ' + speechResult;
                }
                consoleLog('Confidence: ' + event.results[0][0].confidence);
            }

            recognition.onspeechend = function () {
                recognition.stop();
                speechRecognition.status = 'speechend';
                consoleLog('recognition.onspeechend()');
                speechRecognition.speechRecognitionIn(false, el);
            }

            recognition.onerror = function (event) {
                recognition.stop();
                speechRecognition.status = 'error';
                consoleError('Error occurred in recognition: ' + event.error);
                speechRecognition.speechRecognitionIn(false, el);
            }
            speechRecognition.speechRecognitionIn(true, el);
        });
    },
    speechRecognitionIn: function (open, el) {
        /*if (el == undefined) elSpeechRecognitionIn = document.getElementById('speechRecognitionIn');
        else*/ elSpeechRecognitionIn = el.parentElement.querySelector('#speechRecognitionIn');
        var widthIn = 0;
        if (open) {
            /*if (elSpeechRecognitionIn.innerHTML == '')*/ {
                elSpeechRecognitionIn.innerHTML = '<meter high="0.25" max="1" value="0"></meter><span class="value"></span>';
                getMedia({
                    audio: true,
                    /*
                    //https://simpl.info/getusermedia/sources/
                    audio: {
                        optional: []
                    },
                    */
                }, function (stream) {
                    consoleLog('getMedia success');
                    speechRecognition.setCookie(true);
                    speechRecognition.stream = stream;
                    function CreateSoundMeter(MediaStream, elSoundMeter) {
                        elSoundMeter.stopSoundMeter = false;
                        var createSoundMeter = this;
                        if (typeof MediaStream == 'undefined') {
                            consoleError('MediaStream: ' + MediaStream);
                            return;
                        }

                        if (MediaStream.getAudioTracks().length == 0) {
                            consoleError('createSoundMeter: no audio tracks');//Возможно запрещен доступ к микрофону в браузере (Chrome: Settings/Content Settings/Microphone/Do not allow sites to acces to your microphone)
                            return;
                        }

                        //Audio stream volume https://webrtc.github.io/samples/src/content/getusermedia/volume/
                        // Put variables in global scope to make them available to the
                        // browser console.
                        loadScript("../js/soundmeter.js", function () {
                            var soundMeterIntervalID,
                                soundMeter = new SoundMeter(window.audioContext);
                            soundMeter.connectToSource(MediaStream, function (e) {
                                if (e) {
                                    //alert(e);
                                    consoleError('soundMeter e = ' + e);
                                    return;
                                }
                                //            var soundMeter = document.getElementById(getSoundMeterID(blockId));
                                if (!elSoundMeter) {
                                    consoleError('soundMeter = ' + elSoundMeter);
                                    return;
                                }
//                                elSoundMeter.style.display = 'block';
                                //http://javascript.ru/setinterval
                                window.clearInterval(soundMeterIntervalID);
                                soundMeterIntervalID = setInterval(function () {
                                    //consoleLog('soundMeterInterval()');
                                    if (elSoundMeter.stopSoundMeter) {
                                        window.clearInterval(soundMeterIntervalID);
                                        soundMeter.stop();
                                        return;
                                    }
                                    var instantMeter = elSoundMeter.querySelector('meter');
                                    if (!instantMeter) {
                                        consoleError('soundMeter failed!');
                                        return;
                                    }
                                    instantMeter.value = soundMeter.instant.toFixed(2);
                                    elSoundMeter.querySelector('.value').innerText = (soundMeter.instant * 100).toFixed();
                                }, 200);
                            });
                        });
                    }
                    CreateSoundMeter(stream, elSpeechRecognitionIn);
                }, function (err) {
                    consoleError("The following error occurred:", err);
                    var message;
                    switch (err.name) {
                        case 'NotFoundError':
                        case 'DevicesNotFoundError':
                            message = lang.setupMicrophone;//'Please setup your microphone first.'
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.setupWebcam;
                            break;
                        case 'NotReadableError'://Firefox
                        case 'SourceUnavailableError':
                        case 'TrackStartError':
//                            fileTransfer.restartLocalMediaTimeout();
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.webcamBusy;
                            return;
                        case 'NotSupportedError':
                            if (window.location.protocol == "https:") {
                                message = err.name + ' ' + err.message;
//                                fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                            } else message = lang.notSupported;//'Only secure origins are allowed. Please use protocol for secure communication HTTPS for opening this web page.'
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.notSupported;
                            break;
                        case 'PermissionDeniedError':
                            if (window.location.protocol == "https:") {
                                message = lang.permissionDeniedShort + browserSettings();//'Permission to media devices is denied.'
                            } else message = lang.permissionDenied;//'Permission to media devices is denied. Please use protocol for secure communication HTTPS for opening this web page.'
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.permissionDenied;
                            break;
                        case 'ReferenceError':
                        case 'SecurityError':
                        case 'NotAllowedError'://for Firefox
                            message = lang.securityError.replace('%s', err.message) + browserSettings();//'Permission to media devices is denied.\n\n%s\n\nPlease allow to use the camera and microphone in your web browser for our web site.'
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.permissionDenied;
                            break;
                        case 'InternalError'://for Firefox
                            message = err.name + ' ' + err.message;
                            switch (err.message) {
                                case 'Starting audio failed':
                                case 'Starting video failed':
                                    consoleError(message);
//                                    restartLocalMediaTimeout();
                                    return;
                                default:
//                                    fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                            }
                            break;
                        default:
                            message = err.name + ' ' + err.message;
//                            fileTransfer.closeSessionCause = closeSessionCauseEnum.error;
                            break;
                    }
                    alert(message);
//                    fileTransfer.loadedmetadata = false;
//                    fileTransfer.cancel();
                });
            }
            elSpeechRecognitionIn.childNodes.forEach(function (el) {
                widthIn += el.scrollWidth;
            });
            widthIn += 25;
        } else {
            //stop speech recognition
            elSpeechRecognitionIn.stopSoundMeter = true;
//            width = this.elSpeechRecognition.scrollWidth;
            if (this.stream != undefined) {
                this.stream.getTracks().forEach(function (track) {
                    track.stop();//free media device
                });
            }
        }
        elSpeechRecognitionIn.style.width = widthIn + 'px';
        //this.elSpeechRecognition.style.width = width + 'px';
    },
    onclickLanguageHelp: function () {
        this.elLanguageHelp.style.display = this.elLanguageHelp.style.display == 'none' ? 'inline' : 'none';
        onresize();
    },
    onchangeLanguage: function (event) {
        consoleLog('speechRecognition.onchangeLanguage()');
        getElementFromEvent(event).selectedOptions[0].innerHTML;//"en-US"
        this.setCookie();
    },
}
