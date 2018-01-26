/**
 * Translator
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
 *  2018-01-20, :  
 *       + init.
 *
 */
translator = {
    translator: 'translator',
    defaultSource: 'en',
    defaultTo: getLanguageCode(),
    init: function () {
        consoleLog('translator.init()');
        this.elTranslator = document.getElementById('translator');
        this.elTranslator.querySelector("#translatorClose").title = lang.close;//Close
        this.elTranslator.querySelector("#translateDefault").value = lang.defaultString;//Default
        this.elTranslateIncomingMessages = this.elTranslator.querySelector('#checkboxTranslateIncomingMessages'); 
        loadScript("./Scripts/Translator/lang/" + getLanguageCode() + ".js", function () {
            translator.elTranslator.querySelector("#translateYanrexRef").innerHTML = lang.translatorDlg.yanrexRef;//Translated by the "Yandex.Translator" service
            translator.elTranslator.querySelector("#translateIncomingMessages").innerHTML = lang.translatorDlg.translatorHeader;//Translate of all incoming messages
            translator.elTranslator.querySelector("#translateLanguageSourceLabel").innerHTML = lang.translatorDlg.languageSource + ': ';//Translate from
            translator.elTranslator.querySelector("#translateLanguageToLabel").innerHTML = lang.translatorDlg.languageTo + ': ';//To
            translator.elTranslator.querySelector("#translateSwapLanguages").title = lang.translatorDlg.swapLanguages;//Swap languages
        }); 
        this.selectLanguageSource = this.elTranslator.querySelector('#translateLanguageSource');
        this.selectLanguageTo = this.elTranslator.querySelector('#translateLanguageTo');
        loadScript("./Scripts/Translator/TranslatorBase.js", function () {
            translator.translatorBase = new TranslatorBase(translator);
            translator.translatorBase.getLangs();
            if (translator.translatorBase.cookie.isTranslator()) {
                translator.elTranslateIncomingMessages.checked = true;
                translator.toggleTranslate();
            }
        });
    },
    onclickTranslateIncomingMessages: function (event) {
        var el = getElementFromEvent(event);
        consoleLog('translator.onclickTranslateIncomingMessages() checked = ' + el.checked);
        this.toggleTranslate();
        this.isTranslate = this.elTranslateIncomingMessages.checked;
        this.translatorBase.cookie.set();
        this.error = 0;
    },
    toggleTranslate: function () {
        var elTranslatorSettings = this.elTranslator.querySelector('#translatorSettings'),
            expanded = 'expanded';
        if (
            (this.elTranslateIncomingMessages.checked && elTranslatorSettings.classList.contains(expanded))
            || (!this.elTranslateIncomingMessages.checked && !elTranslatorSettings.classList.contains(expanded))
            )
            consoleError('translator.toggleTranslate error');
        elTranslatorSettings.classList.toggle(expanded);
    },
    translate: function (text, elMessage) {
        loadScript("./Scripts/Translator/TranslatorBase.js", function () {
            if (translator.translatorBase == undefined) translator.translatorBase = new TranslatorBase(translator);
            translator.translatorBase.translate(text, function (response) {
                var elTranslation = document.createElement('div');
                elTranslation.innerHTML = '[' + response.lang + '] ' + translator.translatorBase.getText(response);;

                var boSrolling = forScrolling();

                elMessage.appendChild(elTranslation);

                if (boSrolling)
                    elTranslation.scrollIntoView();
            });
        });
    },
}
