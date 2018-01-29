/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
 * Common functions for SignalR  and IRC chats
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
 *  2017-4-7, : 
 *       + init.
 *
 */

function SignalRorIRCChatInit() {

    //messagesHeader
    document.getElementById("eraseMessages").title = lang.eraseMessages;//Erase all messages
    myTreeView.createTree(
        document.getElementById("messagesHeader"),
        [
            {
                name: lang.helpHeader + ' ',//Help
                id: 'help',
                branch: function () {
                    var el = document.createElement("div");
                    el.innerHTML = lang.helpContent.replace('%helpSignalR', isHelpContentSignalR() ? lang.helpContentSignalR : '');
                    /*
                        <!-- /Yandex.Metrika counter -->
                        <!--
                        <script type="text/javascript" src="//yandex.st/share/share.js"
                                charset="utf-8"></script>
                        <div class="yashare-auto-init" data-yashareL10n="ru" style="border: 0px; padding: 0px 0px;"
                                data-yashareType="none" data-yashareQuickServices="facebook,twitter,lj,friendfeed,gplus,vkontakte,odnoklassniki"></div>
                        -->
                    */
                    return el;
                },
                tagName: "span",
//                remember: 'help',
//                title: "inline-element",
//                animate: true,
            },
            {
                name: lang.speech + ' ',//Speech
                id: 'speechBranch',
                branch: function () {
                    var el = document.createElement("div");
                    el.className = 'gradient_gray';
                    el.id = 'speech';
                    el.innerHTML = getSynchronousResponse('Scripts/Speech/Speech.html');
                    loadScript("Scripts/Speech/Speech.js", function () { speech.init(); });
                    return el;
                },
                tagName: "span",
                remember: 'Speech',
            },
            {
                name: lang.translator + ' ',//Translator
                id: 'speechTranslator',
                branch: function () {
                    var el = document.createElement("div");
                    el.className = 'gradient_gray';
                    el.id = 'translator';
                    el.innerHTML = getSynchronousResponse('Scripts/Translator/Translator.html');
                    loadScript("Scripts/Translator/Translator.js", function () { translator.init(); });
                    return el;
                },
                tagName: "span",
                remember: 'Translator',
            },
        ]
    );

    //help
    var openHelp = 'openHelp';
    if (get_cookie(openHelp, 'true') == 'true')
        myTreeView.onclickBranch(document.getElementById('help').querySelector('.treeView'));//Open help once
    SetCookie(openHelp, 'false');

    /* See displayChatBody() in D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\SignalRChat\ckeditor\samples\js\sample.js
    //Speech
    var openSpeech = 'openSpeech';
    if (get_cookie(openSpeech, 'true') == 'true')
        myTreeView.onclickBranch(document.getElementById('speechBranch').querySelector('.treeView'));//Open speech dialog once
    SetCookie(openSpeech, 'false');
    var cookieSpeech = get_cookie('speech');
    if ((cookieSpeech == '')//по умолчанию Speech загружается
        || (JSON.parse(cookieSpeech).speech == true))
        loadScript("Scripts/Speech/Speech.js", function () { speech.synth.cancel(); });
    */

    //SpeechRecognition
    document.getElementById('speechRecognitionSetupButton').title = lang.speechRecognitionSetup;//Speech recognition setup
    document.getElementById('speechRecognitionButton').title = lang.speechRecognition;//Speech Recognition
    if (isSpeechRecognition('SR')) {
        var elSpeechRecognition = document.getElementById('speechRecognitionButton');
        elSpeechRecognition.style.width = elSpeechRecognition.scrollWidth + 'px';
        /*это делаю в translatorSend.init() потому что тут еще не создан элемент translatorSend
        var elSpeechRecognitionTranslate = document.getElementById('speechRecognitionTranslate');
        elSpeechRecognitionTranslate.style.width = elSpeechRecognitionTranslate.scrollWidth + 'px';
        */
    }

    //Translator
    document.getElementById('translatorButton').title = lang.translator;//Translator
    var openTranslator = 'openTranslator'; 
    if (get_cookie(openTranslator, 'true') == 'true')
        myTreeView.onclickBranch(document.getElementById('speechTranslator').querySelector('.treeView'));//Open Translator dialog once
    SetCookie(openTranslator, 'false');
    var cookieTranslator = get_cookie('translator');
    if ((cookieTranslator == '')//по умолчанию Translator загружается
        || (JSON.parse(cookieTranslator).translator == true))
        loadScript("Scripts/Translator/Translator.js");

    //Translator send
    var openTranslatorSend = 'openTranslatorSend';
    if (get_cookie(openTranslatorSend, 'true') == 'true') {
        onClickTranslatorButton();//Open Translator send dialog once
        SetCookie(openTranslatorSend, 'false');
    } else {
        var cookieTranslatorSend = get_cookie('translatorSend');
        if ((cookieTranslatorSend == '')//по умолчанию TranslatorSend загружается
            || (JSON.parse(cookieTranslatorSend).translator == true)) {
            onClickTranslatorButton();
            //        loadScript("Scripts/Translator/TranslatorSend/TranslatorSend.js", function () { translatorSend.init(); });
        }
    }

    //menu
    var elMenuUsers = document.getElementById("menuUsers");
    if (elMenuUsers) {
        //    elMenuUsers.innerHTML = '⁝ ' + lang.menu;//Menu☰
        document.getElementById("sendFileText").innerHTML = lang.sendFile;//Send File
        document.getElementById("sendFilePictureText").innerHTML = lang.sendPicture;//Send Picture
        document.getElementById("sendFileVideoText").innerHTML = lang.sendVideo;//Send Video
        document.getElementById("sendFileAudioText").innerHTML = lang.sendAudio;//Send Audio
//        document.getElementById("sendExitText").innerHTML = lang.exit;//Exit
    }

    //video cameras list
    var videosHeader = document.getElementById("videosHeader");
    if (videosHeader) {
        videosHeader.innerHTML = lang.videos;//Videocameras
        videosHeader.title = lang.videosTitle;//List of video broadcasts
        document.getElementById("noVideos").innerHTML = lang.noVideos;//No video broadcasts
    }

    //Microphone list
    var microphoneHeader = document.getElementById("microphoneHeader");
    microphoneHeader.innerHTML = lang.microphones;//Microphones
    microphoneHeader.title = lang.microphonesTitle;//List of microphone broadcasts
    document.getElementById("noMicrophones").innerHTML = lang.noMicrophones;//No microphone broadcasts

    setUsersWidth();
}
SignalRorIRCChatInit();
function isSpeechRecognition(speechRecognition) {
    var cookieSpeechRecognition = get_cookie('speechRecognition');
    var res = (cookieSpeechRecognition == '')//checkbox в диалоге SpeechRecognition еще не нажималася. Значит по умолчанию надо показать кнопку распознавания звука
                || (JSON.parse(cookieSpeechRecognition).recognition == true);//птичка в checkbox в диалоге SpeechRecognition
/*
    var res = (get_cookie(speechRecognition, 'true') == 'true')//При первом открытии страницы всегда появляется кнопка speechRecognition
            || (
                (cookieSpeechRecognition != '')//checkbox в диалоге SpeechRecognition уже нажималася
                && (JSON.parse(cookieSpeechRecognition).recognition == true)//птичка в checkbox в диалоге SpeechRecognition
                );
    SetCookie(speechRecognition, 'false');
*/
    return res;
}
function onclickEraseMessages(event) { document.getElementById('messages').innerHTML = ''; }
function getToolbar() { return document.getElementById("cke_1_top"); }
function getToolbars() { return CKEDITOR.instances.editor.toolbox.toolbars; }
function isToolbarHide() {
    //The getElementsByClassName is not compatible with IE5
    //return document.getElementsByClassName("cke_toolbar")[0].style.display == "none";
    return document.getElementById(getToolbars()[0].id).style.display == "none";
}
function getVideoBlock(videoID) { return document.getElementById(getVideoBlockID(videoID)); }
function getMicrophoneBlock(microphoneID) { return document.getElementById(getMicrophoneBlockID(microphoneID)); }
function getCameraBlock(videoID) { return getVideoBlock(getCameraID(videoID)); }
function getScreenBlock(videoID) { return getVideoBlock(getScreenID(videoID)); }
function getMediaBlockID(mediaID) { return mediaID + "Block"; }
function getVideoBlockID(videoID) {
    if ((videoID.indexOf('Camera') == -1) && (videoID.indexOf('Screen') == -1) && (videoID.indexOf('Microphone') == -1) && (videoID.indexOf('SendFile') == -1)) {
        consoleError('getVideoBlockID(' + videoID + ') failed!');
    }
    return getMediaBlockID(videoID);
}
function getMicrophoneBlockID(microphoneID) {
    if ((microphoneID.indexOf('Camera') == -1) && (microphoneID.indexOf('Screen') == -1) && (microphoneID.indexOf('Microphone') == -1)) {
        consoleError('getMicrophoneBlockID(' + microphoneID + ') failed!');
    }
    return getMediaBlockID(microphoneID);
}
function getCameraID(videoID) {
    if (videoID.length != 36) {
        consoleError('getCameraID(' + videoID + ') failed! videoID.length = ' + videoID.length);
        return;
    }
    return videoID + 'sendCamera';//'Camera';
}
function getMicrophoneID(microphoneID) {
    if (microphoneID.length != 36) {
        consoleError('getMicrophoneID(' + microphoneID + ') failed! microphoneID.length = ' + microphoneID.length);
        return;
    }
    return microphoneID + 'sendMicrophone';//'Microphone';
}
function getScreenID(videoID) {
    if (videoID.length != 36) {
        consoleError('getScreenID(' + videoID + ') failed! videoID.length = ' + videoID.length);
        return;
    }
    return videoID + "Screen";
}
function getSessionId() { return Math.floor((Math.random() * 900000) + 100000).toString() }
function isCameraID(videoID) { return videoID.indexOf('Camera') != -1; }
function isMicrophoneID(microphoneID) { return microphoneID.indexOf('Microphone') != -1; }
function isScreenID(videoID) { return videoID.indexOf('Screen') != -1; }
function getAudioFromContainer(elementContainer) {
    var elementAudio = elementContainer.querySelector('audio');
    if (!elementAudio) {
        var elementMicrophone = getMicrophoneBlock(elementContainer.id.replace('Container', ''));
        if ((typeof elementMicrophone.addMedia != "undefined") && elementMicrophone.addMedia.app.useLocalMedia)
            return null;//Не создавать локальный аудиопроигрыватель 
        elementAudio = document.createElement('audio');
        elementContainer.appendChild(elementAudio);
    }
    return elementAudio;
}
function getAudio(audioID) { return getAudioFromContainer(document.getElementById(getContainerID(audioID))); }
function isBroadcastCamera() { return document.getElementById('SendCamera');}
function isBroadcastMicrophone() { return document.getElementById('SendMicrophone');}
function isBroadcastScreen() { return getVideoBlock(getScreenID(g_user.id)) != null;}
function toggleMenuItems() {
    if (isBroadcastCamera()) {
        broadcastVideoText.innerHTML = lang.stopBroadcastVideo;//Video camera off'
    } else {
        broadcastVideoText.innerHTML = lang.broadcastVideo;//"Video camera on";
    }

    if (isBroadcastMicrophone()) {
        broadcastMicrophoneText.innerHTML = lang.stopBroadcastMicrophone;//Microphone off'
    } else {
        broadcastMicrophoneText.innerHTML = lang.broadcastMicrophone;//"Microphone on";
    }
}
function displayWaitElement(element, boDisplay) {
    if (!element)
        return;//иногда сюда попадает когда закрывается трансляция и у нее несколько зрителей
    var display;
    if (boDisplay)
        display = 'block';
    else display = 'none';
    element.style.display = display;
}
function displayWait(elementID, boDisplay) { displayWaitElement(document.getElementById(elementID + "Wait"), boDisplay); }
function download(url, fileName, noRevokeURL) {
    try {
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            consoleLog('window.URL.revokeObjectURL(url)');
            document.body.removeChild(a);
            if (!noRevokeURL)
                window.URL.revokeObjectURL(url);
        }, 10000);//большая задержка нужна для скачивания больших фотографий
    } catch (e) {
        consoleError('download(...) failed! ' + e);
    }
}
function sendBase(callback) {
    //            consoleLog('sendBase()');
    if (!DetectRTC.isWebRTCSupported) {//for Safari
        alert(lang.uncompatibleBrowser.replace("%s", 'DetectRTC.isWebRTCSupported = ' + DetectRTC.isWebRTCSupported));//'Your web browser is not compatible with your web site.\n\n%s\n\n Please use Google Chrome or Mozilla Firefox or Opera web browser.';
        return;
    }
    loadScript("Scripts/WebRTC/FileTransfer.js", function () {
        callback();
    });
}
function sendFileBase(callback) {
    consoleLog('sendFileBase()');
    sendBase(function () {
        loadScript("Scripts/WebRTC/SendFile.js", function () {
            callback();
        });
    });
}
function onclickSendFile() {
    sendFileBase(function () {
        Files();
        new SendFile();
    });
}
function onclickCreateSessionCamera() {
    consoleLog('onclickCreateSessionCamera()');
    if (isBroadcastCamera()) {
        var block = document.getElementById('SendCamera');
        do {
            if (block.fileTransfer) {
                block.fileTransfer.cancel();
                break;
            }
            block = block.parentElement
        } while (block);
        if (!block)
            consoleError('block = ' + block);
    } else sendFileBase(function () { loadScript("Scripts/WebRTC/SendCamera.js", function () { new SendCamera(); }); });
}
function onclickCreateSessionMicrophone() {
    consoleLog('onclickCreateSessionMicrophone()');
    if (isBroadcastMicrophone()) {
        var block = document.getElementById('SendMicrophone');
        do {
            if (block.fileTransfer) {
                block.fileTransfer.cancel();
                break;
            }
            block = block.parentElement
        } while (block);
        if (!block)
            consoleError('block = ' + block);
    } else sendFileBase(function () { loadScript("Scripts/WebRTC/SendMicrophone.js", function () { new SendMicrophone(); }); });
}
function onclickSendPicture() { sendFileBase(function () { new SendPicture(); }); }
function onclickSendVideo() { sendFileBase(function () { new SendVideo(); }); }
function onclickSendAudio() { sendFileBase(function () { new SendAudio(); }); }
function onclickCreateSessionScreen() {
    toggleVideoSession(getScreenID(g_user.id), '🖵 ' + lang.myScreen//'My screen'
            , getSessionId(), true, true);
    closeContextMenuUsers();//for Android Chrome
}
function videosCount() {
    var videosCount = document.getElementsByName("video").length;
    document.getElementById('videos').querySelector('#fileTransfersCount').innerHTML = videosCount;
    return videosCount;
}
function microphonesCount() {
    var microphonesCount = document.getElementsByName("microphone").length;
    document.getElementById("microphonesCount").innerHTML = microphonesCount;
    return microphonesCount;
}
function browserSettings() {
    if (DetectRTC.browser.isChrome) {
        if (DetectRTC.isMobileDevice)
            return '\n\r' + lang.permissionMediaChromeMobile;//'For permission to media devices open the Chrome settings and go to "Site settings"'
        return '\n\r' + lang.permissionMediaChrome;//'For permission to media devices open the Chrome settings and go to Privacy/Content settings'
    }
    if (DetectRTC.browser.isOpera) {
        if (DetectRTC.isMobileDevice)
            return '\n\r' + lang.permissionMediaOperaMobile;//'For permission to media devices open the Opera settings and go to "Website Settings"'
        return '\n\r' + lang.permissionMediaOpera;//'For permission to media devices open the Opera settings and go to Websites'
    }
    if (DetectRTC.browser.isFirefox) {
        return '';//ничего не нашел
    }
    consoleError('browserSettings() faled! Unknown browser');
    return '';
}
function toggleSendMenu() {
    consoleLog('toggleSendMenu()');
    var elSendMenu = document.getElementById('sendMenu'),
        width = 0,
        chevron;
    if (elSendMenu.style.width == 0) {
        elSendMenu.querySelectorAll('span').forEach(function (el) {
            //            width += el.offsetWidth + 5;
            var rects = el.getClientRects();
            for (var i = 0; i < rects.length; i++) { width += parseInt(rects[i].width) + 5; }
            //            el.getClientRects().forEach(function (rect) { width += parseInt(rect.width); });
        });
        width += 'px';
        chevron = '»';
    } else { width = ''; chevron = '«';}
    elSendMenu.style.width = width;
    document.getElementById('chevronButton').innerHTML = chevron;
}
function onClickTranslatorButton() {
    consoleLog("onClickTranslatorButton()");
    var elTranslatorSend = document.getElementById('translatorSend');
    if (elTranslatorSend.innerHTML == '') {
        elTranslatorSend.innerHTML = getWaitIconBase();
        elTranslatorSend.innerHTML = getSynchronousResponse('Scripts/Translator/TranslatorSend/TranslatorSend.html');
    }
    loadScript("Scripts/Translator/TranslatorSend/TranslatorSend.js", function () {
        translatorSend.init(elTranslatorSend, document.getElementById('languageTo'));
    });
}
function onClickSpeechRecognitionSetup() {
    consoleLog("onClickSpeechRecognitionSetup()");
    var elSpeechRecognitionSetup = document.getElementById('speechRecognitionSetup');
    if (elSpeechRecognitionSetup.innerHTML == '') {
        elSpeechRecognitionSetup.innerHTML = getWaitIconBase();
        elSpeechRecognitionSetup.innerHTML = getSynchronousResponse('Scripts/SpeechRecognition/SpeechRecognition.html');
    }
    loadScript("Scripts/SpeechRecognition/SpeechRecognition.js", function () { speechRecognition.init(); });
}
function speechRecognitionToggle(event) {
    consoleLog("speechRecognitionToggle()");
    loadScript("Scripts/SpeechRecognition/SpeechRecognition.js", function () { speechRecognition.toggle(getElementFromEvent(event)); });
}
function getMedia(hints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        navigator.mediaDevices.getUserMedia(hints)
        .then(function (stream) { success(stream); })
        .catch(function (err) { error(err); });
    } else {
        //deprecated. Use navigator.mediaDevices.getUserMedia instead
        //https://developer.mozilla.org/ru/docs/Web/API/Navigator/getUserMedia
        navigator.getMedia = navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.getUserMedia || navigator.mozGetUserMedia;
        if (typeof navigator.getMedia == "undefined")
            consoleError('navigator.getMedia is undefined');
        navigator.getMedia(hints,//{ audio: true, video: true }
            function (stream) { success(stream); },
            function (err) { error(err); }
        );
    }
}
function onClickToolbarButton() {
    
    consoleLog("onClickToolbarButton()");

    if (!isEditorReady()) {
        consoleError("Display tollbar failed! CKeditor is not ready.");
        if (confirm(lang.webPageError))//Internal page error. Do you want reload web page?
            location.reload();
        return;
    }

    var display;
    var toolbarButton = document.getElementById("toolbarButton");
    var toolbarButtonText = document.getElementById("toolbarButtonText");
    if (isToolbarHide()) {
        display = "block";
        toolbarButton.innerHTML = "▽";//http://unicode-table.com/ru/#box-drawing
        toolbarButton.title = closeToolbarTitle();
    } else {
        display = "none";
        toolbarButton.innerHTML = "△";//http://unicode-table.com/ru/#box-drawing
        toolbarButton.title = openToolbarTitle();
    }

    /*
    //Uncompatible with IE5
    var toolbarRows = document.getElementsByClassName("cke_toolbar");
    for(i = 0; i < toolbarRows.length; i++){
        var toolbarRow = toolbarRows[i];
        if(toolbarRow.getAttribute('name') == "Smileys")
            continue;
        toolbarRow.style.display = display;
    }
    */
    var toolbars = getToolbars();
    for (i = 0; i < toolbars.length; i++) {
        var toolbarRow = document.getElementById(toolbars[i].id);
        if (toolbarRow.getAttribute('name') == "Smileys")
            continue;
        toolbarRow.style.display = display;
    }

    onresize();
}
function openContextMenuSend() {

    var contextMenuSend = document.getElementById("contextMenuSend");
    if (contextMenuSend.className.indexOf('openContextMenu') != -1) {
        consoleLog("openContextMenuSend() contextMenuSend.className.indexOf('openContextMenu') == " + contextMenuSend.className.indexOf('openContextMenu'));
        return;
    }
    consoleLog("openContextMenuSend()");
    contextMenuSend.className = contextMenuSend.className.replace(' closeContextMenu', '');
    contextMenuSend.className += " openContextMenu";
    var menuSend = document.getElementById('menuSend')
    var offsetSum = getOffsetSum(menuSend);
    contextMenuSend.style.top = offsetSum.top - contextMenuSend.clientHeight + 'px';
    contextMenuSend.style.left = offsetSum.left - contextMenuSend.clientWidth + menuSend.clientWidth + 'px';
}
function onClickSmilesButton() {
    consoleLog("onClickSmilesButton()");

    if (!isEditorReady()) {
        consoleError("Display the smileys tollbar failed! CKeditor is not ready.");
        return;
    }

    //Get the Smileys toolbar row
    //Uncompatible with IE5
    //var rowSmiles = document.getElementsByName('Smileys')[0];
    var rowSmiles;
    var toolbars = getToolbars();
    for (i = 0; i < toolbars.length; i++) {
        var toolbarRow = document.getElementById(toolbars[i].id);
        if (toolbarRow.getAttribute('name') == "Smileys") {
            rowSmiles = toolbarRow;
            break;
        }
    }
    if (typeof rowSmiles == 'undefined') {
        consoleError("onClickSmilesButton() failed! rowSmiles is undefined");
        return;
    }

    document.getElementById("send").title = lang.sendMessage;//Send a message to the chat

    var smilesButton = document.getElementById("smilesButton");
    var smilesButtonText = document.getElementById("smilesButtonText");
    if (rowSmiles.style.display == "none") {
        rowSmiles.style.display = "block";
        smilesButton.innerHTML = '😞';//☹ https://unicode-table.com/ru/blocks/emoticons/
        smilesButton.title = lang.closeSmilesToolbar;
    } else {
        rowSmiles.style.display = "none";
        smilesButton.innerHTML = '😊';//☺🐯🐱 https://unicode-table.com/ru/blocks/emoticons/
        smilesButton.title = lang.openSmilesToolbar;
    }
    onresize();
}
function onClickSend() {
    consoleLog("onClickSend()");
    try {

        var data;
        var value;
        if (isEditorReady()) {
            data = CKEDITOR.instances.editor.getData();
            if (typeof DOMParser != 'undefined') {
                var parser = new DOMParser()//uncompatible with IE5
                  , doc = parser.parseFromString(data, "text/html");
            }
            value = CKEDITOR.instances.editor.document.getBody().getText();
        } else {
            consoleError("Send data failed! CKeditor is not ready.");
            if (confirm(lang.webPageError))//Internal page error. Do you want reload web page?
                location.reload();
            value = document.getElementById("editor").value;
            data = '<p>' + value + '</p>';
            //value = data;
        }

        //Is mesage empty?
        value = value.replace(/^\s+/, "");//Убрать пробелы в начале строки
        if ((value == "") && (!doc || doc.getElementsByTagName('img').length == 0)) {
            inputKeyFilter.TextAdd(lang.typeMessage//Please type a message
                , document.getElementById("cke_1_contents"), "downarrowdivred");

            if (isEditorReady())
                CKEDITOR.instances.editor.focus();
            else document.getElementById("editor").focus();
            return false;
        }

        // Call the Send method on the hub.
        SendMessage(data, value);

        // Clear text box and reset focus for next comment.
        if (isEditorReady()) {
            CKEDITOR.instances.editor.setData('');
/*
            // Fire "setData" so data manipulation may happen.
            var eventData = { dataValue: '' };
            CKEDITOR.instances.editor._.data = eventData.dataValue;
            CKEDITOR.instances.editor.fire('afterSetData', eventData);
            setTimeout(function () { CKEDITOR.instances.editor.focus(); }, 0);
*/
        } else {
            var editor = document.getElementById("editor");
            editor.value = "";
            editor.focus();
        }

    } catch (e) {
        var message;
        if (typeof e.message == 'undefined')
            message = e;
        else message = e.message;
        ErrorMessage("Send data failed! " + message);
    }
    return true;
}
function forScrolling() {
    var elMessages = document.getElementById('messagesContaner');
    return Math.abs((parseInt(elMessages.scrollTop) + elMessages.clientHeight) - elMessages.scrollHeight) <= 1;
    //consoleLog('parseInt(elMessages.scrollTop) + elMessages.clientHeight) = ' + (parseInt(elMessages.scrollTop) + elMessages.clientHeight) + ' elMessages.scrollHeight = ' + elMessages.scrollHeight);
}
// Add an element to the page.
function AddElement(el, boSrolling) {

    //time
    var elTime = document.createElement("span");
    elTime.innerHTML = '[' + new Date().toLocaleTimeString() + '] ';
    var childNode = el.childNodes[0];
    if (childNode.tagName.toUpperCase() == 'P')
        childNode.insertBefore(elTime, childNode.childNodes[0]);
    else el.insertBefore(elTime, el.childNodes[0]);

    if (boSrolling != true) boSrolling = forScrolling();

    $('#messages').append(el);

    if (boSrolling)
        el.scrollIntoView();

    if (!boBodyFocus)
        beep("../MyIsapi/sounds/din.mp3");
    documentTitle();
}

// Add the message to the page.
function AddMessage(message) {
    var el = document.createElement('div');
    el.innerHTML = message;
    AddElement(el);
}
function getWaitIcon() { return getWaitIconBase(' title="' + lang.WaitingAnswer + '"/'); }//'Waiting for a visitor answer'
function userCorrect(elUser, correct) {
    var elUserName = elUser.querySelector('.name');//'#userName');
    if (correct)
        elUserName.innerHTML = '<s>' + elUserName.innerText + '</s>';
    else elUserName.innerHTML = elUserName.innerText;
}
function onclickIgnore() {
    if (!event) event = window.event;//for IE6
    var target = event.target || event.srcElement;
    consoleLog('onclickIgnore() checked = ' + target.checked);
    var elUser = getElementUser(target);
    var user = getUserFromChatUsers(elUser);
    var display;
    if (target.checked) {
        user.ignore = true;
        display = 'none';
    } else {
        user.ignore = false;
        display = 'block';
    }
    userCorrect(elUser, target.checked);

    //http://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
    //https://mathiasbynens.be/notes/css-escapes
    var users = document.querySelectorAll('#' + CSSescape(user.id));
    for (var i = 0; i < users.length; i++) {
        var ignore = users[i].querySelector(".ignore");
        if (ignore)
            ignore.checked = target.checked;
        if (users[i].parentElement.parentElement.id != "chatusers") {//удалять все записи посетителя кроме посетителя в списке посетителей
            var parentElement = users[i].parentElement.parentElement.parentElement;//.parentElement;
            var elementVisibility;
            if (
                     (parentElement.id.indexOf('Block') != -1)//receive file or picture or video or audio
                )
                elementVisibility = parentElement;
            else {
                parentElement = parentElement.parentElement;
                if (parentElement.id.indexOf('Block') != -1)//camera or microphone
                    elementVisibility = parentElement;
                else elementVisibility = users[i].parentElement.parentElement;//messages
            }
            elementVisibility.style.display = display;
        }
    }
}
function getElementUser(parentElement) {
    while (parentElement && (typeof parentElement.user == 'undefined') && (typeof parentElement.userId == 'undefined'))
        parentElement = parentElement.parentElement;
    return parentElement;
}
function getUserFromChatUsers(elementParent) {
    var user = elementParent.user;
    if (typeof user != 'undefined')
        return user;
    //окно пользователя открывается не в списке посетителей данной комнаты
    //ищем посетителя в списке посетителей комнаты
    var elUser = document.getElementById('chatusers').querySelector('#' + CSSescape(elementParent.id));
    if (elUser)
        return elUser.user;
    alert(lang.userNotFound);//The visitor left the room
    return null;
}
function AddElementUser(user, roomName, boSaveUser) {
    /*срабатывает при передаче сообщения в SignalRChat
        if (typeof roomName == 'undefined')
            consoleError('roomName: ' + roomName);
    
    */
    var userName = user.nickname;
    var id = user.id;

    if ((roomName == g_chatRoom.RoomName) && (g_user.nickname == userName)) {
        if (typeof g_user.id == 'undefined')
            g_user.id = id;
        if (typeof user.browserID != 'undefined')
            g_user.browserID = user.browserID;
        g_user.updateProfile(user);
        var a = createElementMyUser();//tagName);
        if (typeof id != 'undefined')//for IRC
            a.id = id;
        //documentTitle();
        return a;
    }
    return createElementUser(user, id, boSaveUser, roomName);//, tagName);
}
function AddAllUsers(allUsers, roomName) {
    // Добавление всех пользователей
    allUsers.forEach(function (user) {
        if (typeof user.id == 'undefined') {
            consoleError('AddAllUsers(...) failed. ConnectionId is undefined');
            return;
        }
        AddUser(user, '', roomName);
    });
}
var firstMessage = true;//надо делать скроллинг в нижнюю часть окна входящих сообщений когда приходит первое входящее сообщение
// потому что если открыты все диалоги окна входящих сообщений то может получиться что входяшее сообщение не видно
function broadcastMessage(user, message) {
    // Html encode display name and message.
    var el = document.createElement('div');
    el.name = "message";
    el.className = "bmessage";
    el.innerHTML = message;
    var elementMessage = el.childNodes[0];
    elementMessage.insertBefore(document.createTextNode(': '), elementMessage.childNodes[0]);
    var elUser = AddElementUser(user);
    elementMessage.insertBefore(elUser, elementMessage.childNodes[0]);
    if (isIgnore(user.id))
        el.style.display = 'none';
    AddElement(el, firstMessage);
    firstMessage = false;
    if (user.nickname != g_user.nickname){
        if (typeof speech != 'undefined') speech.speak(user.nickname + ' ' + lang.said + '. ' + message, el);//said
//        if (typeof translator != 'undefined') translator.translatorBase.translate(message, el);
        if (typeof translator != 'undefined') translator.translate(message, el);
    }
};

var g_sendingFileStack = [];
function onclickCameraTransfers() {
    onbranchFast('informerCameraTransfers', 'branchCameraTransfers');
    window.resizeVideos();//если не вызвать эту функцию, то медиа элемент не будет виден если в панели посетителей закрыть ветку с медиаэлементами (видеокамеры, микрофоны) и добвить свой медиа элемент
    return false;
};
function onclickMicrophoneTransfers() {
    onbranchFast('informerMicrophoneTransfers', 'branchMicrophoneTransfers');
    window.resizeVideos();//если не вызвать эту функцию, то медиа элемент не будет виден если в панели посетителей закрыть ветку с медиаэлементами (видеокамеры, микрофоны) и добвить свой медиа элемент
    return false;
};

//WaitPermission

function getWaitPermissionSnapshotID(id) { return id + 'WaitPermissionSnapshot'; }
function getWaitPermissionVideoID(id) { return id + 'WaitPermissionVideo'; }
function getWaitPermissionMicrophoneID(id) { return id + 'WaitPermissionMicrophone'; }
function removeWaitPermission(id, waitPermissionId) {
    switch (parseInt(waitPermissionId)) {
        case 1://Snapshot
            $('#' + getWaitPermissionSnapshotID(id)).remove();
            break;
        case 2://camera record
            $('#' + getWaitPermissionVideoID(id)).remove();
            break;
        case 3://microphone record
            $('#' + getWaitPermissionMicrophoneID(id)).remove();
            break;
        default:
            consoleError('removeWaitPermission(' + id + ', ' + waitPermissionId + ') failed!');
    }
    removeInvitations(id);
}
function JSONWaitPermission(waitPermissionID) {
    return JSON.stringify({ toID: g_user.id, waitPermissionId: waitPermissionID });
}
function onWaitPermissionOK(fromID, waitPermissionId) {
    consoleLog('onWaitPermissionOK(' + fromID + ', ' + waitPermissionId + ')');
    $.connection.chatHub.server.waitPermissionOK(fromID, JSONWaitPermission(waitPermissionId));
    removeWaitPermission(fromID, waitPermissionId);
}
function onWaitPermissionDenie(fromID, waitPermissionId) {
    consoleLog("onWaitPermissionDenie(" + fromID + ", " + waitPermissionId + ")");
    $.connection.chatHub.server.waitPermissionDenie(fromID, JSONWaitPermission(waitPermissionId));
    removeWaitPermission(fromID, waitPermissionId);
}
function onWaitPermissionIgnore(fromID, waitPermissionId) {
    consoleLog("onWaitPermissionIgnore(" + fromID + ")");
    $.connection.chatHub.server.waitPermissionIgnore(fromID, JSONWaitPermission(waitPermissionId));
    removeWaitPermission(fromID, waitPermissionId);
}
function setTitle() {
    //consoleLog("setTitle()");
    var chatRoom = g_chatRoom.getRoomName();
    var title = document.getElementById("title");
    title.innerHTML = documentTitlePrefix();// + ' - <a href="../chat/?Nickname=' + encodeURIComponent(g_user.nickname)
    var tagName = "span";
    title.appendChild(createElementRoom({
        RoomName: chatRoom
        , isPrivate: g_chatRoom.PrivateID == '' ? false : true
        , tagName: tagName
        , parentElement: document.getElementById('titleBranchRoom')
        , resize: true
    }));
    var el = document.createElement(tagName);
    el.innerHTML = " - ";
    title.appendChild(el);
    title.appendChild(createElementMyUser(true, document.getElementById('titleBranchUser')));
    documentTitle();
}
function documentTitle() {
    document.title = (boBodyFocus ? "" : "*") + g_chatRoom.getRoomName() + (g_chatRoom.isPrivate() ? ' ' + lang.strPrivate + ' ' : '')
        + ' - ' + g_user.nickname;
}
function disable(isDisable) {
    document.getElementById("editor").disabled = isDisable;
    document.getElementById("send").disabled = isDisable;
    if (!isDisable)
        $('#editor').focus();
}
window.addEventListener("beforeunload", onbeforeunload);
var beforeunloadCount = 0;
function onbeforeunload(e) {
    consoleLog('onbeforeunload() SignalRorIRCChat.js beforeunloadCount = ' + beforeunloadCount);
    if (beforeunloadCount > 0)
        return;//непонятно почему то эта функция иногда вызывается дважды. В результате дважды появляется всплывающее сообщение о том что данные могут быть утеряны
        //Например если произошла ошибка blink2: SignalR error: Error: Send failed.
        //Для теститрвания зайти на канал, отключиться от IRC сервера и попробовать отправить сообщение на канал
    beforeunloadCount++;

    //close file transfer receivers
    var arFileTransfers = document.getElementsByName('fileTransfer');
    for (var i = 0; i < arFileTransfers.length; i++) {
        elFileTransfer = arFileTransfers[i];
        var isFileTransfer = isBranchExpanded(elFileTransfer.querySelector('#branch'));
        consoleLog('FileTransfer: ' + elFileTransfer.innerText + ' is ' + (isFileTransfer ? 'open' : 'close'));
        if (isFileTransfer) getFileTransfer(elFileTransfer.id).receiveFile();//close file transfer
    }
    /* not compatible with edge
    document.getElementsByName('fileTransfer').forEach(function (elFileTransfer) {
        var isFileTransfer = isBranchExpanded(elFileTransfer.querySelector('#branch'));
        consoleLog('FileTransfer: ' + elFileTransfer.innerText + ' is ' + (isFileTransfer ? 'open' : 'close'));
        if (isFileTransfer) getFileTransfer(elFileTransfer.id).receiveFile();//close file transfer
    });
    */

    if (speech != undefined) {
        speech.speechCancel();
        delete speech;
    }

    unloadPage();//IRC part channel
    if (!isIE && (document.getElementById('messages').querySelector('.bmessage') == null))
        return null;
    else {
        var message =  'message';
        e.returnValue = message;
        return message;
    }
}
function sendFilesInfo(userInfo) {
    var fileTransfers = document.getElementsByName('fileTransfer');
    // Не получается сразу отправить всем посетителям комнаты список медиа потоков и файлов
    // потому что в этом случает функция chat.client.onSendFile будет вызываться несколько раз
    // до того, как загрузится файл ReceiveFile.js
    // В результате иногда на все потоки и файлы будут видны на принимающей строне. 
    // Например это случается если очисть кеш и перезагрузить страницу на принимающей строне.
    // Вместо этого вызываю sendFileRequest для всех посетителей комнаты кроме отправителя.
    // по этому запросу у всех посетителей комнаты кроме отправитела вызывается chat.client.onSendFileRequest,
    // которая загружает файл ReceiveFile.js и запрашивает список медиа потоков и файлов при помощи 
    // $.connection.chatHub.server.sendFileStart(userID);
    // и только после этого у отправителя вызывается chat.client.onSendFileStart
    // в которой отправляется список медиа потоков и файлов персонально для каждого получателя
    if (fileTransfers.length > 0)
        sendFileRequest(userInfo);
}
function startHubChat() {
    var chat = $.connection.chatHub;
    chat.client.onGetMicrophoneCount = function (microphoneID) {
        consoleLog('chat.client.onGetMicrophoneCount(microphoneID = ' + microphoneID + ')');
        var microphoneBlock = document.getElementById(getMicrophoneBlockID(microphoneID));
        if (microphoneBlock)
            microphoneBlock.addMedia.app.peer.setPeersCount();
    }
    chat.client.onAddRemoteVideoControl = function (videoID, peerId, connectionId, captureScreen) {
        //                    consoleLog('chat.client.onAddRemoteVideoControl(videoID = ' + videoID + ', connectionId = ' + connectionId + ')');
        if (captureScreen == true) {
            var screenBlock = getScreenBlock(videoID);
            if (screenBlock) {
                screenBlock.addMedia.onAddRemoteVideoControl(videoID, peerId, connectionId);
                return;
            }
        } else {
            var videoBlock = getCameraBlock(videoID);
            if (videoBlock) {
                videoBlock.addMedia.onAddRemoteVideoControl(videoID, peerId, connectionId);
                return;
            }
        }
        consoleError('chat.client.onAddRemoteVideoControl(videoID = ' + videoID + ', peerId = ' + peerId + ', connectionId = ' + connectionId + ', captureScreen = ' + captureScreen + ')');
    }
    chat.client.onAddRemoteVideoControlSucces = function (videoID, peerId, captureScreen) {
        //                    consoleLog('chat.client.onAddRemoteVideoControlSucces(videoID = ' + videoID + ', peerId = ' + peerId + ')');
        var videoBlock;
        if (captureScreen)
            videoBlock = getScreenBlock(videoID);
        else videoBlock = getCameraBlock(videoID);
        videoBlock.addMedia.onAddRemoteVideoControlSucces(peerId);
    }
    chat.client.onSendFile = function (JSONUser, JSONFileTransfer) {
        consoleLog('chat.client.onSendFile(JSONUser: ' + JSONUser + ', JSONFileTransfer: ' + JSONFileTransfer + ')');
        if (JSONUser == null) {
            consoleError('JSONUser: ' + JSONUser);
            return;
        }
        //надо запомнить парамерты в массиве g_sendingFileStack потому что если посетители одновременно делают несколько трансляций
        // и/или отпаравляют несколько файлов, то chat.client.onSendFile вызывается несколько раз подряд
        // еще до того как загрузился файл ReceiveFile.js и поэтому ReceiveFileStart будет вызываться только с последними парамерами JSONUser, JSONFileTransfer
        // В результате при обновлении страницы чата не все файлы и трансляции будут видны
        g_sendingFileStack.push({ user: JSONUser, fileTransfer: JSONFileTransfer });
        loadScript("Scripts/WebRTC/FileTransfer.js", function () { //если тут не загружать FileTransfer.js
            //то поевляется сообщение об ошибке: 
            // ?chatRoom=Chat:1759 Uncaught ReferenceError: ReceiveFileStart is not defined(…)
            // если один посетитель начал трансляцию с камеры и отправляет файл
            // а другой посетитель очистил кеш и обновил страницу
            loadScript("Scripts/WebRTC/ReceiveFile.js", function () {
                //                        ReceiveFileStart(JSONUser, JSONFileTransfer);
                if (typeof ReceiveFileStart != undefined) {
                    //                            consoleDebug('ReceiveFileStart = ' + ReceiveFileStart);
                    while (g_sendingFileStack.length > 0) {
                        var sendingFile = g_sendingFileStack.pop();
                        ReceiveFileStart(sendingFile.user, sendingFile.fileTransfer);
                    }
                }
            });
        });
    }
    chat.client.onSendFileRequest = function (userID) {
        consoleLog('chat.client.onSendFileRequest(userID = ' + userID + ')');
        loadScript("Scripts/WebRTC/FileTransfer.js", function () {
            loadScript("Scripts/WebRTC/ReceiveFile.js", function () {
                $.connection.chatHub.server.sendFileStart(userID, g_user.id);
            });
        });
    }
    chat.client.onSendFileStart = function (userIDReceiver) {
        consoleLog('chat.client.onSendFileStart(userIDReceiver : ' + userIDReceiver + ')');
        var fileTransfers = document.getElementsByName('fileTransfer');
        for (i = 0; i < fileTransfers.length; i++) {
            var fileTransfer = fileTransfers[i];
            if (
                (typeof fileTransfer.fileTransfer == 'undefined')
                || (typeof fileTransfer.fileTransfer.sendFile == 'undefined')
                || (
                    (typeof fileTransfer.fileTransfer.loadedmetadata != 'undefined')//'это видеокамера
                        && (fileTransfer.fileTransfer.loadedmetadata == false)//видеокамера еще не открылась
                    )
                )
                continue;
            $.connection.chatHub.server.sendFileToUser(JSON.stringify(deleteg_IRCuser())
                , JSON.stringify(fileTransfer.fileTransfer.sendFileBase()), userIDReceiver);
        }
    }
    chat.client.onfileTransferCancel = function (fileTransferID) {
        consoleLog('chat.client.onfileTransferCancel(fileTransferID: ' + fileTransferID + ')');
        var elementFileTransfer = document.getElementById(fileTransferID + "Block");
        if (elementFileTransfer)
            elementFileTransfer.fileTransfer.cancel();
        else consoleError('elementFileTransfer = ' + elementFileTransfer);
    }
    chat.client.onRestartLocalMedia = function (videoID, restart) {
        consoleLog('chat.client.onRestartLocalMedia(' + videoID + ', ' + restart + ')');
        getVideoBlock(videoID).restartLocalMedia = restart;
    }
    chat.client.onPeersCount = function (mediaID, peersCount) {
        var block = getVideoBlock(mediaID);
        if (block == null)
            return;//сюда иногда  попадает когда отправитель перезапустил трансляцию во время смены камеры или микрофона
        var element = block.querySelector('#PeersCount');
        if (!element)
            return;//Во время отправки файла не отображается количество получателей
        consoleLog('chat.client.onPeersCount(mediaID = ' + mediaID + ', PeersCount = ' + peersCount + ')');
        element.innerHTML = peersCount;
    }
    chat.client.onWaitPermission = function (waitPermissionDataJSON) {
        consoleLog('chat.client.onWaitPermission("' + waitPermissionDataJSON + '")');
        var waitPermissionMessage = JSON.parse(waitPermissionDataJSON);

        var permissionID, cookieName;
        switch (waitPermissionMessage.id) {
            case 1://Snapshot
                permissionID = getWaitPermissionSnapshotID(waitPermissionMessage.from.id);
                cookieName = 'AllowSnapshot';
                break;
            case 2://Camera record
                permissionID = getWaitPermissionVideoID(waitPermissionMessage.from.id);
                cookieName = 'AllowSnapshot';
                break;
            case 3://Microphone record
                permissionID = getWaitPermissionMicrophoneID(waitPermissionMessage.from.id);
                cookieName = 'AllowMicrophoneRecord';
                break;
            default: consoleError('waitPermissionMessage.id = ' + waitPermissionMessage.id);
        }
        var allow = get_cookie(cookieName, 'ask');
        if (allow == 'true') {
            $.connection.chatHub.server.waitPermissionOK(JSON.parse(waitPermissionDataJSON).from.id, JSONWaitPermission(waitPermissionMessage.id));
            return;
        }

        if (allow == 'false') {
            $.connection.chatHub.server.waitPermissionDenie(JSON.parse(waitPermissionDataJSON).from.id, JSONWaitPermission(waitPermissionMessage.id));
            return;
        }
        if (!document.getElementById(permissionID)) {

            //new invitation

            document.getElementById("noInvitations").style.display = 'none';
            document.getElementById("invitations").style.display = 'block';
            onbranch('informerInvitations', 'branchInvitations', true);

            var permissionText;
            switch (waitPermissionMessage.id) {
                case 1: permissionText = lang.waitSnapshotPermissionFrom; break;//'<span id="user"></span> viewer awaits permission to take a snapshot from your camera.'
                case 2: permissionText = lang.waitVideoRecordPermissionFrom; break;//'<span id="user"></span> viewer awaits permission for start of the video recording from your camera.'
                case 3: permissionText = lang.waitMicrophoneRecordPermissionFrom; break;//'<span id="user"></span> listener awaits permission for start of the audio recording from your microphone.'
                default: {
                    consoleError('chat.client.onWaitPermission("' + waitPermissionDataJSON + '") failed! waitPermissionMessage.id = ' + waitPermissionMessage.id);
                    return;
                }
            }

            var ignoreTitle, allowAllTitle, denyAllTitle, mediaName;
            switch (waitPermissionMessage.id) {
                case 1: //Snapshot
                case 2: //Camera record
                    ignoreTitle = lang.ignoreTitle;//Ignore of this viewer
                    allowAllTitle = lang.allowAllViewersTitle;//Allow all viewers to take snapshot and video recording from my video camera
                    denyAllTitle = lang.denyAllViewersTitle;//Deny all viewers to take a snapshot and video recording from your video camera
                    mediaName = 'Camera';
                    break;
                case 3://Microphone record
                    ignoreTitle = lang.ignoreListenerTitle;//Ignore of this listener
                    allowAllTitle = lang.allowAllListenersTitle;//Allow all listeners to record sound from my microphone
                    denyAllTitle = lang.denyAllListenersTitle;//Deny all listeners to record sound from my microphone
                    mediaName = 'Microphone';
                    break;
                default: {
                    consoleError('chat.client.onWaitPermission("' + waitPermissionDataJSON + '") failed! waitPermissionMessage.id = ' + waitPermissionMessage.id);
                    return;
                }
            }

            $("#informerInvitations").append(
                  '<div id=' + permissionID + ' name="waitPermission" class="gradient" style="padding:5px; margin-top:5px; overflow:auto;">'
                + ' <b>' + permissionText + '</b>'
                + ' <div>'
                + '<input type="button" onclick="javascript: return onWaitPermissionOK(\'' + waitPermissionMessage.from.id + '\', \'' + waitPermissionMessage.id + '\')" style="margin-top:5px;" value="' + lang.allow + '" />'//Allow
                + '<input type="button" onclick="javascript: return onWaitPermissionDenie(\'' + waitPermissionMessage.from.id + '\', \'' + waitPermissionMessage.id + '\')" style="margin-top:5px;" value="' + lang.denie + '" />'//Denie
                + '<input type="button" onclick="javascript: return onWaitPermissionIgnore(\'' + waitPermissionMessage.from.id + '\', \'' + waitPermissionMessage.id + '\')" style="margin-top:5px;"'
                + ' value="' + lang.ignore + '"'//Ignore
                + ' title="' + ignoreTitle + '" />'
                + '<input type="button" onclick="javascript: return onWaitPermissionOKAll(\'' + waitPermissionMessage.from.id + '\', \'' + waitPermissionMessage.id + '\')" style="margin-top:5px;"'
                + ' value="' + lang.allowAll + '"'//Allow All
                + ' title="' + allowAllTitle + '" />'
                + '<input type="button" onclick="javascript: return onWaitPermissionDenieAll(\'' + waitPermissionMessage.from.id + '\', \'' + waitPermissionMessage.id + '\')" style="margin-top:5px;"'
                + ' value="' + lang.denyAll + '"'//Deny All
                + ' title="' + denyAllTitle + '" />'
                + ' </div>'
                + '</div>'
            );
            document.getElementById(permissionID).mediaName = mediaName;
            document.getElementById('informerInvitations').querySelector('#user').appendChild(AddElementUser(waitPermissionMessage.from, g_chatRoom.RoomName));
            invitationsCount();
        }
        beep("../MyIsapi/sounds/knockKnock.mp3");
    }
    chat.client.onWaitPermissionOK = function (toJSON) { window.media.onWaitPermissionOK(toJSON); }
    chat.client.onWaitPermissionDenie = function (toJSON) { window.media.onWaitPermissionDenie(toJSON); }
    chat.client.onWaitPermissionIgnore = function (toJSON) { window.media.onWaitPermissionIgnore(toJSON); }
    chat.client.onInvite = function (invitationDataJSON) { onInvite(invitationDataJSON); }
    chat.client.onInvitationStart = function (invitationDataJSON) { onInvitationStart(invitationDataJSON); }
    chat.client.onInviteOK = function (invitationDataJSON) { onInviteOK(invitationDataJSON); }
    chat.client.onInviteReject = function (invitationDataJSON) { onInviteReject(invitationDataJSON); }
    chat.client.onInviteIgnore = function (invitationDataJSON) { onInviteIgnore(invitationDataJSON); }
    chat.client.onRoomUsers = function (roomName, allUsers) {
        consoleLog("chat.client.onRoomUsers(" + roomName + ", allUsers)");
        AddAllUsers(allUsers, roomName);
    }
    chat.client.onPeerSend2 = function (mediaID, JSONData) {
        if (typeof onPeerSend == 'undefined')
            loadScript("Scripts/WebRTC/Peer.js", function () {
                if (!peer.onPeerSend(mediaID, JSONData)) {
                    var message = JSON.parse(JSONData);
                    $.connection.chatHub.server.noPeerBlock(message.user.id, mediaID);
                }
            });
        else onPeerSend(mediaID, JSONData);
    }
    chat.client.onNoPeerBlock = function (mediaID) {
//        consoleLog('onNoPeerBlock(' + mediaID + ')');
        var elMedia = document.getElementById(getMediaBlockID(mediaID));
        elMedia.querySelector('#wait').style.display = 'none';
        elMedia.querySelector('#Message').innerHTML = getErrorTag(lang.transferNotAvailable);//Transfer is not available. Probably, the sender canceled his transfer.
    }
}
function displayUsersCount(usersCount) {
    document.getElementById("usersCount").innerHTML = usersCount == undefined ? document.getElementById('chatusers').childNodes.length : usersCount;
}
startHubChat();
