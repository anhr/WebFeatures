/**
 * Base of translator
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
 *  2018-01-2e, :  
 *       + init.
 *
 */
function TranslatorBase(translator) {
//    this.translator = translator;
    var YandexApiKey = 'trnsl.1.1.20180121T052241Z.57bbae4e088d2eb8.349b799f5ac824ec2742d237b8f606499cf3923a';
    this.getLangs = function () {
        //consoleLog('translatorBase.getLangs()');
        //Получение списка поддерживаемых языков. Яндекс API Переводчика https://tech.yandex.ru/translate/doc/dg/reference/getLangs-docpage/
        //
        // key: trnsl.1.1.20180121T052241Z.57bbae4e088d2eb8.349b799f5ac824ec2742d237b8f606499cf3923a
        // https://translate.yandex.ru/developers/keys
        //
        var request = new myRequest();
        request.url = 'https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=' + YandexApiKey + '&ui=' + getLanguageCode();
//        request.translator = this.translator;
        request.XMLHttpRequestStart(function () {//onreadystatechange
            request.ProcessReqChange(function (myRequest) {//processStatus200
                if (myRequest.processStatus200Error())
                    return;
                //                translator.selectLanguageSource = translator.elTranslator.querySelector('#translateLanguageSource');
                //                translator.selectLanguageTo = translator.elTranslator.querySelector('#translateLanguageTo');
                var response = JSON.parse(myRequest.req.responseText);

                //sort
                var tmpAry = new Array();/*,
                    languageCodeSource = translator.cookie.getLCSource(),
                    languageCodeTo = translator.cookie.getLCTo();*/
                for (var languageCode in response.langs) {
                    var i = tmpAry.length;
                    tmpAry[i] = new Array();
                    tmpAry[i][0] = response.langs[languageCode];
                    tmpAry[i][1] = languageCode;
                }
                tmpAry.sort();
                var languageCodeSource = translator.translatorBase.cookie.getLCSource(),
                    languageCodeTo = translator.translatorBase.cookie.getLCTo();
                tmpAry.forEach(function (item) {

                    //remove brackets. Example: from "Шотландский (гэльский)" to "Шотландский "
                    var index = item[0].indexOf('(');
                    var languageCode = item[1],
                        language = (index == -1 ? item[0] : item[0].substring(0, index)) + ' (' + languageCode + ')';

                    //Source
                    var option = document.createElement('option');
                    option.textContent = language;
                    option.languageCode = languageCode;
                    translator.selectLanguageSource.appendChild(option);
                    if (languageCode == languageCodeSource)
                        translator.selectLanguageSource.selectedIndex = translator.selectLanguageSource.options.length - 1;

                    //To
//                    if (translator.selectLanguageTo != undefined) {
                        option = document.createElement('option');
                        option.textContent = language;
                        option.languageCode = languageCode;
                        translator.selectLanguageTo.appendChild(option);
                        if (languageCode == languageCodeTo)
                            translator.selectLanguageTo.selectedIndex = translator.selectLanguageSource.options.length - 1;
//                    }
                });
                if (translator.selectLanguageTo.setWidth != undefined) translator.selectLanguageTo.setWidth();
            });
        });
    }
    this.cookie = {
            set: function () {
                SetCookie(translator.translator, JSON.stringify({
                    translator: translator.isTranslate == undefined ? true : translator.isTranslate,//elTranslateIncomingMessages.checked,
                    LCSource: translator.selectLanguageSource.options.length == 0 ? undefined
                        : translator.selectLanguageSource.options[translator.selectLanguageSource.selectedIndex].languageCode,
                    LCTo: translator.selectLanguageTo == undefined ? undefined
                        : translator.selectLanguageTo.options.length == 0 ? undefined
                            : translator.selectLanguageTo.options[translator.selectLanguageTo.selectedIndex].languageCode,
                }));
            },
            get: function () {
                var cookie = get_cookie(translator.translator);
                if (cookie == '')
                    return cookie;//for edge
                return JSON.parse(cookie);
            },
            isTranslator: function () {
                var translator = this.get().translator;
                if (translator == undefined)
                    return true;//default is translate
                return translator;
            },
            getLCSource: function () {
                var LCSource = this.get().LCSource;
                if (LCSource == undefined)
                    return translator.defaultSource;//en//default is English
                return LCSource;
            },
            getLCTo: function () {
                var LCTo = this.get().LCTo;
                if (LCTo == undefined)
                    return translator.defaultTo;//default is browser's page language
                return LCTo;
            },
    };
    this.onchangeLanguage = function (event) {
        var el = getElementFromEvent(event);
        consoleLog('TranslatorBase.onchangeLanguage() id: ' + el.id + ' languageCode: ' + el.options[el.selectedIndex].languageCode);
        this.cookie.set();
    }
    this.onclickSwapLanguage = function (event) {
        consoleLog('TranslatorBase.onclickSwapLanguage');
        var selectedIndex = translator.selectLanguageSource.selectedIndex;
        translator.selectLanguageSource.selectedIndex = translator.selectLanguageTo.selectedIndex;
        translator.selectLanguageTo.selectedIndex = selectedIndex;
        this.cookie.set();
    }
    this.onclickDefault = function (event) {
        consoleLog('TranslatorBase.onclickDefault');
        function selectDefault(selectLanguage, languageCode) {
if (selectLanguage == undefined) return;
            var selectedIndex = 0;
            for (index in selectLanguage.options) {
                var option = selectLanguage.options[index];
                if (option.languageCode == languageCode) {
                    selectedIndex = option.index;
                    break;
                }
            };
            selectLanguage.selectedIndex = selectedIndex;
        }
        selectDefault(translator.selectLanguageSource, translator.defaultSource);
        selectDefault(translator.selectLanguageTo, translator.defaultTo);//getLanguageCode());
        this.cookie.set();
    }
    this.error = 0;
    this.getText = function (response) {
        var text = '';
        response.text.forEach(function (item) {
            text += item;
        });
        return text;
    }
    this.translate = function (text, callback, reverse//, elMessage
        ) {
        if ((this.error != 0) || ((this.elTranslateIncomingMessages != undefined) && !this.elTranslateIncomingMessages.checked))
            return;

        //inner text from elements
        var el = document.createElement('div');
        el.innerHTML = text;
        text = el.innerText;
        consoleLog('TranslatorBase.translate(' + text + ')');

        //Яндекс API Переводчика https://tech.yandex.ru/translate/
        //
        // key: trnsl.1.1.20180121T052241Z.57bbae4e088d2eb8.349b799f5ac824ec2742d237b8f606499cf3923a
        // https://translate.yandex.ru/developers/keys
        //
        var request = new myRequest(),
            langCode1 = (this.selectLanguageSource == undefined ?
                      this.cookie.getLCSource()//translatorDlg is not created
                    : this.selectLanguageSource.options[this.selectLanguageSource.selectedIndex].languageCode),
            langCode2 = (this.selectLanguageTo == undefined ?
                      this.cookie.getLCTo()//translatorDlg is not created
                    : this.selectLanguageTo.options[this.selectLanguageTo.selectedIndex].languageCode),
            langCodes = reverse ? langCode2 + '-' + langCode1 : langCode1 + '-' + langCode2;
        request.url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=' + YandexApiKey
            + '&lang=' + langCodes//en-ru
            + '&text=' + encodeURIComponent(text);
//        request.elMessage = elMessage;
        request.callback = callback;
        request.XMLHttpRequestStart(function () {//onreadystatechange
            var response = request.req.responseText == '' ? '' : JSON.parse(request.req.responseText);
            if ((request.req.status == 400) || (request.req.status == 403)) {
                //                var message;
                if (response != '') {
                    switch (response.code) {
                        case 401://Неправильный API-ключ
                            //                        message = lang.translatorDlg.invalidKey;//Invalid Yandex Translator API key.
                            break;
                        case 402://API-ключ заблокирован
                            break;
                        case 404://Превышено суточное ограничение на объем переведенного текста
                            if (translator.elTranslateIncomingMessages == undefined)
                                translator.error = response.code;
                            else translator.elTranslateIncomingMessages.checked = false;
                            break;
                    }
                }

                ErrorMessage('Yandex.Translator request failed!\n request.url: ' + request.url + '\n request.response:' + request.req.responseText);
                return;
            }
            request.ProcessReqChange(function (myRequest) {//processStatus200
                if (myRequest.processStatus200Error())
                    return;
/*
                var text = '';
                response.text.forEach(function (item) {
                    text += item;
                });
*/
                switch (response.code) {
                    case 200://Операция выполнена успешно
                        myRequest.callback(response);
/*
                        var elTranslation = document.createElement('div');
                        elTranslation.innerHTML = '[' + response.lang + '] ' + text;

                        var boSrolling = forScrolling();

                        myRequest.elMessage.appendChild(elTranslation);

                        if (boSrolling)
                            elTranslation.scrollIntoView();
*/
                        return;
                }
                //                MessageElement(message);
            });
        }
//        , false//Synchronous mode
        );
    }
}
