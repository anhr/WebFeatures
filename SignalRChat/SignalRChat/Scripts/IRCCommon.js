/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
 * Common functions for IRC.js and \Chat\Scripts\IRC.js
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
 *  2017-06-29, : 
 *       + init.
 *
 */

function IRCInitCommon() {
    consoleLog('IRCInitCommon()');
    g_IRC.connected = false;//соединение с IRC сервером
    g_IRC.сonnectionComplete = false;//успешное соединение с IRC сервером
//    g_IRC.getErrorTag = function (message) { return '<FONT style="color: red;">' + message + '</FONT>' }
    g_IRC.MessageError = function (message) { g_IRC.MessageError2(getErrorTag(lang.IRCConnectFailed + stringToSpecialEntities(message))); }
    g_IRC.onNickInUse = function (e) {
        consoleLog('IRC.onNickInUse(' + e + ')');
        var message = e.InvalidNick + '. ' + lang.nickInUse;//Nickname is already in use. Please quit from another IRC client if this is your nick name or choice another nick.
//        g_IRC.elIRCConnectResponse.innerHTML = getErrorTag(message);
        g_IRC.NickInUse(message);
//        g_IRC.Reply(message);
    }
    g_IRC.Disconnect = function () {
        if (!g_IRC.connected) {
            consoleError('g_IRC.Disconnect() failed! g_IRC.connected = ' + g_IRC.connected);
            return;
        }
        consoleLog('IRC.Disconnect()');
        $.connection.chatHub.server.ircDisconnect();
        g_IRC.elIRCConnectResponse.innerHTML = getWaitIconBase();
    }
    g_IRC.onConnect = function (e) {
        consoleLog('IRC.onConnect(' + (typeof e.Message == 'undefined' ? '' : e.Message.RawMessage) + ')');
        if (e != '') {
            //consoleError('Connect to IRC failed!');
            var message = "";
            if (typeof e.Error != 'undefined') {
                message = e.Error.Message;
                if (e.Error.InnerExceptions != undefined) for (var i = 0; i < e.Error.InnerExceptions.length; i++)
                    message += ' ' + e.Error.InnerExceptions[i].Message;
            } else if (typeof e.Command != 'undefined') {
                if (typeof e.InvalidNick != 'undefined') {
                    message += ' ' + lang.nickname + ': ' + e.InvalidNick;
                } else consoleError("e.InvalidNick: " + e.InvalidNick);
                if (typeof e.Message != 'undefined') {
                    message += ' ' + e.Message;
                } else consoleError("e.Message: " + e.Message);
            } else if (typeof e.Message != 'undefined') {//":verne.freenode.net 461 bonalink USER :Not enough parameters"
                if (typeof e.Message.RawMessage != 'undefined') {
                    switch (parseInt(e.Message.Command)) {
                        case 451://ERR_NOTREGISTERED ":You have not registered" - Returned by the server to indicate that the client must be registered before the server will allow it to be parsed in detail.
                            message = lang.notRegistered//You have not registered.
                            break;
                        case 470://ERR_LINKCHANNEL automatically redirected to another channel. or ERR_KICKEDFROMCHAN
                            g_IRC.Reply(e.Message.RawMessage);
                            document.querySelectorAll('.IRCJoin').forEach(function (elIRCJoin) {
                                var IRCChannelName = elIRCJoin.querySelector('.IRCChannelName').value;
                                if (IRCChannelName[0] != '#')
                                    IRCChannelName = '#' + IRCChannelName;
                                if (IRCChannelName == e.Message.Parameters[1]) {
                                    elIRCJoin.parentElement.removeChild(elIRCJoin);
                                    return;
                                }
                            });
                            g_IRC.redirectedToAnotherChannel(e.Message);
                            return;
                        case 441://ERR_USERNOTINCHANNEL	RFC1459	<nick> <channel> :<reason>	Returned by the server to indicate that the target user of the command is not on the given channel
                            g_IRC.UserInChannel({ nickname: e.Message.Parameters[1], RawMessage: e.Message.RawMessage });
                        default:
                            message = e.Message.Command;//e.Message.RawMessage;
                            for (var item in e.Message.Parameters)
                                message += ' ' + (item == '2' ? ':' : '') + e.Message.Parameters[item];
                    }
                    g_IRC.onErrorMessage(e);
                } else consoleError("e.Message.RawMessage: " + e.Message.RawMessage);
            } else if ((typeof e.SocketError != 'undefined') && (e.SocketError == 0)) {//SocketError.Success успешное соединение с сервером
                g_IRC.connected = true;
                g_IRC.IRCDisabled();
                return;
            } else message = JSON.stringify(e);
            if ((typeof g_IRC.channelResponse != 'undefined') && (typeof e.Message != 'undefined') && (typeof e.Message.Parameters != 'undefined'))
                g_IRC.channelResponse(e.Message.Parameters[1], getErrorTag(lang.IRCConnectFailed + " " + message));
            g_IRC.MessageError(message);
            return;
        }
        g_IRC.ConnectSuccess();
    }
}