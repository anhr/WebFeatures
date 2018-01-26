/**
 * Translate message before sending
 * API Переводчика: https://tech.yandex.ru/translate/
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
 *  2018-01-23, :  
 *       + init.
 *
 */
translatorSend = {
    translator: 'translatorSend',
    defaultSource: getLanguageCode(),
    defaultTo: 'en',
    init: function (elTranslator, selectLanguageTo) {
        this.elTranslator = elTranslator == undefined ? document.getElementById('translatorSend') : elTranslator;
        if (this.elTranslator.translatorCreated != true) {
            consoleLog('translatorSend.init()');
            this.elTranslator.querySelector("#close").title = lang.close;//Close
            this.elText = this.elTranslator.querySelector("#text");
            this.selectLanguageSource = this.elTranslator.querySelector("#languageSource");
            this.selectLanguageTo = selectLanguageTo;//this.elTranslator.querySelector("#languageTo");
            this.selectLanguageTo.setWidth = function () {
                //                    consoleLog('translatorSend.selectLanguageTo.setWidth()');
                var translatorMenuWidth = 0,
                    elTranslatorMenu = document.getElementById('translatorMenu');
                document.getElementById('translatorMenu').childNodes.forEach(function (el) {
                    if (el.getClientRects == undefined)
                        return;
                    var rects = el.getClientRects();
                    for (var i = 0; i < rects.length; i++) { translatorMenuWidth += parseInt(rects[i].width) + 5; }
                });
                elTranslatorMenu.style.width = translatorMenuWidth + 'px';
            }
            loadScript("./Scripts/Translator/lang/" + getLanguageCode() + ".js", function () {
                
                translatorSend.elTranslator.querySelector("#translateYanrexRef").innerHTML = lang.translatorDlg.yanrexRef;//Translated by the "Yandex.Translator" service
            });
            loadScript("./Scripts/Translator/TranslatorSend/lang/" + getLanguageCode() + ".js", function () {
                translatorSend.elTranslator.querySelector("#default").title = lang.translatorSendDlg.defaultLanguages;//Select default languages for translation
                translatorSend.elTranslator.querySelector("#translateDown").title = lang.translatorSendDlg.translateDown;//Translate to the down line of input
                document.getElementById("translateUp").title = lang.translatorSendDlg.translateUp;//Translate to the up line of input
                
                translatorSend.selectLanguageSource.title = lang.translatorSendDlg.selectLanguage;//Select a language for translation
                translatorSend.selectLanguageTo.title = lang.translatorSendDlg.selectLanguage;//Select a language for translation
                translatorSend.elText.placeholder = lang.translatorSendDlg.typeText//Type text for translation
                    + lang.translatorSendDlg.pressButton// and press ↓ button
                translatorSend.elTranslator.querySelector("#translateSwapLanguages").title = lang.translatorSendDlg.swapLanguages;//Swap languages
            });
            loadScript("./Scripts/Translator/TranslatorBase.js", function () {
                translatorSend.translatorBase = new TranslatorBase(translatorSend);
                translatorSend.translatorBase.getLangs();
                translatorSend.isTranslate = true;

                //неправильно выбираются языки для перевода в translatorSend после обновления страницы
                //translatorSend.translatorBase.cookie.set();
            });
            this.elTranslator.translatorCreated = true;
        }

        var translatorDisplay,
            elTranslatorMenu = document.getElementById('translatorMenu');
        if (this.elTranslator.style.display == 'none') {
            translatorDisplay = 'block';
            if (this.selectLanguageTo.options.length != 0) this.selectLanguageTo.setWidth();
        } else {
            translatorDisplay = 'none';
            elTranslatorMenu.style.width = '0px';
        }
        this.elTranslator.style.display = translatorDisplay;

        //speechRecognition button
        if (JSON.parse(get_cookie('speechRecognition')).recognition) {
            var elSpeechRecognitionTranslate = this.elTranslator.querySelector("#speechRecognitionTranslate");
            elSpeechRecognitionTranslate.style.width = elSpeechRecognitionTranslate.scrollWidth + 'px';
        }

        if (translatorSend.translatorBase != undefined) {
            translatorSend.isTranslate = this.elTranslator.style.display == 'none' ? false : true;
            translatorSend.translatorBase.cookie.set();
        }
        onresize();
    },
    onclickTranslateDown: function (event) {
        var text = translatorSend.elText.value;
        if (text == '') {
            inputKeyFilter.TextAdd(lang.translatorSendDlg.typeText//Type text for translation
                , translatorSend.elText, "downarrowdivred");
            translatorSend.elText.focus();
            return;
        }
        loadScript("./Scripts/Translator/TranslatorBase.js", function () {
            if (translatorSend.translatorBase == undefined) translatorSend.translatorBase = new TranslatorBase(translatorSend);
            translatorSend.translatorBase.translate(text, function (response) {
                CKEDITOR.instances.editor.setData(translatorSend.translatorBase.getText(response));
            });
        });
    },
    onclickTranslateUp: function (event) {
        var text = CKEDITOR.instances.editor.getData();
        if (text == '') {
            var elCke_editor = document.getElementById('cke_editor');
            inputKeyFilter.TextAdd(lang.translatorSendDlg.typeText//Type text for translation
                , elCke_editor, "downarrowdivred");
            elCke_editor.focus();
            return;
        }
        loadScript("./Scripts/Translator/TranslatorBase.js", function () {
            if (translatorSend.translatorBase == undefined) translatorSend.translatorBase = new TranslatorBase(translatorSend);
            translatorSend.translatorBase.translate(text, function (response) {
                translatorSend.elText.value = translatorSend.translatorBase.getText(response);
            }, true);
        });
    },
}
