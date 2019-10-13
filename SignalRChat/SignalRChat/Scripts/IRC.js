/**
 * Connect to IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
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
 *  2016-12-31, : 
 *       + init.
 *
 */

loadCSS('../SignalRChat/Scripts/IRC.css');//Абсолютный путь нужен для проекта IRCBot

function IRC() {
    loadScript("../SignalRChat/Scripts/IRCCommon.js", function () {//Абсолютный путь нужен для проекта IRCBot
        IRCInitCommon();
    });
    //
    //mircToHtml() by PennyBreed @ irc.nuphrax.com
    //http://hawkee.com/snippet/10164/
    // Control Codes https://www.mirc.com/help/html/index.html?control_codes.html
    // IRC String Formatting https://github.com/myano/jenni/wiki/IRC-String-Formatting
    //----------------------------------------------
    this.mircToHtml = function (text, removeControlCodes) {
        /*
        //for debugging
        //Замена спец символов на читаемую строку
        var debugMessage = text;
        var code;
        for (var i = debugMessage.length - 1; i >= 0; i--) {
            switch (debugMessage.charCodeAt(i)) {
                case 2://bold
                    code = '{b}';
                    break;
                case 3://color
                    code = '{c}';
                    break;
                case 31://underline
                    code = '{u}';
                    break;
                case 15://returns your text back to plain black
                    code = '{r}';
                    break;
                default:
                    continue;
            }
            debugMessage = debugMessage.substring(0, i) + code + debugMessage.substring(i + 1, debugMessage.length);
        }
        consoleDebug(debugMessage);
        */

        //control codes
        //Если я буду учитывать только две цифры в коде цвета {2}, то будут проблемы в выводе топиков каналов.
        // Кроме того в некоторых топиках нет завершающего символа в блоке текста, выделенного цветом, если блок в конце строки
        var rex = /\003([0-9]{1,2})([,])?([0-9]{1,2})?([^\003]+)/,
            matches, colors;
        if (rex.test(text)) {
            while (cp = rex.exec(text)) {
                var value;
                if (cp[2]) {
                    var cbg = cp[3];
                    value = cp[4];
                }
                else value = (cp[3] == undefined ? '' : cp[3]) + cp[4];
                var text1 = text.replace(cp[0], removeControlCodes ?
                    cp[4] : '<span class="fg' + parseInt(cp[1]) + (cbg == undefined ? '' : ' bg' + parseInt(cbg)) + '">' + value + '</span>');
                if (text1 == text) {
                    consoleError('Invalid control codes');
                    break;
                }
                text = text1;
            }
        }
        //bold,italics,underline
        var bui = [
            [/\002([^\002]+)(\002)?/, [removeControlCodes ? "" : "<b>", removeControlCodes ? "" : "</b>"]],
            [/\037([^\037]+)(\037)?/, [removeControlCodes ? "" : "<u>", removeControlCodes ? "" : "</u>"]],
            [/\035([^\035]+)(\035)?/, [removeControlCodes ? "" : "<i>", removeControlCodes ? "" : "</i>"]]
        ];
        for (var i = 0; i < bui.length; i++) {
            var bc = bui[i][0];
            var style = bui[i][1];
            if (bc.test(text)) {
                while (bmatch = bc.exec(text)) {
                    var text = text.replace(bmatch[0], style[0] + bmatch[1] + style[1]);
                }
            }
        }
        var text = text.replace(/\003/g, '');
        text = text.replace(/\017/g, '');
        return text;
    }
    this.Reply = function (message, element) {

        //not compatible with:
        //"NOTICE [illuminata!illuminata@2600:3c03::f03c:91ff:fee5:bf7e]: VERSION HexChat 2.12.4 / Linux 4.13.0-17-lowlatency [x86_64/3.50GHz/SMP] via ZNC 1.6.5+deb1 - http://znc.in"
        // For testing go to (irc.freenode.net) ▶##video and see VERSION of the user
        // Не успел проверить потому что забанили
        //var ar = message.match(/([A-Z]+) ([^:]*): (.*)/);//"NOTICE [anhr!kvirc@95.188.70.66]: TIME Mon Oct 30 05:17:02 2017"


        //not compatible with:
        //"NOTICE [blink2!User@95.188.70.1Q75=]: CLIENTINFO Web IRC client - Bonalink  https://localhost/Chat/?tab=IRC  - Supported tags: PING,VERSION,CLIENTINFO,TIME,SOURCE"
        // ar[2] = "[blink2!User@95.188.70.1Q75=]: CLIENTINFO Web IRC client - Bonalink  https://localhost/Chat/?tab=IRC  - Supported tags"
        //Ловится : после Supported tags
        // For testing see CLIENTINFO of meself
        //var ar = message.match(/([A-Z]+) (.*): (.*)/);

        var ar = message.match(/([A-Z]+) (\[.*\]): (.*)/);
        if (
                (ar != null)
                && (ar.length == 4)
                && (ar[1] == "NOTICE")
            ) {//message = "NOTICE [anhr!kvirc@95.188.70.66]: TIME Mon Oct 30 05:17:02 2017"
            if (
                    (ar[3][0] == String.fromCharCode(1))
                    && (ar[3][ar[3].length - 1] == String.fromCharCode(1))
                ) {//CTCP
                /*сейчас CTCP выводится в this.ReplyCTCP... Смотри следующие функции ниже
                var arMsg = ar[3].substr(1, ar[3].length - 2).match(/([A-Z]+) (.*)/),//TIME Mon Oct 30 05:17:02 2017
                    nick = ar[2].match(/\[(.*)!(.*)\]/)[1];//[anhr!kvirc@95.188.70.66]
                if ((nick == undefined) || (nick == null))
                    consoleError('IRC.Reply(' + message + ') nick: ' + nick);
                project.getElIRCServer().querySelectorAll('.IRCuser').forEach(function (elUser) {
                    var user = getUserElUser(elUser);
                    if (user.nickname == nick) {
                        var parentElement = elUser.querySelector('.treeView').params.branch.parentElement;//пользователь в заголовке веб страницы
                        if (parentElement == undefined)
                            parentElement = elUser;
                        var command = arMsg[1].toUpperCase();
                        function CTCPReply(back) {
                            var elCTCP = parentElement.querySelector('.CTCP_' + command),
                                reply = back();
                            if (elCTCP != null)
                                elCTCP.innerHTML = reply;
                            project.CTCPReply(user.ServerHostname, user.nickname, command, reply);
                        }
                        switch (command) {
                            case 'PING':
                                CTCPReply(function () { return ((timeStampInMs() - arMsg[2]) / 1000) + ' ' + lang.sec; });
                                break;
                            case 'VERSION':
                            case 'TIME':
                            case 'CLIENTINFO'://http://www.irchelp.org/protocol/ctcpspec.html?
                            case 'SOURCE'://http://www.irchelp.org/protocol/ctcpspec.html?
                                CTCPReply(function () { return arMsg[2]; });
                                break;
//                            case 'AVATAR'://http://www.kvirc.ru/wiki/HOWTO:%D0%90%D0%B2%D0%B0%D1%82%D0%B0%D1%80%D1%8B_%D0%B2_KVirc
//                                break;
//                            case 'DCC'://https://en.wikipedia.org/wiki/Direct_Client-to-Client
                                //пересылка файлов, чат напрямую минуя IRC сервер
//                                break;
//                            case 'FINGER'://http://www.irchelp.org/protocol/ctcpspec.html?
                                //не реагирую потому что в данный момент не могу получть мое реальное имя потому что отсутствует g_user.IRCuser на веб странице IRCSever
//                                break;
//                            case 'USERINFO'://KVIrc возвращет: Age=8; Gender=Male; Location=Russia; Languages=Russian, English; I'm too lazy to edit this field.
//                                break;
                        }
                    }
                });
                */
                return;
            } else {
                switch (g_IRC.help) {
                    case 'ns':
                        g_IRC.NSSyntax(ar[3]);
                        break;
                    case 'cs':
                        g_IRC.CS.syntax(ar[3]);
                        break;
                }
            }
        }
        if ((ar != null) && (ar.length >= 2) && !this.isReply(ar[1]))
            return;//NOTICE to channel or private web page
        if (typeof element == 'undefined')
            element = 'p';
        elMessage = document.createElement(element);
        var elMessages = project.getElementMessages();//document.getElementById('messages');

        //буквы одинаковой ширины. <pre> нужен для того что бы не пропадали идущие подряд пробелы
        elMessage.innerHTML = '<pre style="margin:0;"><FONT style="font-family:monospace;font-size:'
            + window.getComputedStyle(elMessages, null).getPropertyValue('font-size') + '"></FONT></pre>';
        $(elMessage.querySelector('font')).html(this.mircToHtml(message));

        elMessages.appendChild(elMessage);
        //если вызвать эту функцию то на веб странице IRC канала заголовок страницы поднимется вверх если открыть свойства этого канала в заголовке страницы
        elMessage.scrollIntoView();
    }

    // CTCP reply
    // See https://en.wikipedia.org/wiki/Client-to-client_protocol for details
    this.ReplyCTCP = function (command, message, nick) {
        if (nick == undefined)
            consoleError('IRC.ReplyCTCPversion(' + message + ') nick: ' + nick);
        project.getElIRCServer().querySelectorAll('.IRCuser').forEach(function (elUser) {
            var user = getUserElUser(elUser);
            if (user.nickname == nick) {
                var parentElement = elUser.querySelector('.treeView').params.branch.parentElement;//пользователь в заголовке веб страницы
                if (parentElement == undefined)
                    parentElement = elUser;
                function CTCPReply(back) {
                    var elCTCP = parentElement.querySelector('.CTCP_' + command),
                        reply = back();
                    if (elCTCP != null)
                        elCTCP.innerHTML = reply;
                    project.CTCPReply(user.ServerHostname, user.nickname, command, reply);
                }
                switch (command) {
                    case 'PING':
                        CTCPReply(function () { return ((timeStampInMs() - message) / 1000) + ' ' + lang.sec; });
                        break;
                    case 'VERSION':
                    case 'TIME':
                    case 'CLIENTINFO'://http://www.irchelp.org/protocol/ctcpspec.html?
                    case 'SOURCE'://http://www.irchelp.org/protocol/ctcpspec.html?
                        CTCPReply(function () { return message; });
                        break;
//                            case 'AVATAR'://http://www.kvirc.ru/wiki/HOWTO:%D0%90%D0%B2%D0%B0%D1%82%D0%B0%D1%80%D1%8B_%D0%B2_KVirc
//                                break;
//                            case 'DCC'://https://en.wikipedia.org/wiki/Direct_Client-to-Client
//пересылка файлов, чат напрямую минуя IRC сервер
//                                break;
//                            case 'FINGER'://http://www.irchelp.org/protocol/ctcpspec.html?
//не реагирую потому что в данный момент не могу получть мое реальное имя потому что отсутствует g_user.IRCuser на веб странице IRCSever
//                                break;
//                            case 'USERINFO'://KVIrc возвращет: Age=8; Gender=Male; Location=Russia; Languages=Russian, English; I'm too lazy to edit this field.
//                                break;
                }
            }
        });
    }
    this.getCTCP = function (message, sender) {
        // Client-to-client protocol  (CTCP)
        //https://en.wikipedia.org/wiki/Client-to-client_protocol
        //http://www.irchelp.org/protocol/ctcpspec.html?
        if ((message.length > 0) && (message.charCodeAt(0) == 1) && (message.charCodeAt(message.length - 1) == 1)) {
            var IRCclient = ' Web IRC client - Bonalink  ' + window.location.protocol + '//' + window.location.hostname + '/Chat/?tab=IRC';
            var reply;
            var message2 = message.substr(1, message.length - 2).toUpperCase();
            switch (message2) {
                case 'VERSION':
                    reply = IRCclient + '  Browser - ' + DetectRTC.browser.name + ' ' + DetectRTC.browser.version
                        + '. UTC - ' + DetectRTC.osName + ' ' + DetectRTC.osVersion
                        + (DetectRTC.isMobileDevice ? ' mobile device' : ' desktop');
                    break;
                case 'TIME':
                    reply = ' ' + new Date();
                    break;
                case 'CLIENTINFO'://http://www.irchelp.org/protocol/ctcpspec.html?
                    reply = IRCclient + '  - Supported tags: PING,VERSION,CLIENTINFO,TIME,SOURCE';
                    break;
                case 'SOURCE'://http://www.irchelp.org/protocol/ctcpspec.html?
                    reply = IRCclient;
                    break;
                    /*
                case 'AVATAR'://http://www.kvirc.ru/wiki/HOWTO:%D0%90%D0%B2%D0%B0%D1%82%D0%B0%D1%80%D1%8B_%D0%B2_KVirc
                    break;
                case 'DCC'://https://en.wikipedia.org/wiki/Direct_Client-to-Client
                    //пересылка файлов, чат напрямую минуя IRC сервер
                    break;
                case 'FINGER'://http://www.irchelp.org/protocol/ctcpspec.html?
                    //не реагирую потому что в данный момент не могу получть мое реальное имя потому что отсутствует g_user.IRCuser на веб странице IRCSever
                    break;
                case 'USERINFO'://KVIrc возвращет: Age=8; Gender=Male; Location=Russia; Languages=Russian, English; I'm too lazy to edit this field.
                    break;
                    */
            }
            if (reply == undefined) {
                var ping = 'PING';
                if (message2.indexOf(ping) == 0) reply = '';
            }
            if (reply != undefined) {
                project.get(sender, 'NOTICE ' + sender + ' :' + message[0] + message2 + reply + message[0]);
                return true;
            }
            consoleError('CTCP: ' + message);
        }
        return false;
    }
    this.clearReply = function () {
        consoleLog('IRC.clearReply()');
        var elIRCReplies = document.getElementById("IRCReplies");
        for (var i = elIRCReplies.childNodes.length; i--; i >= 0) {
            var childNode = elIRCReplies.childNodes[i];
            if (childNode.id != 'IRCClearReply')
                elIRCReplies.removeChild(childNode);
        }
    }
    this.onMessage = function (e) {
        consoleLog('IRC.onMessage(' + e + ')');
        AddMessageToChat(e.Message.Parameters[2] + '. ' + lang.reload.replace('%s', e.Message.Parameters[1]));//Please reloat this web page for joining to "%s" channel again
    }
    this.sort = function (a, b, ChannelModes) {
        var prefixA = '';
        var prefixB = '';
        if (typeof ChannelModes != 'undefined') {
            prefixA = ChannelModes[a.Nick];
            if (typeof prefixA == 'undefined')
                prefixA = '';
            prefixB = ChannelModes[b.Nick];
            if (typeof prefixB == 'undefined')
                prefixB = '';
            if ((prefixA != '') && (prefixB == ''))
                return -1;//пользователя с пефиксом выше пользователя без префикса
            if ((prefixB != '') && (prefixA == ''))
                return 1;//пользователя без пефикса выше пользователя с префиксом
        }
        if ((prefixA + a.Nick).localeCompare(prefixB + b.Nick) > 0)
            return 1;
        return -1;
    }
    this.onIsOpenPrivate = function (Nick) {
        consoleLog('IRC.onIsOpenPrivate(' + Nick + ')');
        AddUser({ nickname: Nick });
        AddMessageToChat('', { nickname: Nick }, ' ' + lang.joined);//has joined
    }
    this.onIsClosePrivate = function (Nick) {
        this.onUserPartedChannel(g_chatRoom.RoomName, Nick);
    }
    this.MessageError2 = function (message) {
        if (typeof this.elIRCConnectResponse != 'undefined')
            this.elIRCConnectResponse.innerHTML = message;
        IRCMessageError(message);
    }
    this.onMessageError = function (e) {
        consoleLog('IRC.onMessageError(' + e + ')');
        this.MessageError(e.Error.Message);
    }
    this.NickInUse = function (message) {
        if (typeof this.elIRCConnectResponse != 'undefined')
            this.elIRCConnectResponse.innerHTML = getErrorTag(message);
        this.Reply(message);
    }
    this.onTopic = function (message) {
        consoleLog('IRC.onTopic(' + message + ')');
        this.channelEvent(message.Message.Parameters[0], function (IRCChannel) {
            var elTopic = IRCChannel.querySelector('.topic');
            IRCChannel.querySelector('.wait').innerHTML = '';
            //Если не делать эту проверку, то сообщение о том, что тема слишком длинная промелькет слишком быстро
            //потому что событие this.onTopicTooLong происходит раньше чем this.onTopic
            if (!this.TopicTooLong)
                inputKeyFilter.TextAdd(lang.topicUpdated//'Channel\'s topic was updated'
                    , elTopic, "uparrowdivgreen", true);
            this.TopicTooLong = false;
            var topic = message.Message.Parameters[1];
            if (typeof elTopic.value == 'undefined')
                elTopic.innerHTML = topic;
            else elTopic.value = topic;
            elTopic.myData.valueOld = topic;
        });
        this.CSTopic(message);
    }
    this.TopicTooLong = false;
    this.onTopicTooLong = function (channel, MaxTopicLength) {
        consoleLog('IRC.onTopicTooLong(MaxTopicLength = ' + MaxTopicLength + ')');
        this.channelEvent(channel, function (IRCChannel) {
            this.TopicTooLong = true;
            var elTopic = IRCChannel.querySelector('.topic');
            IRCChannel.querySelector('.wait').innerHTML = '';
            inputKeyFilter.TextAdd(lang.topicTooLong + MaxTopicLength//'Channel\'s topic too long. Max topic length is '
                , elTopic, "downarrowdivred", true);
        });
    }
    this.onclickUpdateTopic = function () {
        consoleLog('IRC.onclickUpdateTopic()');
        if (!event) event = window.event;
        var el = event.target || event.srcElement;
        var elParent = el.parentElement;
        var elTopic = elParent.querySelector('.topic');
        if (elTopic.myData.valueOld == elTopic.value) {
            inputKeyFilter.TextAdd(lang.changeTopic//'Change the channel's topic first'
                , elTopic);
            return;
        }
        elParent.querySelector('.wait').innerHTML = getWaitIconBase();
        $.connection.chatHub.server.ircSetTopic(elTopic.myData.a == null ? elTopic.myData.channelName : elTopic.myData.a.params.channel, elTopic.value);
    }
    this.channelEvent = function (channelName, callback) {
        document.querySelectorAll('.IRCChannel').forEach(function (IRCChannel) {
            if (IRCChannel.querySelector('.channelName').innerText == channelName)
                callback(IRCChannel);
        });
    }
    this.createUserWhoIs = function (options, nick, prefix) {
        var elUser = g_IRC.createUser({ nickname: nick, prefix: prefix }
            , null, 'div');
        elUser.className = "userWhoIs"; //'userWhoIs' for adding of new user into vistors of channel of joined channels of IRCWhois dialog of user
        if (options.elInsertBebore != undefined)
            options.elInsertBebore.parentElement.insertBefore(elUser, options.elInsertBebore);
        else options.elUsers.appendChild(elUser);
    }
    this.onChannelTopicReceived = function (JSONmessage, ChannelModes) {
        var message = JSONmessage;//JSON.parse(JSONmessage);
        consoleLog('IRC.onChannelTopicReceived(' + message.Topic + ')');

        //не вызывается когда на канале нет топика. Как результат не редактиоуется диалог IRCJoin после присоединения пользователя к каналу
        //$.connection.chatHub.server.ircIsJoined(message.Channel.Name);

        var isCnannelOperator = false;
        var channelMode = ChannelModes[g_user.nickname];
        if ((typeof channelMode != 'undefined') && (channelMode.indexOf('@') != -1))
            isCnannelOperator =  true;
        var elCol2;
        var topicClass = ' class="topic"';
        if (isCnannelOperator) {
            elCol2 = '<input' + topicClass + ' value="' + message.Topic + '" style="width:97%" />'
                + '<input type="button" onclick="javascript: g_IRC.onclickUpdateTopic()" value="' + lang.update + '" />'//Update
                + '<span class="wait"></span>'
        } else elCol2 = '<span' + topicClass + '>' + g_IRC.mircToHtml(message.Topic) + '</span>';
        this.channelEvent(message.Channel.Name, function (IRCChannel) {
            var elTable = IRCChannel.querySelector('table');
            elTable.innerHTML = '';
            var elTableRow = g_IRC.elTableRow(lang.topic, elCol2);//Topic
            var elTopic = elTableRow.querySelector('.topic');
            if (elTopic) {
                elTopic.myData = {
                    a: IRCChannel.parentElement.querySelector('.treeView')
                    , channelName: message.Channel.Name
                    , valueOld: message.Topic
                }
            }
            elTable.appendChild(elTableRow);

            if (!IRCChannel.resize) {//see el.resize in function createIRCRoom(channel) {...myTreeView.createBranch(...params.createBranch...)...}
                var Users = message.Channel.Users;
                if (Users.length > 0) {
                    var elUsers = IRCChannel.querySelector('.Users');
                    if (elUsers)
                        elUsers.parentElement.removeChild(elUsers);
                    elUsers = myTreeView.createBranch(
                        {
                            name: lang.users//'Visitors'
                            , params:
                            {
                                createBranch: function () {
                                    var el = document.createElement("div");
                                    el.className = "usersWhoIs"; //for adding of new user into vistors of channel of joined channels of IRCWhois dialog of user
                                    Users.sort(function (a, b) { return g_IRC.sort(a, b, ChannelModes); });
                                    Users.forEach(function (user) { g_IRC.createUserWhoIs({elUsers: el}, user.Nick, ChannelModes[user.Nick]); });
                                    return el;
                                }
                                , ChannelModes: ChannelModes
                                //, scrollIntoView: true
                            }
                        }
                    )
                    elUsers.className = 'Users';
                    IRCChannel.appendChild(elUsers);
                }
            }
            //если вызвать эту функцию то на веб странице IRC канала заголовок страницы поднимется вверх если открыть свойства этого канала в заголовке страницы
            //setTimeout(function () { IRCChannel.scrollIntoView(); }, 0);
        });
    }
    this.tableCells = function (cell1, cell2) {
        var cell2Class = '';
        if (typeof cell2 == "object") {
            cell2Class = ' ' + cell2.className;
            cell2 = cell2.value;
        }
        return '<td class="col"><b style="float:right">' + cell1 + ':</b></td><td class="col' + cell2Class + '">' + cell2 + '</td>'
    }
    this.tableRow = function (cell1, cell2) { return '<tr>' + this.tableCells(cell1, cell2) + '</tr>' }
    this.elTableRow = function (cell1, cell2) {
        var elTr = document.createElement('tr');
        elTr.innerHTML = this.tableCells(cell1, cell2);
        return elTr;
    }
    this.createJoinedChannels = function (elIRCJoinedChannels) {
        if (elIRCJoinedChannels.querySelector('.treeView') != null)
            return null;
        return elIRCJoinedChannels.appendChild(myTreeView.createBranch({
            name: lang.IRCChannels,//'Joined Channels'
            title: lang.IRCChannelsTitle,//'List of channels you have joined'
            treeViewTagName: 'h1',
        }));
    }
    this.appendJoinedChannels = function (elIRCJoinedChannels, WhoIsResponse, treeViewTagName) {
        if (WhoIsResponse.Channels.length == 0) {
            elIRCJoinedChannels.innerHTML = '';
            return;
        }
        var elIRCServers = this.createJoinedChannels(elIRCJoinedChannels);
        if (elIRCServers == null)
            myTreeView.removeAllBranches(elIRCJoinedChannels);
        WhoIsResponse.Channels.sort(function (a, b) {
            if (a.localeCompare(b) > 0)
                return 1;
            return -1;
        });
        WhoIsResponse.Channels.forEach(function (channel) {
            myTreeView.AddNewBranch(elIRCJoinedChannels, {
                branch: function () {
                    return createIRCRoom({
                        RoomName: channel,
                        joined: WhoIsResponse.User.Nick == g_user.nickname ? true : g_IRC.isJoined(channel)
                    });
                }
            });
        });
        /*если тут не открывать список каналов и если елемент пользователь находится в заголовке веб страницы,
        то при открытии списка каналов веб страница не влазит в окно браузера
        if (elIRCServers)
            myTreeView.onclickBranch(elIRCServers.querySelector('.treeView'));
        */
    }
    this.whoIsDlg = function (WhoIsResponse, elWhoisDlg) {
        var elTable = elWhoisDlg.querySelector('table');
        elTable.innerHTML = '';

        function appendItem(key, value, title) {
            var el = document.createElement("tr");
            el.innerHTML = g_IRC.tableCells(key, value);
            if (typeof title != 'undefined')
                el.title = title;
            elTable.appendChild(el);
        }
        appendItem(lang.nick, {
            value: g_user.nickname == WhoIsResponse.User.Nick ?
                '<input class="nickInput" value="' + WhoIsResponse.User.Nick + '" />'
                + '<input type="button" onclick="g_IRC.onclickNick(event)" value="⥀" title="' + lang.update + '">'//🔃
                : WhoIsResponse.User.Nick,
            className: 'nick'
        });//Nick
        appendItem(lang.name, WhoIsResponse.User.User, lang.fullName);//User Name
        appendItem(lang.realName, WhoIsResponse.User.RealName);//'Real Name'
        if (WhoIsResponse.Location != null)
            appendItem(lang.location, WhoIsResponse.Location);//Location
        appendItem(lang.address, WhoIsResponse.User.Hostmask, lang.hostmask);//

        //geolocation
        var elGeolocation = elWhoisDlg.querySelector('#geolocation');
        if (elGeolocation != null)
            elGeolocation.parentElement.removeChild(elGeolocation);
        var arIP = WhoIsResponse.User.Hostmask.match(/.*@([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
        if ((arIP != null) && (arIP.length == 5)) {
            elWhoisDlg.appendChild(myTreeView.createBranch({
                name: lang.geolocationPrompt,//Geolocation
                id: 'geolocation',
                params:
                {
                    createBranch: function () { return g_IRC.geolocation(arIP[1] + '.' + arIP[2] + '.' + arIP[3] + '.' + arIP[4]); }
                }
            }));
        }

        if (WhoIsResponse.SecondsIdle != -1)
            appendItem(lang.IRCSecondsIdle, readableTimestamp(WhoIsResponse.SecondsIdle)// + ' ' + lang.sec
                , lang.IRCSecondsIdleTitle);//Seconds since this user last interacted with IRC
        appendItem(lang.server, WhoIsResponse.Server + ' ' + WhoIsResponse.ServerInfo);//Server
        var userStatus = '';
        if (WhoIsResponse.IrcOp)
            userStatus += lang.IRCOp + ' ';//Is operator.
        if (WhoIsResponse.RegNick)
            userStatus += lang.IRCRegNick + ' ';//Registered nickname.
        if (userStatus != '')
            appendItem(lang.status, userStatus);//'User', lang.IRCOpTitle);//User is a network operator.
        if (WhoIsResponse.LoggedInAs != null)
            appendItem(lang.NSLoggedInAs, WhoIsResponse.LoggedInAs, lang.NSLoggedInAsTitle);//The nickserv account this user is logged into

        //Nick traces
        var NickTracesKeys = Object.keys(WhoIsResponse.NickTraces);
        if (NickTracesKeys.length > 0) {
            var NickTraces = '';
            for (var i = 0; i < NickTracesKeys.length; i++) {
                NickTraces += WhoIsResponse.NickTraces[NickTracesKeys[i]] + '. ';
            }
            appendItem(lang.IRCNickTraces, NickTraces);//Nick traces
        }

        //Actually. Use irc.efnet.org IRC server for testing
        if (WhoIsResponse.Actually != null)
            Object.keys(WhoIsResponse.Actually).forEach(function (item) {
                appendItem(item, WhoIsResponse.Actually[item]);
            });

        //Other
        if (WhoIsResponse.Other != null)
            WhoIsResponse.Other.forEach(function (item) {
                appendItem('', item);
            });

        //channels
        var elChannels = elWhoisDlg.querySelector('.Channels');
        elChannels.innerHTML = '';
        g_IRC.appendJoinedChannels(elChannels, WhoIsResponse);
    }
    this.onWhoIsReceived = function (JSONWhoIsResponse, nick) {
        var WhoIsResponse = JSONWhoIsResponse;
        var Nick;
        if (typeof WhoIsResponse != 'undefined')
            Nick = WhoIsResponse.User.Nick;
        else {
            consoleError('WhoIsResponse: ' + WhoIsResponse);
            return;
        }
        consoleLog('IRC.onWhoIsReceived(' + Nick + ')');

        g_IRC.isJoinedChannel(WhoIsResponse, Nick);

        //если хоть один из elWhoisDlg которые перебираются ниже является дочерним от #IRCJoinedChannels
        //то не надо обновлять список каналов в которых я нахожусь this.joinedChannels(WhoIsResponse);
        //иначе elWhoisDlg который является дочерним от #IRCJoinedChannels закроется и пользователь не сможет посмотреть WhiIs для самого себя
        var boIRCJoinedChannelsChild = false;

        document.querySelectorAll('.IRCWhois').forEach(function (elWhoisDlg) {
            if (typeof nick == 'undefined')
                nick = WhoIsResponse.User.Nick;
            if (nick != elWhoisDlg.nickname)
                return;

            var elIRCJoinedChannels = elWhoisDlg;
            while (elIRCJoinedChannels) {
                elIRCJoinedChannels = elIRCJoinedChannels.parentElement;
                if (elIRCJoinedChannels == null)
                    break;
                if (elIRCJoinedChannels.id == 'IRCJoinedChannels')
                    boIRCJoinedChannelsChild = true;
            }

            g_IRC.whoIsDlg(WhoIsResponse, elWhoisDlg);
            if (WhoIsResponse.User.Nick == g_user.nickname)
                setTimeout(function () { onresize() }, 0);//нужно исправить размеры страницы когда окрывается окно моего пользователя в заголовке страницы)
        });
        if (!boIRCJoinedChannelsChild)
            g_IRC.joinedChannels(WhoIsResponse);
    }
    this.onNickChanged = function (oldNick, newNick, Hostmask) {
        consoleLog('IRC.onNickChanged(oldNick: ' + oldNick + ', newNick: ' + newNick + ')');

        //IRCuser
        var IRCusers = document.querySelectorAll('.IRCuser');
        IRCusers.forEach(function (elIRCuser) {
            var elName = elIRCuser.querySelector('.treeView').querySelector('.name');
            var user = elIRCuser.querySelector('.treeView').params.branch.User;
            if (user.nickname == oldNick) {

                //здесь нельзя редактировать Control и IRCWhois потому что в заголовке веб страницы они не являются дочерними от elIRCuser

                elName.innerText = (typeof user.prefix == 'undefined' ? '' : user.prefix) + newNick;

                //тут нельзя менять потому что если есть несколько elIRCuser одного посетителя
                // то поменяется ник только у первого, потому что у следующих user.nickname != oldNick
                //user.nickname = newNick;

                if (typeof user.IRCuser != 'undefined')
                    user.IRCuser.Nick = newNick;
            }
        });
        var user;
        for (i = 0; i < IRCusers.length; i++) {
            user = IRCusers[i].querySelector('.treeView').params.branch.User;
            if (user.nickname == oldNick) {
                var boDocumentTitle = false;
                if (g_user.nickname == oldNick)
                    boDocumentTitle = true;
                user.nickname = newNick;
                if (boDocumentTitle)
                    documentTitle();
                user.IRCuser.Hostmask = Hostmask;
                break;
            }
        }

        //IRCWhois
        document.querySelectorAll('.IRCWhois').forEach(function (elIRCWhois) {
            if (elIRCWhois.nickname == oldNick) {
                elIRCWhois.nickname = newNick;
                var elNick = elIRCWhois.querySelector('.nick');
                var elNickInput = elNick.querySelector('.nickInput');
                if (elNickInput)
                    elNickInput.value = newNick;
                else elNick.innerText = newNick;
            }
        });

        //Control
        document.querySelectorAll('.Control').forEach(function (elControl) {
            if (elControl.nickname == oldNick) {
                elControl.nickname = newNick;
                var elPrivate = elControl.querySelector('.private');
                elPrivate.href = g_IRC.hrefPrivate(newNick);
                elPrivate.innerHTML = lang.privatePage + newNick;//'Open a private (query) page with '
                elControl.querySelector('.banMask').value = user.IRCuser.Hostmask;
            }
        });
    }
    this.Disconnected = function () {
        this.connected = false;
        this.сonnectionComplete = false;
        this.MessageError(lang.connectionTerminated + ' [' + g_IRC.ircClient.ServerHostname + ']');//Connection terminated
        g_IRC.invalidServerId();
    }
    this.get = function (request) {
        consoleLog('IRC.get(' + request + ')');
        if (typeof this.elIRCConnectResponse != 'undefined')
            this.elIRCConnectResponse.innerHTML = '';
        $.connection.chatHub.server.ircGet(request);
    }
    this.getTopic = function (channelName) {
        consoleLog('IRC.getTopic(' + channelName + ')');
        if (typeof this.elIRCConnectResponse != 'undefined')
            this.elIRCConnectResponse.innerHTML = '';
        $.connection.chatHub.server.ircGetTopic(channelName);
    }
    this.onResponse = function (response) {
        consoleLog('IRC.onResponse(' + response + ')');
    }
    this.onPrivatePageIsExists = function (channelName) {
        alert(lang.anotherPrivate.replace('%s', channelName));//Another private web page with %s was opened before. Only one private page for same user is possible.
        this.closeExistPage();
    }
    this.onChannelPageIsExists = function (channelName) {
        alert(lang.anotherChannel.replace('%s', channelName));//Another %s channel web page was opened before. Only one channel page is possible.
        this.closeExistPage();
    }
    this.commandsArray = new Array();//тут хранятся все введенные пользователем IRC команды
    this.commandsIndex = -1;
    this.waitIRCMessageChannel = function (channelName) {
        var elMessage = document.getElementById('IRCMessageChannel' + channelName);
        if (elMessage == null) {//сюда попадает если вызвать команду PART со страницы IRC удаляемого канала
            //consoleError('elMessage == null');
            return;
        }
        elMessage.querySelector('.wait').innerHTML = getWaitIconBase();
    }
    this.onclickOpenChannelPage = function (channelName, privateMessage) {
        consoleLog('onclickOpenChannelPage(' + channelName + ')');
        this.waitIRCMessageChannel(channelName);
        return true;
    }
    this.partedChannel = function (channelName) {
        var IRCChannels = document.querySelectorAll('.IRCRoom');
        for (var i = 0; i < IRCChannels.length; i++) {
            var elIRCChannel = IRCChannels[i];
            if (elIRCChannel.querySelector('.treeView').params.channel == channelName) {
                var elJoin = elIRCChannel.querySelector('.join');
                if (elJoin) {
                    elJoin.value = lang.join;//Join
                    elJoin.params.joined = false;
                    elIRCChannel.querySelector('.wait').innerHTML = '';
                }
            }
        }
    }
    this.getServerName = function () {
        var IRCServerName = this.ircClient.Group.ServerName;
        var IRCGroupName = this.ircClient.Group.Name;
        return IRCGroupName
            + ((IRCServerName != '') && (IRCGroupName != '') ? ': ' : '')
            + IRCServerName
            + ' (' + this.ircClient.ServerHostname + ') ';
    }
    this.onClient = function (ircClient) {
        ircClient.allIRCReply.forEach(function (reply) { g_IRC.Reply(reply); });
        delete ircClient.allIRCReply;
        this.ircClient = ircClient;

        if (g_IRC.getChaturbateUsers != undefined)
            g_IRC.getChaturbateUsers();

        g_IRC.updateProfile2(ircClient);
        g_user.id = ircClient.User.id;//for file transfer
        onChannelPageReady();
        setTitle();

        //Если вызвать эту строку то не получится открыть диалог канала IRCChannel 
        // если он дочерний от списка каналов IRCJoinedChannels на веб странице IRCServer
        // и открыта веб страница канала
        //
        // Другими словами если щелнуть на ветке канала IRCRoom 
        // которая является дочерней от списка каналов IRCJoinedChannels на веб странице IRCServer
        // то диалог канала IRCChannel откроется и сразу закроется
        //
        // закрытие происходит потому что обновляется список каналов this.joinedChannels(WhoIsResponse);
        // в функции g_IRC.onWhoIsReceived
        //
        // Непонятно как вызывается g_IRC.onWhoIsReceived если щелнуть на ветке канала IRCRoom 
        // так же не помню зачем я засунул сюда эту стрку
        //$.connection.chatHub.server.ircWhoIs(g_user.nickname);

        onresize();
        this.displayChatBody();
        var q = new QueryString();
        var channelName = q.value('Channel');
        if (channelName == undefined) {
            var privateUser = q.value('Private');
            if (privateUser == undefined)
                return;
            displayMessage(function (elMessage) {
                elMessage.innerHTML =
                     '<a href="' + g_IRC.hrefPrivate(privateUser) + '"target="_blank" onclick="javascript: g_IRC.onclickCancel(event)">'
                   + lang.privatePage + privateUser + '</a>'//'Open a private (query) page with '
                   + '<hr><input type="button" onclick="javascript: g_IRC.onclickCancel(event)" value="' + lang.cancel + '" >'//Cancel
                ;
            });
            if (this.onclickCancel == undefined) this.onclickCancel = function (event) {
                var el = getElementFromEvent(event).parentElement;
                el.parentElement.removeChild(el);
            }
            return;
        }
        if (channelName == '') {
            consoleError('Channel name is empty');
            return;
        }
        if (onclickIRCJoinChannel2(channelName, ''))
            SetCookie("IRCChannelName", channelName);
    }
    this.updateWhoIs = function () {
        if (!event) event = window.event;//for IE6
        var target = event.target || event.srcElement;
        target.parentElement.parentElement.querySelector('.treeView').params.branch.onOpenBranch(target);
    }
    this.createJoin = function (IRCChannelName, noAnimate, disabled) {
        //<div class="gradient_gray IRCJoin">
        var elIRCJoin = document.createElement('div');//el.cloneNode();
        elIRCJoin.className = "gradient_gray IRCJoin" + (noAnimate ? '' : ' b-toggle');
        elIRCJoin.innerHTML = getSynchronousResponse('IRCJoin.html');

        var elIRCChannelName = elIRCJoin.querySelector(".IRCChannelName");
        if (typeof IRCChannelName == 'undefined') IRCChannelName = get_cookie("IRCChannelName");
        else elIRCChannelName.disabled = disabled == undefined ? true : disabled;
        elIRCChannelName.value = IRCChannelName;
        elIRCJoin.disabledChannelName = elIRCChannelName.disabled;

        elIRCJoin.querySelector(".IRCCloseJoin").title = lang.close;//Close
        elIRCJoin.querySelector(".IRCJoinHeader").innerHTML = '⎆ ' + lang.joinChannel;//Join to channel
        elIRCJoin.querySelector(".IRCChannelNameLabel").innerHTML = lang.channelName + ': ';//Channel Name

        elIRCJoin.querySelector(".AdditionallyTree").appendChild(myTreeView.createBranch(
        {
            name: lang.additionally,//Additionally
            params:
            {
                animate: true,
                noBranchLeft: true,
                scrollIntoView: true,
                createBranch: function () { return elIRCJoin.querySelector(".Additionally"); }
            }
        }));
        var elJoinButton = elIRCJoin.querySelector('.join');
        elJoinButton.value = lang.join;//Join
        elJoinButton.params = { joined: false, channel: IRCChannelName };

        //Password
        elIRCJoin.querySelector(".IRCJoinPassLabel").innerHTML = lang.password + ': ';//'Password'
        elIRCJoin.querySelector(".IRCJoinRememberPassLabel").innerHTML = lang.rememberPassLabel;//Remember password
        var passJoin = get_cookie("IRCJoinPass");
        var elIRCJoinRememberPass = elIRCJoin.querySelector(".IRCJoinRememberPass");
        if (get_cookie("IRCJoinRememberPass", "false") == 'true') {
            elIRCJoin.querySelector(".IRCJoinPass").value = passJoin;
            elIRCJoinRememberPass.checked = true;
        } else elIRCJoinRememberPass.checked = false;
        elIRCJoinRememberPass.disabled = passJoin == '' ? true : false;

        //http://www.geekshed.net/2012/03/using-channel-keys/
        elIRCJoin.querySelector(".IRCChannelOwner").innerHTML = lang.IRCChannelOwner + ': ';//If you is channel owner or joining to a new channel, you can
        var channelKey = elIRCJoin.querySelector(".IRCChannelKeyLabel");
        channelKey.innerHTML = lang.IRCСhannelKeyTitle + ': ';//Set a channel key for your channel, and only those people who have the key will be able to join the channel.
        elIRCJoin.querySelector(".IRCChannelTopicLabel").innerHTML = lang.setTopic + ': ';//Set a channel topic

        //Нельзя устанавливать топик канала если ты не оператор канала
        //482 aaae #ainishosting :You're not channel operator
        //elIRCJoin.querySelector(".IRCChannelTopic").value = el.querySelector('.colTopic').innerText;

        return elIRCJoin;
    }
    //use in IRC Server and IRC channel and private web pages
    this.onIsJoined = function (channelName, joined) {
        consoleLog('IRC.onIsJoined(' + channelName + ', ' + joined + ')');
        g_IRC.joinedChannel(channelName, joined);

        //IRCRoom
        document.querySelectorAll('.IRCRoom').forEach(function (elIRCRoom) {
            if (elIRCRoom.querySelector('.treeView').params.resize)
                setTimeout(function () { onresize() }, 0);//заголовок веб страницы
        });

        //edit IRCJoin dialogs
        document.querySelectorAll('.IRCJoin').forEach(function (elIRCJoin) {
            var IRCChannelName = elIRCJoin.querySelector('.IRCChannelName').value;
            if (IRCChannelName[0] != '#')
                IRCChannelName = '#' + IRCChannelName;
            if (IRCChannelName == channelName) {
                var elJoin = elIRCJoin.querySelector('.join');
                elJoin.params.joined = joined;
                elIRCJoin.querySelector('.wait').innerHTML = '';
                g_IRC.JoinDisable(elIRCJoin, joined, false);
                if (!elIRCJoin.disabledChannelName) {
                    elIRCJoin.parentElement.removeChild(elIRCJoin);
                    SetCookie("IRCChannelName", channelName);
                }
            }
        });

        //add or remove channel from IRCWhois dialogs
        document.querySelectorAll('.IRCWhois').forEach(function (elIRCWhois) {
            if (elIRCWhois.nickname == g_user.nickname) {
                var elIRCJoinedChannels = elIRCWhois.querySelector('.Channels');
                if (joined) {
                    if (!myTreeView.isBranchExists(channelName, elIRCJoinedChannels)) {
                        g_IRC.createJoinedChannels(elIRCJoinedChannels);
                        myTreeView.AddNewBranch(elIRCJoinedChannels, {
                            branch: function () { return createIRCRoom({ RoomName: channelName, joined: true }); },
                            branchId: channelName
                        });
                    }
                } else {
                    myTreeView.removeBranch(channelName, elIRCJoinedChannels);
                    if (elIRCJoinedChannels.querySelectorAll('.IRCRoom').length == 0)
                        elIRCJoinedChannels.innerHTML = '';
                }
            }
        });
    }
    this.onclickChannelToggle = function (event) {
        consoleLog('IRC.onclickChannelToggle()');
        var elInput = getElementFromEvent(event);
        el = elInput.parentElement;
        var channelName;
        var elChannelName = el.parentElement.querySelector('.IRCChannelName');
        if (elChannelName == null)//
            channelName = el.parentElement.parentElement.querySelector('.channelName').innerText
        else {//IRCJoin dialog
            channelName = elChannelName.value;
            if (channelName == '') {
                inputKeyFilter.TextAdd(lang.typeChannelName, elChannelName, "downarrowdivred");//'Type channel name please'
                return;
            }
        }
        if (channelName[0] != '#') {
            channelName = '#' + channelName;
            if (elChannelName)
                elChannelName.value = channelName;
        }
        if (elInput.params.joined || g_IRC.getJoinedChannel(channelName)) {
            inputKeyFilter.TextAdd(lang.anotherChannel.replace('%s', channelName), elChannelName, "downarrowdivred");//Another %s channel web page was opened before. Only one channel page is possible.
            el.href = '#';
            el.target = '_self';
            return;
        }
        el.href = '?IRCChannel=' + encodeURIComponent(channelName) + '&IRCServerID=' + g_IRC.IRCServerID;
        el.target = '_blank';
        $.connection.chatHub.server.ircAddChannel(g_IRC.IRCServerID, channelName,
            el.parentElement.querySelector(".IRCJoinPass").value,
            el.parentElement.querySelector(".IRCChannelKey").value,
            el.parentElement.querySelector(".IRCChannelTopic").value
            );
    }
    this.onclickNick = function (event) {
        consoleLog('IRC.onclickNick()');
        if (!event) event = window.event;
        var el = event.target || event.srcElement;
        this.get('NICK ' + el.parentElement.querySelector('.nickInput').value);
    }
    this.onclickPart = function (channelName) {
        if (channelName[0] != '#')
            channelName = '#' + channelName;
        consoleLog('onclickPart(' + channelName + ')');
        this.get('PART ' + channelName);
        this.waitIRCMessageChannel(channelName);
    }
    this.JoinDisable = function (elIRCJoin, disable, disableJoin) {
        if (typeof disable == 'undefined')
            disable = true;
        if (typeof disableJoin == 'undefined')
            disableJoin = disable;

        elIRCJoin.querySelectorAll('input').forEach(function (elInput) {
            if (elInput.className == 'join') {
                elInput.disabled = disableJoin;
                if (disable) {
                    elInput.params.joining = true;
                } else {
                    elInput.params.joining = false;
                }
            }
            else elInput.disabled = disable;
        });

        var elIRCChannelName = elIRCJoin.querySelector('.IRCChannelName');
        if (!disable) {
            this.disableRememberPass(elIRCJoin);
            elIRCChannelName.disabled = typeof elIRCJoin.disabledChannelName == 'undefined' ? false : elIRCJoin.disabledChannelName;
        }
    }
    this.channelResponse = function (channelName, response) {
        document.getElementById('users').querySelectorAll('.IRCJoin').forEach(function (elIRCJoin) {
            if (elIRCJoin.querySelector('.IRCChannelName').value == channelName) {
                elIRCJoin.querySelector('.wait').innerHTML = response;
                g_IRC.JoinDisable(elIRCJoin, false);
            }
        });
    }
    this.disableRememberPass = function (elIRCJoin) {
        elIRCJoin.querySelector('.IRCJoinRememberPass').disabled = elIRCJoin.querySelector('.IRCJoinPass').value == "" ? true : false;
    }
    this.hrefPrivate = function (nickname) {
        return '?IRCChannel=' + encodeURIComponent(nickname)
            + '&IRCServerID=' + this.IRCServerID
            + '&IRCPrivate';
    }
    this.createUser = function (user, resize, tagName, parentElement) {
        consoleLog('IRC.createUser() user.nickname: ' + user.nickname + (user.IRCuser == undefined ? '' : ' Hostmask: ' + user.IRCuser.Hostmask));
        if ((typeof tagName == 'undefined') || (tagName == null))
            tagName = 'span';
        var animate = false;//!noAnimate;если сделать animate, то в окне чата строка сообщения посетителя окажется ниже посетителя после открытия и закрытия ветки посетителя
        function onclickBranch(a) {
            if (resize)
                setTimeout(function () { onresize() }, 0);//нужно исправить размеры страницы когда окрывается окно моего пользователя в заголовке страницы)
        }
        
        var el = document.createElement(tagName);
        function CTCP(name, arg) {
            var charCode = String.fromCharCode(1);
            return {
                name: name,
                User: user,
                onclickBranch: onclickBranch,
                onOpenBranch: function (a) {
                    a.parentElement.querySelector('.CTCP_' + name).innerHTML = getWaitIconBase();
                    project.CTCPcommand(this.User, a, name);
/*
                    switch (name) {
                        case 'VERSION':
                            project.CTCPversion(this.User, a);
                            break;
                        default:
                            console.error('under constraction');
                            project.sendMessage(this.User, charCode + name + (arg == undefined ? '' : arg()) + charCode, a);
                    }
*/
                },
                branch: function () {
                    var el = document.createElement("div");
                    el.innerHTML =
                        //'<span onclick="javascript: myTreeView.onclickCloseBranch()" class="sendButton" title="' + lang.close + '">X</span>'
                        //+ '<span onclick="javascript: g_IRC.updateWhoIs()" class="sendButton" title="' + lang.update + '">⥀</span>'//🔃//🗘 not compatible with Windows Server 2012
                        '<div class="CTCP_' + name + '"></div>';
                    return el;
                }
            }
        }
        try {
            var tree =
            [
                {//user
                    name: getUserString(user)
                    , className: 'IRCuser'
                    //, animate: true не работает в заголовке страницы
                    , tagName: tagName
                    , User: user
                    , onclickBranch: onclickBranch
                    //, scrollIntoView: true
                    , parentElement: parentElement
                    , tree:
                    [
                        {//WhoIs
                            name: lang.whoIs//не могу изменить назание ветви после изменения ника + ' ' + user.nickname//WhoIs
                            //, animate: animate
                            , User: user
                            , onclickBranch: onclickBranch
                            , onOpenBranch: function (a) {
                                a.parentElement.querySelector('.Channels').innerHTML = getWaitIconBase();
                                project.whoIs(this.User);
                            }
  //                        , scrollIntoView: true
                            , branch: function () {
                                var el = document.createElement("div");
                                el.className = 'gradient_gray IRCWhois';
                                el.nickname = this.User.nickname;
                                el.style.overflow = "auto";
                                el.innerHTML =
                                    '<span onclick="javascript: myTreeView.onclickCloseBranch()" class="sendButton" title="' + lang.close + '">X</span>'
                                    + '<span onclick="javascript: g_IRC.updateWhoIs()" class="sendButton" title="' + lang.update + '">⥀</span>'//🔃//🗘 not compatible with Windows Server 2012
                                    + '<div class="ban" style="visibility:' + (this.User.ban ? 'visible' : 'hidden') + '">' + lang.banned + '</div>'//Is banned
                                    + '<table></table>'
                                    + '<div class="Channels"></div>'
                                ;
                                return el;
                            }
                        },
                        {//CTCP https://en.wikipedia.org/wiki/Client-to-client_protocol
                            name: 'CTCP',
                            //, animate: animate
                            User: user,
                            onclickBranch: onclickBranch,
                            //                        , scrollIntoView: true
                            tree: [
                                {//help
                                    name: function () {
                                        var el = document.createElement("div");
                                        var a = document.createElement("a");
                                        a.href = 'https://wikipedia.org/wiki/Client-to-client_protocol';
                                        a.innerHTML = lang.wikipedia;//Wikipedia
                                        a.target = "_blank";
                                        a.title = lang.help;//help
                                        el.appendChild(a);
                                        return el;
                                    }
                                },
                                CTCP('PING', function () { return ' ' + timeStampInMs(); }),
                                CTCP('VERSION'),
                                CTCP('CLIENTINFO'),
                                CTCP('SOURCE'),
                                CTCP('TIME')
                            ]
                        },
                    ]
                }
            ]

            //Control
            if ((user.nickname != g_user.nickname) && (!g_chatRoom.isPrivate())) {
                tree[0].tree.push({
                    name: lang.control//Control
                    //, animate: animate
                    , User: user
                    , onclickBranch: onclickBranch
                    //, scrollIntoView: true
                    , branch: function () { return g_IRC.control(user);}
                });
            }

            //Mode https://www.unrealircd.org/docs/User_modes
            if ((user.IRCuser != undefined) && (user.IRCuser.Mode != null)) {
                tree[0].tree.push({
                    name: lang.IRC.mode//Mode
                //, animate: animate
                    , User: user
                    , onclickBranch: onclickBranch
                //                        , scrollIntoView: true
                    , branch: function () {
                        var el = document.createElement("div"), add;
                        el.className = 'gradient_gray IRCMode';
                        el.style.overflow = "auto";
                        el.innerHTML =
                            '<span onclick="javascript: myTreeView.onclickCloseBranch()" class="sendButton" title="' + lang.close + '">X</span>'
                            + '<a href="https://www.unrealircd.org/docs/User_modes" target="_blank" class="sendButton">?</a>'
                            + '<h3 align="center"></h3>'
                            + '<table></table>'
                        ;
                        if (this.User.IRCuser.Mode == null)
                            return el;
                        this.User.displayMode = function (el) {
                            if (!el.classList.contains('IRCMode')) {
                                consoleError('el.className: ' + el.className);
                                return;
                            }
                            el.querySelector("h3").innerHTML = this.nickname + '. ' + lang.IRC.mode//'Modes'
                                + ': ' + this.IRCuser.Mode;
                            var elTable = el.querySelector("table");
                            elTable.innerHTML = '';
                            for (i = 0; i < this.IRCuser.Mode.length; i++) {
                                var c = this.IRCuser.Mode[i],
                                    elTr = document.createElement("tr"),
                                    elTd = document.createElement("td"),
                                    elB = document.createElement("b");
                                elTd.className = 'col';
                                elTd.style.paddingTop = '3px';
                                elB.style = 'float:right';
                                elB.innerHTML = c + ':';
                                elTd.appendChild(elB);
                                elTr.appendChild(elTd);
                                elTd = document.createElement("td");
                                elTd.className = 'col';
                                elTd.style.paddingTop = '3px';
                                switch (c) {
                                    case '+': add = true; continue;
                                    case '-': add = false; continue;
                                    case 'i':
                                        if (add) elTd.innerHTML = lang.IRC.modes.i;//Makes you so called 'invisible'. A confusing term to mean that you're just hidden from /WHO and /NAMES if queried by someone outside the channel. Normally set by default through set::modes-on-connect (and otherwise by the users' IRC client).
                                        break;
                                    case 'r':
                                        if (add) elTd.innerHTML = lang.IRC.modes.r;//Indicates this is a "registered nick"
                                        break;
                                    case 'x':
                                        if (add) elTd.innerHTML = lang.IRC.modes.x;//Gives you a hidden / cloaked hostname.
                                        break;
                                    default: consoleError('this.User.IRCuser.Mode[' + i + ']: ' + this.IRCuser.Mode[i]);
                                        break;
                                }
                                elTr.appendChild(elTd);
                                elTable.appendChild(elTr);
                            }
                        }
                        this.User.displayMode(el);
                        return el;
                    }
                });
            }

            //geolocation
            if (user.IRCuser != undefined) {
                var arIP = user.IRCuser.Hostmask.match(/.*@([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
                if ((arIP != null) && (arIP.length == 5)) {
                    tree[0].tree.push({
                        name: lang.geolocationPrompt//Geolocation
                        //, animate: animate
                        , User: user
                        , onclickBranch: onclickBranch
                        //, scrollIntoView: true
                        , branch: function () { return g_IRC.geolocation(arIP[1] + '.' + arIP[2] + '.' + arIP[3] + '.' + arIP[4]); }
                    });
                }
            }

            myTreeView.createTree(el, tree);
        } catch (e) {
            consoleError(e.message);
        }
        return el;
    }
    this.geolocation = function (ip) {
        var el = document.createElement("div"), add;
        el.className = 'gradient_gray';
        el.style.overflow = "auto";
        el.innerHTML =
            '<span onclick="javascript: myTreeView.onclickCloseBranch()" class="sendButton" title="' + lang.close + '">X</span>'
            + '<table></table>'
        ;
        var elTable = el.querySelector("table");
        elTable.className = 'Geolocation';
        var geolocation = JSON.parse(getSynchronousResponse('https://ipapi.co/' + ip + '/json'));
        for (var prop in geolocation) {
            var elTr = document.createElement("tr");
            var elTd = document.createElement("td");
            elTd.className = 'col';
            var elB = document.createElement("b");
            elB.style = 'float:right';
            elB.innerHTML = prop + ':';
            elTd.appendChild(elB);
            elTr.appendChild(elTd);
            elTd = document.createElement("td");
            elTd.className = 'col';
            elTd.innerHTML = geolocation[prop];
            elTr.appendChild(elTd);
            elTable.appendChild(elTr);
        }
        var elTr = document.createElement("tr");
        var elA = document.createElement("a");
        elA.href = 'https://www.google.com/maps/search/?api=1&query=' + geolocation.latitude + ',' + geolocation.longitude;
        elA.target = "_blank";
        elA.innerHTML = lang.IRC.map;//Map
        elTr.appendChild(elA);
        elTable.appendChild(elTr);
        el.appendChild(elTable);
        return el;
    }
    this.control = function (user) {
        var el = document.createElement("div");
        el.className = 'gradient_gray Control';
        el.nickname = user.nickname;//for editing of Control element after updating of nick
        var IamCO = g_user.IRCuser == undefined ? false : g_user.IRCuser.isChannelOperator();//Are you channel operator?
        el.innerHTML =
            '<span onclick="javascript: myTreeView.onclickCloseBranch()" class="sendButton" title="' + lang.close + '">X</span>'
            //Private
            + '<div>'
                + '<a class="private" target="_blank">' + lang.privatePage + user.nickname + '</a>'//'Open a private (query) page with '
            + '</div>'

            + (((IamCO)
                    && (typeof user.IRCuser != 'undefined')) ?//user is not kicked before
                '<span class="kick">'//Kick
                    + '<input class="comment" placeholder="' + lang.comment + '" />'//comment
                    + '<input type="button" onclick="javascript: g_IRC.onclickKick(event)" value="' + lang.kick + '"'//Kick
                        + ' title="' + lang.kickTitle + '" />'//Forcibly  remove  a  user  from  a channel.
                + '</span>'
                + '<span class="kicked"></span>'
                //Ban
                + '<div>'
                    + '<input class="banMask" placeholder="ban mask" value="' + user.IRCuser.Hostmask + '" />'
                    + '<input class="banButton" type="button" onclick="javascript: g_IRC.onclickBan(event)" value="'
                        + (!user.ban ? lang.ban : lang.unban) + '"' + ' title="' + lang.banTitle + '" />'//Set a ban mask to keep users out
                    + ' <a href="http://www.ircbeginner.com/opvinfo/masks.html" target="_blank">?</a>'
                + '</div>'
                //Channel operator
                + '<div>'
                    + '<input class="channelOperator" type="checkbox" onclick="javascript: g_IRC.onclickChannelOperator(event)">' + lang.IRCChannelOperator//Channel operator
                + '</div>'
                //Voice
                + '<div title="' + lang.voiceTitle + '">'//Give the ability to speak on a moderated channel
                    + '<input class="voice" type="checkbox" onclick="javascript: g_IRC.onclickVoice(event)">'
                    + lang.voice//Voice
                + '</div>'
                + '<div class="reply"></div>'
                : '');
        el.querySelector('.private').href = g_IRC.hrefPrivate(user.nickname);
        if (IamCO) {
            el.querySelector('.channelOperator').checked = user.IRCuser.isChannelOperator() ? true : false;
            el.querySelector('.voice').checked = user.IRCuser.isVoice() ? true : false;
        }
        return el;
    }
    this.onclickIRCJoin = function () {
        consoleLog("IRC.onclickIRCJoin()");
        var el = getElementFromEvent(event);
        var elParent = el.parentElement.parentElement;
        var elTreeView = elParent.childNodes[0];
        if (elTreeView.className == "treeView")
            myTreeView.onclickBranch(elTreeView);
        else onclickIRCJoin2(elParent);
    }
    this.CS = {
        onclick: function () {
            consoleLog('IRC.CS.onclick');
            loadScript("Scripts/IRC/CS/CS.js");
        }
    }
    this.onNickMode = function (nick, mode) {
        consoleLog('IRC.onNickMode(' + nick + ', ' + mode + ')');
        document.querySelectorAll('.IRCuser').forEach(function (elIRCuser) {
            var user = getUserElUser(elIRCuser);
            if (user.nickname != nick)
                return;
            user.IRCuser.Mode = mode;
            if (user.displayMode == undefined)
                return;

            var branchElement = elIRCuser.querySelector('.treeView').branchElement;
            if (branchElement == undefined)
                return;
            branchElement.querySelectorAll('.treeView').forEach(function (el) {
                if ((el.branchElement != undefined) && el.branchElement.classList.contains('IRCMode'))
                    user.displayMode(el.branchElement);
            });
        });
    }
}
function IRCInit() {}
var g_IRC;
g_IRC = new IRC();
IRCInit();
function onclickIRCCommand() {
    consoleLog("onclickIRCCommand()");
    return onbranchFast('IRCCommand2', 'branchIRCCommand');
};
function createIRCRoom(channel) {
    consoleLog('createIRCRoom(' + JSON.stringify(channel) + ')');
    return myTreeView.createBranch(
        {
            name: channel.RoomName
            , className: 'IRCRoom'
            , title: typeof channel.topic == 'undefined' ? '' : g_IRC.mircToHtml(channel.topic, true)
            , tagName: channel.tagName
            , params:
            {
                joined: channel.joined
                , channel: channel.RoomName
                , branchId: channel.RoomName//for myTreeView.removeBranch
                , parentElement: channel.parentElement
                , animate: channel.resize ? false : true
                , resize: channel.resize
                , createBranch: function (elTreeView) {
                    var el = document.createElement("div");
                    el.className = 'gradient_gray IRCChannel';
                    el.innerHTML =
                          '<span onclick="javascript: myTreeView.onCloseBranchAnywhere(event)" class="sendButton closeChannel" title="' + lang.close + '">X</span>'
                        + '<p align="center">'
                            + '<b><span class="channelName">' + channel.RoomName + '</span>' + lang.channel.replace('%s', '') + '</b>'//'Channel'
                        +'</p>'
                        + (channel.noDisplayMessage == false ?
                                '<div><a '
                                + 'href="?IRCChannel=' + encodeURIComponent(channel.RoomName) + '&IRCServerID=' + g_IRC.IRCServerID + '&joined"'
                                + ' target="_blank">' + lang.IRC.openChaanelPage.replace('%s', channel.RoomName) + '</a></div>'//Open %s chaanel page
                            : ''
                           )
                        + '<table>'
                        + '</table>'
                        + '<div class="joinOrPart"></div>'
                        + '<span class="wait"></span>'
                    ;
                    el.resize = channel.resize;
                    el.elTreeView = elTreeView;//for myTreeView.onCloseBranchAnywhere(event)
                    var elJoinOrPart = el.querySelector('.joinOrPart');
                    if (this.joined) {
                    } else if (!channel.resize) elJoinOrPart.appendChild(myTreeView.createBranch({
                        name: this.joined ? lang.part : lang.join,
                        params: {
                            resize: channel.resize,
                            onclickBranch: function () {
                                if(this.resize)
                                    setTimeout(function () { onresize() }, 0);//заголовок веб страницы
                            },
                            createBranch: function () {
                                var elIRCJoin = g_IRC.createJoin(channel.RoomName, channel.resize);
                                el.parentElement.insertBefore(elIRCJoin, el.nextSibling);
                                return elIRCJoin;
                            }
                        }
                    }));
                    return el;
                }
                , onToggleBranch: function () {
                    if (this.resize)
                        setTimeout(function () { onresize() }, 0);//нужно исправить размеры страницы когда окрывается окно моего пользователя в заголовке страницы)
                }
                , onOpenBranch: function (a) {
                    a.branchElement.querySelector('table').innerHTML = getWaitIconBase();
                    g_IRC.getTopic(this.channel);
                    this.onToggleBranch()
                }
                , onCloseBranch: function (a) { this.onToggleBranch() }
            }
        }
    );
}
function getGenderString(birthday) { return { gender: '', title: '' }; }
function onclickIRCJoinChannel2(IRCChannelName, pass) {
    consoleLog("onclickIRCJoinChannel2(" + IRCChannelName + ")");
    if (g_IRC.IsJoinedChannel(IRCChannelName)) {
        g_IRC.channelResponse(IRCChannelName, getErrorTag(lang.IRCJoinedBefore));//You joined this channel before
        return false;
    }
    onclickIRCJoin2(document.getElementById('IRC'), IRCChannelName, pass, false);
    return true;
}
function onUserDisconnected(id, userName, usersCount, roomName) { }
function startHubIRC() {
    var chat = $.connection.chatHub;
    chat.client.onIRCUnhandledMessage = function (message) { g_IRC.MessageError(message) }//consoleError(message); }
    chat.client.onIRCConnect = function (message) { g_IRC.onConnect(message); }
    chat.client.onIRCClient = function (ircClient) { g_IRC.onClient(ircClient); }
    chat.client.onIRCInvalidServerId = function (IRCServerID) {
        if (typeof g_IRC != 'undefined')//g_IRC не определен если окрывается веб камера в чате SignalRChat
            g_IRC.onInvalidServerId(IRCServerID);
    }
    chat.client.onIRCMessage = function (message) { g_IRC.onMessage(message); }
    chat.client.onIRCChannelMessageRecieved = function (channelName, nick, message) { g_IRC.onChannelMessageRecieved(channelName, nick, message); }
    chat.client.onIRCUserMessageRecieved = function (receiver, sender, message) { g_IRC.onUserMessageRecieved(receiver, sender, message); }
    chat.client.onIRCChannel = function (user, IRCClient, channel, ChannelModes) { g_IRC.onChannel(user, IRCClient, channel, ChannelModes); }
    chat.client.onIRCChannelListRecieved = function (users, ChannelModes) { g_IRC.onChannelListRecieved(users, ChannelModes); }
    chat.client.onIRCMessageError = function (message) { g_IRC.onMessageError(message); }
    chat.client.onIRCReply = function (message) { g_IRC.Reply(stringToSpecialEntities(message)); }
    chat.client.onIRCReplyCTCP = function (command, message, nick) {
        g_IRC.ReplyCTCP(stringToSpecialEntities(command), stringToSpecialEntities(message),
            stringToSpecialEntities(nick));
    }
    chat.client.onIRCIsOpenPrivate = function (user) { g_IRC.onIsOpenPrivate(user); }
    chat.client.onIRCIsClosePrivate = function (user) { g_IRC.onIsClosePrivate(user); }
    chat.client.onIRCNickInUse = function (message) { g_IRC.onNickInUse(message); }
    chat.client.onIRCNickChanged = function (oldNick, newNick, Hostmask) { g_IRC.onNickChanged(oldNick, newNick, Hostmask); }
    chat.client.onIRCJoinedChannel = function (channel, noDisplayMessage, user) { g_IRC.onJoinedChannel(channel, noDisplayMessage, user); }
    chat.client.onIRCUserJoinedChannel = function (channelName, JSONIRCuser, prefix) { g_IRC.onUserJoinedChannel(channelName, JSONIRCuser, prefix); }
    chat.client.onIRCUserPartedChannel = function (channelName, userNick) { g_IRC.onUserPartedChannel(channelName, userNick); }
    chat.client.onIRCIsJoined = function (channelName, joined) { g_IRC.onIsJoined(channelName, joined); }
    chat.client.onIRCTopic = function (message) { g_IRC.onTopic(message); }
    chat.client.onIRCTopicTooLong = function (channel, MaxTopicLength) { g_IRC.onTopicTooLong(channel, MaxTopicLength); }
    chat.client.onIRCUserQuit = function (message) { g_IRC.onUserQuit(message); }
    chat.client.onIRCChannelTopicReceived = function (message, ChannelModes) { g_IRC.onChannelTopicReceived(message, ChannelModes); }
    chat.client.onIRCListStart = function (message) { g_IRC.onListStart(message); }
    chat.client.onIRCListReply = function (message) { g_IRC.onListReply(message); }
    chat.client.onIRCListEnd = function (message) { g_IRC.onListEnd(message); }
    chat.client.onIRCChannelMode = function (message) { g_IRC.onChannelMode(message); }
    chat.client.onIRCNickMode = function (nick, mode) { g_IRC.onNickMode(nick, mode); }
    chat.client.onIRCUserKicked = function (message) { g_IRC.onUserKicked(message); }
    chat.client.onIRCUserBanned = function (message) { g_IRC.onUserBanned(message); }
    chat.client.onIRCChannelOperator = function (message) { g_IRC.onChannelOperator(message); }
    chat.client.onIRCVoice = function (message) { g_IRC.onVoice(message); }
    chat.client.onIRCPartedChannel = function (channelName) { g_IRC.onPartedChannel(channelName); }
    chat.client.onIRCWhoIsReceived = function (WhoIsResponse, nick) { g_IRC.onWhoIsReceived(WhoIsResponse, nick); }
    chat.client.onIRCDisconnected = function (message) { g_IRC.onDisconnected(message); }
    chat.client.onIRCResponse = function (response) { g_IRC.onResponse(response); }
    chat.client.onIRCPrivatePageIsExists = function (channelName) { g_IRC.onPrivatePageIsExists(channelName); }
    chat.client.onIRCChannelPageIsExists = function (channelName) { g_IRC.onChannelPageIsExists(channelName); }
}
startHubIRC(); 