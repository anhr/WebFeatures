/**
 * Speech synthesiser of all incoming messages: https://github.com/anhr/web-speech-api/
 * D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\GoogleSite\web-speech-api\web-speech-api\speak-easy-synthesis
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
 *  2018-01-12, :  
 *       + init.
 *
 */
speech = {
    synth: window.speechSynthesis,
    speech: 'speech',
    speechLang: 'speechLang',
    voices: [],
    init: function () {
        consoleLog('speech.init()');
        this.elSpeech = document.getElementById('speech');
        this.elSpeech.querySelector("#speechClose").title = lang.close;//Close
        this.elSpeechIncomingMessages = this.elSpeech.querySelector('#checkboxSpeechIncomingMessages');
        loadScript("./Scripts/Speech/lang/" + getLanguageCode() + ".js", function () {
            speech.elSpeech.querySelector("#speechIncomingMessages").innerHTML = lang.speechDlg.speechHeader;//Speech synthesiser of all incoming messages
            speech.elSpeech.querySelector("#rateLabel").innerHTML = lang.speechDlg.rate + ': ';//Rate
            speech.elSpeech.querySelector("#pitchLabel").innerHTML = lang.speechDlg.pitch + ': ';//Pitch
            speech.elSpeech.querySelector("#volumeLabel").innerHTML = lang.speechDlg.volume + ': ';//Volume
            speech.elSpeech.querySelector("#speechCancel").value = lang.speechDlg.speechCancel;//Cancel Speech
        });

        //pitch init
        this.pitch = this.elSpeech.querySelector('#pitch');
        this.pitchValue = this.elSpeech.querySelector('.pitch-value');
        this.pitch.onchange = function (event) {
            speech.pitchValue.textContent = getElementFromEvent(event).value;
            speech.setCookie();
        }
        var pitch = this.getPitch();
        this.pitch.value = pitch;
        speech.pitchValue.textContent = pitch;

        //rate init
        this.rate = this.elSpeech.querySelector('#rate');
        this.rateValue = this.elSpeech.querySelector('.rate-value');
        this.rate.onchange = function (event) {
            speech.rateValue.textContent = getElementFromEvent(event).value;
            speech.setCookie();
        }
        var rate = this.getRate()
        this.rate.value = rate;
        speech.rateValue.textContent = rate;

        //volume init
        var k = 100;
        this.volume = this.elSpeech.querySelector('#volume');
        this.volumeValue = this.elSpeech.querySelector('.volume-value');
        this.volume.onchange = function (event) {
            speech.volumeValue.textContent = parseInt(getElementFromEvent(event).value * k);
            speech.setCookie();
        }
        var volume = this.getVolume()
        this.volume.value = volume;
        speech.volumeValue.textContent = parseInt(volume * k);

        if (this.synth == undefined)
            return;//uncompatible browser. Open Safari for testing

        this.synth.cancel();

        //https://stackoverflow.com/questions/21513706/getting-the-list-of-voices-in-speechsynthesis-of-chrome-web-speech-api/22978802#22978802
        window.speechSynthesis.onvoiceschanged = function () {
            //В Firefox эта функция вызывается только один раз после запуска системы и открытия этой страницы
            //При обновлении страницы над о принудительно вызыват эту функцию. Смотри выше

            if (speech.voices.length > 0) return;

            //populate voice list
            speech.voiceSelect = speech.elSpeech.querySelector('select');
            speech.voices = speech.synth.getVoices();

            /*
            //for Opera moblie - speech.voices.length = 0 всегда
            //Но это сообщение выскакивает в Chrome
            if (speech.voices.length == 0) {
                var message = 'speech.voices.length = ' + speech.voices.length;
                consoleError(message);
                alert(lang.uncompatibleBrowser.replace("%s", message));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
                return;
            }
            */
            var selectedIndex = speech.getSelectedVoice();// speech.voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex,
            //                speechLang = speech.getSpeechLang();//get_cookie(speech.speechLang);
            if (selectedIndex == undefined) selectedIndex = speech.voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;

            consoleLog('window.speechSynthesis.onvoiceschanged() voices.length = ' + speech.voices.length);
            speech.voiceSelect.innerHTML = '';
            for (i = 0; i < speech.voices.length ; i++) {
                var option = document.createElement('option');
                option.textContent = speech.voices[i].name + ' (' + speech.voices[i].lang + ')';
                /*
                if (voices[i].default) {
                    option.textContent += ' -- DEFAULT';
                }
                */
                option.setAttribute('data-lang', speech.voices[i].lang);
                option.setAttribute('data-name', speech.voices[i].name);
                speech.voiceSelect.appendChild(option);
                /*
                                if (speechLang == speech.voices[i].lang)
                                    selectedIndex = i;
                */
            }
            speech.voiceSelect.selectedIndex = selectedIndex;
        };

        //for Firefox При обновлении страницы window.speechSynthesis.onvoiceschanged() не вызывается. Поэтому ее надо вызывать принудительно
        if (speech.voices.length == 0) window.speechSynthesis.onvoiceschanged();

        speech.status();

        if (speech.isSpeech()) {
            speech.elSpeechIncomingMessages.checked = true;
            speech.toggleSpeech();
        }
    },
    toggleSpeech: function () {
        var elSpeechSettings = this.elSpeech.querySelector('#speechSettings'),
            expanded = 'expanded';
        if (
            (this.elSpeechIncomingMessages.checked && elSpeechSettings.classList.contains(expanded))
            || (!this.elSpeechIncomingMessages.checked && !elSpeechSettings.classList.contains(expanded))
            )
            consoleError('speech.toggleSpeech error');
        elSpeechSettings.classList.toggle(expanded);
    },
    setCookie: function () {
        if (this.synth == undefined) return;
        SetCookie(speech.speech, JSON.stringify({
            speech: this.elSpeechIncomingMessages.checked,
            selectedVoice: this.elSpeech.querySelector('select').selectedIndex,
//            speechLang: this.elSpeech.querySelector('select').selectedOptions[0].getAttribute('data-lang'),
            pitch: this.pitch.value,
            rate: this.rate.value,
            volume: this.volume.value,
        }));
        this.synth.cancel();
    },
    getCookie: function () {
        var cookie = get_cookie(speech.speech);
        if (cookie == '')
            return cookie;//for edge
        return JSON.parse(cookie);
    },
    isSpeech: function () {
        var speech = this.getCookie().speech;
        if (speech == undefined)
            return true;//default is speech
        return speech;
    },
//    getSpeechLang: function () { return this.getCookie().speechLang; },
    getPitch: function () {
        var pitch = this.getCookie().pitch;
        if (pitch == undefined) {
            if (this.pitch == undefined)
                return '1';//The 'speech' dialog never opened
            return this.pitch.value;
        }
        return pitch;
    },
    getRate: function () {
        var rate = this.getCookie().rate;
        if (rate == undefined) {
            if (this.rate == undefined)
                return '1';//The 'speech' dialog never opened
            return this.rate.value;
        }
        return rate;
    },
    getVolume: function () {
        var volume = this.getCookie().volume;
        if (volume == undefined) {
            if (this.volume == undefined)
                return '1';//The 'speech' dialog never opened
            return this.volume.value;
        }
        return volume;
    },
    getSelectedVoice: function () { return this.getCookie().selectedVoice; },
    onclickSpeechIncomingMessages: function (event) {
        var el = getElementFromEvent(event);
        consoleLog('speech.onclickSpeechIncomingMessages() checked = ' + el.checked);
        if (this.synth == undefined) {
            var message = 'window.speechSynthesis = ' + window.speechSynthesis;
            consoleError(message);
            alert(lang.uncompatibleBrowser.replace("%s", message));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
            el.checked = false;
            return;
        }
        this.toggleSpeech();
        this.setCookie();
    },
    onchangeVoice: function (event) {
        consoleLog('speech.onchangeVoice() dataLang: ' + getElementFromEvent(event).selectedOptions[0].getAttribute('data-lang'));
        this.setCookie();
    },
//    speakCount: 0,
    speak: function (text, elMessage) {
        if ((this.elSpeechIncomingMessages != undefined) && !this.elSpeechIncomingMessages.checked)
            return;
/*
        if (this.speakCount > 2) {
            consoleError('speech.speakCount = ' + this.speakCount);
            return;
        }
        this.speakCount++;
*/
        //inner text from elements
        var el = document.createElement('div');
        el.innerHTML = text;
        text = el.innerText;
        consoleLog('speech.speak(' + text + ')');
        var utterThis = new SpeechSynthesisUtterance(text);
//        utterThis.elMessage = elMessage;
        utterThis.onstart = function (event) {
            consoleLog('SpeechSynthesisUtterance.onstart ');
            speech.enableElements(false);
            elMessage.style.background = 'lime';
        }
        utterThis.onend = function (event) {
            consoleLog('SpeechSynthesisUtterance.onend');
            speech.enableElements(true);
            elMessage.style.background = '';
//            speech.speakCount--;
        }
        utterThis.onerror = function (event) {
            consoleError('SpeechSynthesisUtterance.onerror');
        }

        if (this.elSpeech == null) {
            utterThis.voice = this.synth.getVoices()[this.getSelectedVoice()];
            utterThis.pitch = this.getPitch();
            utterThis.rate = this.getRate();
            utterThis.volume = this.getVolume();
        } else {
            var selectedOption = this.voiceSelect.selectedOptions[0].getAttribute('data-name');
            for (i = 0; i < this.voices.length ; i++) {
                if (this.voices[i].name === selectedOption) {
                    utterThis.voice = this.voices[i];
                    break;
                }
            }
            utterThis.pitch = this.pitch.value;
            utterThis.rate = this.rate.value;
            utterThis.volume = this.volume.value;
        }
        this.synth.speak(utterThis);
    },
    enableElements: function (enable) {
        //consoleLog('speech.enableElements(' + enable + ')');
        if (this.elSpeech == null)
            return;
        this.elSpeech.querySelectorAll('input').forEach(function (elInput) {
            switch (elInput.id) {
                case 'speechCancel':
//                    elInput.style.display = enable ? 'none' : 'inline';
//                    elInput.disabled = enable;
                case 'checkboxSpeechIncomingMessages':
                    return;
            }
//            elInput.disabled = !enable;
        });
//        this.elSpeech.querySelector('select').disabled = !enable;
        this.status();
    },
    speechCancel: function () {
//        this.speakCount = 0;
        if (!this.synth.speaking) return;
        consoleLog('speech.speechCancel');
        this.synth.cancel();
//        if (this.arText != undefined) this.arText = [];
    },
    status: function () {
        var status = '';
        if (this.synth.paused) status += ' ' + lang.speechDlg.paused + '.';//Paused
        if (this.synth.pending) status += ' ' + lang.speechDlg.pending + '.';//Pending
        if (this.synth.speaking) status += ' ' + lang.speechDlg.speaking + '.';//Speaking
        speech.elSpeech.querySelector("#speechStatus").innerHTML = status == '' ? '' : lang.speechDlg.status + ':' + status;//Status
    },
}
//speech.init();
