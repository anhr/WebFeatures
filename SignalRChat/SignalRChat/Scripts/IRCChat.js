/**
 * IRC Chat functions. Instead of SignalRChat.js file
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
 *  2017-04-15, :  
 *       + init.
 *
 */

function IRChatTest() {
    if (document.querySelector('head').querySelector('#Scripts\\/SignalRChat\\.js') == null)
        return;
    consoleError('IRCChat.js is not compatible with SignalRChat.js');
}
IRChatTest();
function init() {
    loadScript("lang/IRC/" + getLanguageCode() + ".js", function () {
        openIRCPage(new QueryString());
    });
}
function init2() {
}
function editorKey(keyCode) { }
function isIgnore(id) { return false;}
function createElementUser(user, id, boSaveUser, roomName, resize, parentElement) { return g_IRC.createUser(user, resize, null, parentElement); }
function createElementMyUser(resize, parentElement) { return createElementUser(g_user, null, null, null, resize, parentElement); }
function documentTitlePrefix() { return 'IRC ' + g_IRC.getServerName() + (g_chatRoom.isPrivate() ? lang.strPrivate + ' ' : '') }//private
function getElementBefore(elementBefore) {
    if (typeof elementBefore == 'undefined')
        return null;
    return elementBefore;
}
function onUpdateRoom(room, strRoomNamePrev) {}
function onRemoveRoom(roomName) { }
function newUserConnected(user, usersCount, ConnectionIDBefore, roomName) { }
function unloadPage() {
    consoleLog('unloadPage() IRCChat.js g_chatRoom.IRCchannel.isKicked = ' + g_chatRoom.IRCchannel.isKicked);
    if (g_chatRoom.IRCchannel.isKicked)
        return;
    unloadIRCPage();
}
function AddMessageQuitIRCUser(message) {
    AddMessageToChat(message.User.Nick + '[' + message.User.Hostmask + '] ' + lang.IRCquit + ': ' + message.Reason);//'has quit IRC'
}
function editorWidth() { }
function getUserElUser(elUser) {
    var params = elUser.querySelector('.treeView').params;
    if (params == undefined) {
        consoleDebug('params == undefined');
        return null;
    }
    return params.branch.User;
}
