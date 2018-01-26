/**
 * IRC Private page functions. Instead of IRCChannel.js file
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
 *  2017-06-9, :  
 *       + init.
 *
 */
function unloadIRCPage() { }
function createElementRoom(channel, tagName) {

    //добавить себя в список просетителей приватной комнаты
    AddUser(g_user);
    displayUsersCount();

    return g_IRC.createUser({ nickname: g_chatRoom.RoomName }, channel.resize, channel.tagName, channel.parentElement);
}
function getTitle(IRCChannel, IRCPrivateMessages) {
    if (IRCPrivateMessages != '')
        JSON.parse(IRCPrivateMessages).forEach(function (message) {
            broadcastMessage({ nickname: IRCChannel }, '<p>' + message + '<p>');
        });
    return lang.privateWith + IRCChannel;//'Private with '
}
g_IRC.UserInChannel = function (options){}
g_IRC.isJoinedChannel = function (WhoIsResponse, Nick) { }
g_IRC.UserMessageRecieved = function (receiver, sender, message) { g_IRC.onChannelMessageRecieved(receiver, sender, message); }
g_IRC.goToPageName = function (receiver) { return '&Private=' + encodeURIComponent(receiver); }
function fTRoomName() { return g_user.nickname; }
//Отрпавляем запрост на все открытые FileTransfer уже после того как открывается веб страница IRC канала.
function onChannelPageReady() { $.connection.chatHub.server.ircSendFileRequest(g_user.nickname, g_user.id); }
