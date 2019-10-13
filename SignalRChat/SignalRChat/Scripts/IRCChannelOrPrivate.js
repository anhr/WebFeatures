/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
 * Open IRC channel or private web page
 * Not compatible with IRCServer.js
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

function openIRCPage(q) {
    loadScript("lang/IRC/ChannelOrPrivate/" + getLanguageCode() + ".js", function () {
        var IRCChannel = q.value("IRCChannel");
        consoleLog('openIRCPage("' + IRCChannel + '")');
        var IRCPrivateMessages = q.value("IRCPrivate");
        g_IRC.IRCServerID = q.value("IRCServerID");
        var IRCPrivate = typeof IRCPrivateMessages == 'undefined' ? false : true;
        g_IRC.onUserMessageRecieved = function (receiver, sender, message) {
            g_IRC.UserMessageRecieved(receiver, sender, message);

            if (this.FTSenders == undefined)
                this.FTSenders = [];
            var boFirstMessage = true;
            for (i = 0; i < this.FTSenders.length; i++) {
                if (this.FTSenders[i] == sender) {
                    boFirstMessage = false;
                    break;
                }
            }
            if (boFirstMessage == true)
                this.FTSenders.push(sender);
            if (!boFirstMessage && message.toLowerCase() != 'ft')
                return;
            document.getElementsByName('fileTransfer').forEach(function (elFileTransfer) {
                elFileTransfer.fileTransfer.sendFileBase(undefined, function (fileTransfer) {
                    $.connection.chatHub.server.sendMessage((privMsgFTText(fileTransfer).message.replace('%2s',
                        ' Your IRC client does not allow you to')
                        + ' Go to   %page     to connect to the IRC server from a compatible IRC client.'
                        + ' This client is web based. Therefore, there is no need to download anything.'
                            ).replace('%page', window.location.protocol + '//'
                                + (window.location.hostname == 'localhost' ? 'bonalink.hopto.org' : window.location.hostname) + '/Chat/'
                                + '?Nickname=' + encodeURIComponent(sender)
                                + '&tab=IRC'
                                + '&IRCURL=' + encodeURIComponent(g_IRC.ircClient.ServerHostname)
                                + '&IRCPort=' + g_IRC.ircClient.ServerPort
                                + g_IRC.goToPageName(receiver)
/*
                                + (g_chatRoom.isPrivate() ? '&Private=' + encodeURIComponent(receiver) :
                                    '&Channel=' + encodeURIComponent(g_chatRoom.RoomName))
*/
                                ), sender);
                    /*KVIRC не понимает по русски
                    if (messageLocal)
                        $.connection.chatHub.server.sendMessageFileTransfer(messageLocal, g_chatRoom.RoomName);
                    */
                });
            });
        }
        g_IRC.IsJoinedChannel = function (IRCChannelName) { return g_IRC.isJoined(IRCChannelName); }
        g_IRC.joinedChannel = function (channelName, joined) {
            if (!joined)
                return;

            //это условие срабатывает неправильно когда IRC сервер по собственной инициативе изменяет название канала по команде 
            // 470://ERR_LINKCHANNEL automatically redirected to another channel. or ERR_KICKEDFROMCHAN
            // Для проверки зайти на chat.freenode.net как зарегистрированный пользователь blink но без пароля и войти на канал #python
            //
            //var q = new QueryString();
            //if (channelName.toLowerCase() != q.value("IRCChannel").toLowerCase())

            if (channelName.toLowerCase() != g_chatRoom.RoomName.toLowerCase())
            {
                return;//вошел в новый канал channelName с веб страницы другого канала q.value("IRCChannel")
            }

            //Если оставить эту строку то иногда при входе на канал список посетителей становится пустой хотя число посетителей не равно нулю
            //непонятно зачем я засунул сюда эту строку
            //document.getElementById('chatusers').innerHTML = '';

            $.connection.chatHub.server.ircChannel(channelName, g_IRC.IRCServerID, false);
        }
        g_IRC.isJoined = function (channel) {
            var channels = g_user.IRCuser.Channels;
            for (var i = 0; i < channels.length; i++)
                if (channels[i].Name == channel)
                    return true;
            return false;
        }
        g_IRC.onPartedChannel = function (channelName) {
            consoleLog('IRC.onPartedChannel(' + channelName + ')');
            g_IRC.onIsJoined(channelName, false);
            g_IRC.partedChannel(channelName);
//            g_IRC.removeMessageElement(channelName);
        }
        g_IRC.closeExistPage = function () {
            //Do not works if try to open a duplicate IRC channel web page from address line
            //For example
            //Open an IRC channel web page
            //Copy the IRC channel web page address
            //Create new browser tab
            //Paste IRC channel web page address into browser's address line(now you try to open duplicate IRC channel web page)
            //Now you can see the
            //"Scripts may close only the windows that were opened by it."
            //in the Console window

            window.close();
        }
        //список посетителей канала с сайта https://chaturbate.com/
//        g_IRC.chaturbateUsers;

        //получить список посетителей канала с сайта https://chaturbate.com/
        g_IRC.getChaturbateUsers = function () {
            loadScript('Scripts/IRC/Chaturbate/Chaturbate.js', function () {
                g_chaturbate.chaturbateResponse
                    ('../IRCBot/?IRCServer=' + g_IRC.ircClient.ServerHostname + '&Channel=' + encodeURIComponent(g_chatRoom.RoomName));
            });
        }
        g_IRC.onJoinedChannel = function (channelName, noDisplayMessage, user) {
            consoleLog('IRC.onJoinedChannel(' + channelName + ')');
            g_user.nickname = user.Nick;
            $.connection.chatHub.server.ircIsJoined(channelName);
        }
        g_IRC.onChannel = function (user, channel, ChannelModes) {
            consoleLog('IRC.onChannel');
            g_user.IRCuser = user;
            g_user.IRCuser.isChannelOperator = g_IRC.isChannelOperator;
            g_user.IRCuser.isVoice = g_IRC.isVoice;
            g_user.nickname = g_user.IRCuser.Nick;//сейчас это используется при обновлении веб страницы канала. Так же данные о самом себе я отаравляю еще в onIRCJoinedChannel
            if (
                (channel != null)
                && (channel != 'null')//For compatible with old wersion of this.Clients.Caller.onIRCChannel
                ) {//нет канала в приватной странице
                g_chatRoom.IRCchannel = channel;
                if (g_chatRoom.RoomName.toLowerCase() != g_chatRoom.IRCchannel.Name.toLowerCase()) {
                    consoleError('IRC.onChannel ' + g_chatRoom.RoomName + ' != ' + g_chatRoom.IRCchannel.Name)
                    g_chatRoom.RoomName = g_chatRoom.IRCchannel.Name;
                }
            } else {
                g_chatRoom.IRCchannel = {//Private IRC page
                    Users: [g_user.IRCuser]
                }
                g_chatRoom.PrivateID = g_chatRoom.RoomName;//чтобы правильно работала g_chatRoom.isPrivate()
                //Если все в порядке, добавляем нового пользователя в приватную страницу, которая запрашивала ircIsOpenPrivate
                $.connection.chatHub.server.ircIsOpenPrivate(g_IRC.IRCServerID);
            }
            g_IRC.onConnect('');
            g_IRC.connected = true;
/* q.value("IRCChannel") неверно когда сервер самостоятельно изменил название канала
            var q = new QueryString();
            $.connection.chatHub.server.ircGetServer(g_IRC.IRCServerID, q.value("IRCChannel"));
*/
            $.connection.chatHub.server.ircGetServer(g_IRC.IRCServerID, g_chatRoom.RoomName);
        }
        g_IRC.onChannelListRecieved = function (channel, ChannelModes) {
            consoleLog('IRC.onChannelListRecieved ' + channel.channelName);
            g_chatRoom.IRCchannel = channel;
            g_chatRoom.IRCchannel.Users.sort(function (a, b) {
                return g_IRC.sort(a, b, ChannelModes);
            });
            g_chatRoom.IRCchannel.Users.forEach(function (IRCuser) {
                IRCuser.isChannelOperator = g_IRC.isChannelOperator;
                IRCuser.isVoice = g_IRC.isVoice;
                var userItem;
                if (g_user.nickname == IRCuser.Nick)
                    userItem = g_user;
                else userItem = { nickname: IRCuser.Nick };
                userItem.IRCuser = IRCuser;
                var prefix = ChannelModes[userItem.nickname];
                if (typeof prefix == 'undefined')
                    prefix = '';
                userItem.prefix = prefix;
                var elementUser = AddUser(userItem);
            });
            displayUsersCount();
        }
        g_IRC.ConnectSuccess = function () { }
        g_IRC.joinedChannels = function (WhoIsResponse) { }
        g_IRC.displayChatBody = function () { }
        g_IRC.onDisconnected = function (e) {
            consoleLog('IRC.onDisconnected(' + e + ')');
            g_IRC.Disconnected();
        }
        g_IRC.invalidServerId = function () { }
        g_IRC.onInvalidServerId = function (IRCServerID) {
            if (confirm(lang.connectionTerminated + (g_IRC.ircClient == undefined ? '' : ' [' + g_IRC.ircClient.ServerHostname + ']') + '. \r\n' + lang.exitPage)) {//Connection terminated //'Do you want to leave this page?' //lang.IRCInvalidServerId + IRCServerID)//'Invalid IRCServer '
                beforeunloadCount = 0;//чтобы дважды не открывалось сообщение Changes you made may not be saved
                g_IRC.closeExistPage();
            }
        }
        g_IRC.getIRCuser = function (user) {
            if (typeof user.IRCuser != 'undefined')
                return user.IRCuser;
            var IRCusers = document.getElementById('chatusers').querySelectorAll('.IRCuser');
            for (i = 0; i < IRCusers.length; i++) {
                var userCur = getUserElUser(IRCusers[i]);
                if (userCur.nickname == user.nickname)
                    return userCur.IRCuser;
            };
            consoleError('Cannot find IRCuser for ' + user.nickname);
            return null;
        }
        g_IRC.getElUser = function (channelName, userNick) {
            if (g_chatRoom.RoomName != channelName) {
                consoleError('IRC.UserLeftChannel failed! g_chatRoom.RoomName: "' + g_chatRoom.RoomName + '" != channelName: "' + channelName + '"');
                return;
            }
            var arrayUsers = document.getElementById('chatusers').querySelectorAll('.user');
            for (var i = 0; i < arrayUsers.length; i++) {
                var elUser = arrayUsers[i];
                if (getUserElUser(elUser).nickname == userNick)
                    return elUser;
            }
            return null;
        }
        g_IRC.onUserJoinedChannel = function (channelName, JSONIRCuser, prefix) {
            var IRCuser = JSONIRCuser;//JSON.parse(JSONIRCuser);
            var userNick = IRCuser.Nick;
            consoleLog('IRC.onUserJoinedChannel(' + channelName + ', ' + userNick + ', ' + prefix + ')');
            if (g_chatRoom.RoomName.toLowerCase() != channelName.toLowerCase()) {
                consoleError('IRC.onUserJoinedChannel failed! g_chatRoom.RoomName: "' + g_chatRoom.RoomName + '" != channelName: "' + channelName + '"');
                return;
            }
//            var elBefore;
            function insertUser(arrayUsers) {
                for (var i = 0; i < arrayUsers.length; i++) {
                    var elUser = arrayUsers[i];
                    //                if (elUser.userName == userNick)
                    if (getUserElUser(elUser).nickname == userNick) {
                        consoleError('Duplicate IRC user: "' + userNick + "'");
                        return;
                    }
                    if (elUser.querySelector('.name').innerText.localeCompare(userNick) > 0)//здесь необходимо учитывать префикс в нике пользователя
                        return elUser;
                }
            }
            IRCuser.isChannelOperator = this.isChannelOperator;
            IRCuser.isVoice = this.isVoice;
            var user = { nickname: userNick, IRCuser: IRCuser }
            if (prefix)
                user.prefix = prefix;
            AddUser(user, insertUser(document.getElementById('chatusers').querySelectorAll('.user')));
            displayUsersCount();
            document.querySelectorAll('.IRCChannel').forEach(function (elChannel) {
                if (elChannel.querySelector('.channelName').innerHTML == channelName) {
                    var elUsersWhoIs = elChannel.querySelector('.usersWhoIs');
                    if (elUsersWhoIs != null)//этот элемент не существует в елементе канала, который создан в заголовке веб страницы
                        //для тестирования 
                        //открыть веб сраницу канала
                        //открыть ветку канала IRCRoom в заголовке веб страницы канала
                        //войти на канал еще одним посетителем
                        //в этом случае сюда не должно попасть
                        g_IRC.createUserWhoIs({ elInsertBebore: insertUser(elUsersWhoIs.querySelectorAll('.userWhoIs')) }, userNick, user.prefix);
                }
            })
            var message = lang.joined + ' ' + channelName;//has joined
            AddMessageToChat('', user, ' ' + message, channelName);
            g_IRC.UserInChannel({ nickname: userNick, RawMessage: message, disabled: false });
            sendFilesInfo(userNick);

            //Add chaturbate properties if current user from chaturbate site
            loadScript('Scripts/IRC/Chaturbate/Chaturbate.js', function () {
                g_chaturbate.chaturbateResponse(
                      '../IRCBot/?request=chaturbate'
                    + '&ServerHostname=' + encodeURIComponent(g_IRC.ircClient.ServerHostname)
                    + '&nick=' + encodeURIComponent(userNick)
                    , userNick);
            });
        }
        g_IRC.userPartChannel = function (channelName, userNick) {
            var elUser = this.getElUser(channelName, userNick);
            if (elUser)
                elUser.parentElement.removeChild(elUser);
            return elUser;
        }
        g_IRC.onUserPartedChannel = function (channelName, userNick) {
            consoleLog('IRC.onUserPartedChannel(' + channelName + ', ' + userNick + ')');
            if (typeof closeFileTransfer != 'undefined')
                closeFileTransfer(userNick);
            var elUser = this.userPartChannel(channelName, userNick);
            displayUsersCount();

            //remove user from WhoIs dialog
            document.querySelectorAll('.IRCChannel').forEach(function (elChannel) {
                if (elChannel.querySelector('.channelName').innerHTML == channelName) {
                    var arrayUsers = elChannel.querySelector('.usersWhoIs').querySelectorAll('.userWhoIs');
                    for (var i = 0; i < arrayUsers.length; i++) {
                        var elUser = arrayUsers[i];
                        if (getUserElUser(elUser).nickname == userNick) {
                            elUser.parentElement.removeChild(elUser);
                            return;
                        }
                    }
                }
            })

            if (!elUser)
                return;
            var user = getUserElUser(elUser);
            var message = lang.left + ' ' + channelName;//has left
            g_IRC.UserInChannel({ nickname: userNick, RawMessage: message });
            if (user.nickname == g_user.nickname)
                AddMessageToChat(lang.youLeft + channelName//'You has left '
                        + '. ' + lang.reload.replace('%s', ''));//Please reloat this web page for joining to "%s" channel again
            else AddMessageToChat('', user, ' ' + message, channelName);
        }
        g_IRC.onUserQuit = function (message) {
            consoleLog('IRC.onUserQuit(' + message.User.Nick + ')');
            var boUserDetected = false;
            var elUser = this.getElUser(g_chatRoom.RoomName, message.User.Nick);
            if (!elUser)
                return;
            elUser.parentElement.removeChild(elUser);
            AddMessageQuitIRCUser(message);
            g_IRC.UserInChannel({ nickname: message.User.Nick, RawMessage: message.Reason });
        }
        g_IRC.sendMessage = function (elements) {
            consoleLog('IRC.sendMessage(' + elements + ')');
            if (typeof this.elIRCConnectResponse != 'undefined')
                this.elIRCConnectResponse.innerHTML = '';

            //Convert elements to IRC String Formatting https://github.com/myano/jenni/wiki/IRC-String-Formatting
            //https://www.mirc.com/help/html/index.html?change_colors.html
            var message = '';
            var el = document.createElement('div');
            el.innerHTML = elements;
            var elP = el.childNodes[0],
                message = '',
                colorCode = 1,//black
                colorCodeBackground = 0;//white
            if (elP.tagName.toUpperCase() != 'P')
                consoleError('elP.tagName: ' + elP.tagName);
            function formattingChildNodes(elP) {
                var message = '';
                elP.childNodes.forEach(function (elChild) {
                    //https://www.w3schools.com/jsref/prop_node_nodetype.asp
                    switch (elChild.nodeType) {
                        case 1://element node
                            function formatting(message, charCode, params) {
                                var code = String.fromCharCode(charCode);
                                return code + (typeof params == 'undefined' ? '' : params) + message + code;
                            }
                            function formattingElement(elChild, charCode) {
                                return formatting(elChild.childNodes.length > 0 ? formattingChildNodes(elChild) : elChild.innerText, charCode);
                            }
                            switch (elChild.tagName.toUpperCase()) {
                                case 'IMG':
                                    if (CKEDITOR.config.smiley_descriptions.findIndex(function (element, index, array) {
                                        if (element != elChild.name)
                                            return false;
                                        var textual_emoticon = CKEDITOR.config.textual_emoticons[index];
                                        if (textual_emoticon == '')
                                            message += '<smiley: ' + elChild.name + '>';
                                    else message += textual_emoticon;
                                        return true;
                                    }) == -1)
                                        consoleError('elChild.name = ' + elChild.name);
                                    break;

                                case 'EM'://italic 
                                    message += formattingElement(elChild, 0x1d);
                                    break;
                                case "STRONG"://bold 
                                    message += formattingElement(elChild, 0x02);
                                    break;
                                case "U"://underlined
                                    message += formattingElement(elChild, 0x1F);
                                    break;
                                case "SPAN"://color
                                    //Color codes https://github.com/myano/jenni/wiki/IRC-String-Formatting
                                    var colors = elChild.style.color, boBackground = false;
                                    if (colors == '') {
                                        colors = elChild.style.backgroundColor;
                                        boBackground = true;
                                    }
                                    colors = colors.match(/rgb\((\d*), (\d*), (\d*)\)/);//"rgb(255, 0, 0)"
                                    if (colors == null) {
                                        consoleError('colors: ' + colors);
                                        message += elChild.innerText;
                                    } else {
                                        function stringToHex(str) {
                                            str = parseInt(str).toString(16).toUpperCase();
                                            if (str.length == 1)
                                                str = '0' + str;
                                            if (str.length != 2) consoleError('str.length = ' + str.length);
                                            return str;
                                        }
                                        var index = CKEDITOR.instances.editor.config.colorButton_colors.indexOf(
                                            stringToHex(colors[1]) + stringToHex(colors[2]) + stringToHex(colors[3]));
                                        if (index == -1) {
                                            consoleError('elChild.style.color = ' + elChild.style.color);
                                            break;
                                        }
                                        index = index / 7;
                                        if (boBackground) colorCodeBackground = index;
                                        else colorCode = index;
                                        message += formattingElement(elChild, 0x03);
                                        if (boBackground) colorCodeBackground = 0;//white
                                        else colorCode = 1;//black
/*
                                        message += formatting(elChild.innerText, 0x03,
                                            colorCode + (colorCodeBackground == 0 ? '' : ',' + colorCodeBackground));
*/
                                    }
                                    break;

                                default: consoleError('elChild.tagName = ' + elChild.tagName);
                            }
                            break;
                        case 3://text node
                            if ((colorCode != 1) || (colorCodeBackground != 0)) {

                                //javascript format number to have 2 digit https://stackoverflow.com/questions/8043026/javascript-format-number-to-have-2-digit
                                function numberTo2digit(number) { return ("0" + number).slice(-2); }

                                message += formatting(elChild.data, 0x03,
                                    numberTo2digit(colorCode) + (colorCodeBackground == 0 ? '' : ',' + numberTo2digit(colorCodeBackground)));
                            }
                            else message += elChild.data;
                            break;
                        default: consoleError('elChild.nodeType = ' + elChild.nodeType);
                    }
                });
                return message;
            }
            message += formattingChildNodes(elP);

            $.connection.chatHub.server.sendMessage(message, g_chatRoom.RoomName);
        }
        g_IRC.onChannelMessageRecieved = function (channelName, nick, message) {
            consoleLog('IRC.onChannelMessageRecieved(' + channelName + ', ' + nick + ', ' + message + ')')
            message = '<p>' + g_IRC.mircToHtml(stringToSpecialEntities(message)) + '</p>';

            //smileys
            if (CKEDITOR.config.textual_emoticons != undefined) {//Иногда сообщение на канал приходит до того как загрузился CKEDITOR
                //Для проверки зайти на irc.dal.net и открыть #Jakarta
                for (var indexSmiley = CKEDITOR.config.textual_emoticons.length - 1; indexSmiley >= 0 ; indexSmiley--) {
                    var smileyTextual = CKEDITOR.config.textual_emoticons[indexSmiley];
                    if (smileyTextual == '') {
                        switch (indexSmiley) {
                            case 14: smileyTextual = '<smiley: enlightened>'; break;//enlightened
                            case 20: smileyTextual = '<smiley: mail>'; break;//mail
                            default: consoleError('indexSmiley = ' + indexSmiley); continue;
                        }
                    }
                    smileyTextual = smileyTextual.replace('>', '&gt;');//for '>:(',//9 angry and '>:-)',//12 devil
                    smileyTextual = smileyTextual.replace('<', '&lt;');//for '<3',//17 heart and '</3',//18 broken heart
                    var index = message.indexOf(smileyTextual);
                    if (index == -1)
                        continue;
                    if ((smileyTextual == ':/') && (message[index + 2] == '/'))
                        continue;//The '://' is detected. Example: https://www.google.ru
                    consoleLog('smiley');
                    var el = document.createElement('div');
                    el.appendChild(createSmile(CKEDITOR.instances.editor.ui.get
                        (CKEDITOR.instances.editor.config.smiley_imagesGif[indexSmiley].match(/^(.*).gif/)[1])).$);
                    message = message.replace(smileyTextual, el.innerHTML);
                }
            }

            broadcastMessage({ nickname: nick }, message);
        }
        g_IRC.onErrorMessage = function (e) { }
        g_IRC.isReply = function (command) { return command == 'NOTICE' ? false : true; }
        g_IRC.getJoinedChannel = function (channelName) { return null; }
        g_IRC.redirectedToAnotherChannel = function (message) {
            consoleLog('IRC.redirectedToAnotherChannel(' + message.RawMessage + ')');
            if (g_chatRoom.RoomName != message.Parameters[1])
                return;
            g_chatRoom.RoomName = message.Parameters[2];
//            new QueryString().value("IRCChannel") = g_chatRoom.RoomName;
        }
        g_IRC.updateProfile2 = function (ircClient) {
            //Если оставить эту строку то испортится g_user.IRCuser
//        g_user.updateProfile(ircClient.User);
        }
        g_IRC.NSSyntax = function (syntax){}
        g_IRC.CSTopic = function (message) { }

        document.getElementById("title").innerHTML = getTitle(IRCChannel, IRCPrivateMessages);
        initSample();//ckeditor http://ckeditor.com/
        if (typeof g_IRC.IRCServerID == 'undefined') {
            alert(lang.invalidIRCServerID + g_IRC.IRCServerID);//'Invalid IRC server ID: '
            gotoChatPage();
            return false;
        }
        //consoleLog('IRCChannel: ' + IRCChannel + ', IRCServerID: ' + IRCServerID + ', IRCPrivate: ' + IRCPrivate)
        $.connection.chatHub.server.ircChannel(IRCChannel, g_IRC.IRCServerID, IRCPrivate);

        if (q.value("joined") == '')
            $.connection.chatHub.server.ircNames(IRCChannel, g_IRC.IRCServerID);

        //Эту строку перенес в g_IRC.onChannel потому что когда обновляю веб страницу IRC чата то в заголовке страницы 
        // вместо комнаты createIRCRoom создается пользователь g_IRC.createUser
        // потому что в function createElementRoom(channel, tagName)
        // typeof g_chatRoom.IRCchannel == 'undefined'
        // g_chatRoom.IRCchannel создается в g_IRC.onChannel котороая вызывается из public void ircChannel
        // а public void ircChannel вызывается из $.connection.chatHub.server.ircChannel (см. строку выше)
        // Другими словами к моменту создания заголовка веб страницы setTitle() переменная g_chatRoom.IRCchannel еще не готова
        //$.connection.chatHub.server.ircGetServer(IRCServerID, IRCChannel);

        g_chatRoom.RoomName = IRCChannel;
    });
}
function SendMessage(data, value) {
    if ((value.length > 0) && (value[0] == '/')) {
        value = value.substring(1);
        g_IRC.get(value);
        return;
    }
    g_IRC.sendMessage(data);
    broadcastMessage(g_user, data);
}
function IRCMessageError(message) {
    var el = document.createElement('div');
    el.innerHTML = message;
    AddMessageToChat(el.childNodes[0]);
}
g_IRC.elIRCConnectResponse = document.getElementById("IRCConnectResponse");
if (g_IRC.elIRCConnectResponse == null)
    delete g_IRC.elIRCConnectResponse;
function colorsArray(editor) {
    /** Replace of original D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\SignalRChat\ckeditor\plugins\colorbutton\plugin.js
        * Defines the colors to be displayed in the color selectors. This is a string
        * containing hexadecimal notation for HTML colors, without the `'#'` prefix.
        *
        * **Since 3.3:** A color name may optionally be defined by prefixing the entries with
        * a name and the slash character. For example, `'FontColor1/FF9900'` will be
        * displayed as the color `#FF9900` in the selector, but will be output as `'FontColor1'`.
        *
        *		// Brazil colors only.
        *		config.colorButton_colors = '00923E,F8C100,28166F';
        *
        *		config.colorButton_colors = 'FontColor1/FF9900,FontColor2/0066CC,FontColor3/F00';
        *
        * @cfg {String} [colorButton_colors=see source]
        * @member CKEDITOR.config
        */
    //https://github.com/myano/jenni/wiki/IRC-String-Formatting
    //http://www.rapidtables.com/web/color/RGB_Color.htm
    //https://ru.wikipedia.org/wiki/%D0%A6%D0%B2%D0%B5%D1%82%D0%B0_HTML
    editor.config.colorButton_colors =
          'FFFFFF,'//00	white
        + '000000,'//01	black
        + '000080,'//02	blue (navy)
        + '008000,'//03	green
        + 'FF0000,'//04	red
        + '800000,'//05	brown (maroon)
        + '800080,'//06	purple
        + '808000,'//07	orange (olive)
        + 'FFFF00,'//08	yellow
        + '00FF00,'//09	light green (lime)
        + '008080,'//10	teal (a green/blue cyan)
        + '00FFFF,'//11	light cyan (cyan / aqua)
        + '0000FF,'//12 blue//light blue (royal)
        + 'FF00FF,'//13	pink (light purple / fuchsia)
        + '808080,'//14	grey
        + 'C0C0C0'//15	light grey (silver)
    ;
    editor.lang.colorbutton.colors = lang.colors;
}
function ckeditorToolbar(config) {
    //http://www.uas.alaska.edu/a_assets/ckeditor/samples/plugins/toolbar/toolbar.html 
    // Toolbar configuration generated automatically by the editor based on config.toolbarGroups.
    config.toolbar = [
        { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source'] },
        {
            name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: [//'Find', 'Replace', '-', 'SelectAll', '-',
              'Scayt']
        },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', '-', 'RemoveFormat'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'others', items: ['-'] },
        {
            name: 'Smileys', items: ['regular_smile', 'sad_smile', 'wink_smile', 'teeth_smile', 'confused_smile', 'tongue_smile',
	        'embarrassed_smile', 'omg_smile', 'whatchutalkingabout_smile', 'angry_smile', 'angel_smile', 'shades_smile',
	        'devil_smile', 'cry_smile', 'lightbulb', 'thumbs_down', 'thumbs_up', 'heart',
	        'broken_heart', 'kiss', 'envelope'
            ]
        },
        { name: 'about', items: ['About'] }
    ];
}
function isSendByEnter() { return true; }
function openToolbarTitle() { return lang.openToolbar; }//Open Toolbar
function closeToolbarTitle() { return lang.closeToolbar; }//Close Toolbar
function deleteg_IRCuser() {
    var user = JSON.parse(JSON.stringify(g_user));//copy of object
    deleteIRCuser(user);
    return user;
}
function deleteIRCuser(data) {
/*
    if (data.IRCuser == undefined){
        var keys = Object.keys(data);
        for (i = 0; keys.length; i++){
            var key = keys[i];
            if (key == 'user') {
                delete data[key].IRCuser;
                break;
            }
        }
    }
    else*/ delete data.IRCuser;//если я не удалю IRCuser то будет ошибка:
    //jquery.signalR-2.0.0.js:1450 WebSocket is already in CLOSING or CLOSED state.
    //72.391 blink2: SignalR error: Error: WebSocket closed.
    //если попробовать отпавить файл на IRC канале на котором много посетителей.
    //Для примера зайти на irc.webmaster.com сервер, открыть #kampung канал. Там обычно больше 300 посетителей. Попробовать отправить файл
//    return JSON.stringify(data);
}
function privMsgFTText(fileTransfer) {
    switch (fileTransfer.fileTransfers) {
        case "cameraTransfers":
            //if (messageLocal)
            //    messageLocal = lang.IRC.startVideoBroadcast;//I started broadcasting from my web camera. Please send me a private message if you want to watch my broadcast.
            return { message: 'I started broadcasting from my web camera. %2s watch my broadcast.' };
        case "microphoneTransfers":
            //if (messageLocal)
            //    messageLocal = lang.IRC.startAudioBroadcast;//I started the audio broadcasting. Please send me a private message if you want to watch my broadcast.
            return { message: 'I started the audio broadcasting. %2s watch my broadcast.' };
        case undefined:
            //if (messageLocal)
            //    messageLocal = lang.IRC.startFile.replace('%s', fileTransfer.name);//I shared the "%s" file. Please send me a private message if you want to upload my file.
            return { message: 'I shared the "%s" file. %2s upload my file.'.replace('%s', fileTransfer.name) };
        case "pictureTransfers":
            //if (messageLocal)
            //    messageLocal = lang.IRC.startPicture.replace('%s', fileTransfer.name);//I shared the "%s" picture. Please send me a private message if you want to upload my picture.
            return { message: 'I shared the "%s" picture. %2s upload my picture.'.replace('%s', fileTransfer.name) };
        case "videoTransfers":
            //if (messageLocal)
            //    messageLocal = lang.IRC.startVideo.replace('%s', fileTransfer.name);//I shared the "%s" video file. Please send me a private message if you want to upload my video.
            return { message: 'I shared the "%s" video file. %2s upload my video.'.replace('%s', fileTransfer.name) };
        case "audioTransfers":
            //if (messageLocal)
            //    messageLocal = lang.IRC.startAudio.replace('%s', fileTransfer.name);//I shared the "%s" audio file. Please send me a private message if you want to upload my audio.
            return { message: 'I shared the "%s" audio file. %2s upload my audio.'.replace('%s', fileTransfer.name) };
        default: consoleError('fileTransfer.fileTransfers: ' + fileTransfer.fileTransfers);
            return;
    }
}
function privMsgFileTransfer(fileTransfer) {
    $.connection.chatHub.server.sendMessageFileTransfer(privMsgFTText(fileTransfer).message.replace('%2s',
        'Please send me the "ft" private message (query): "/privmsg %nick :ft" if you want to').replace('%nick', g_user.nickname), g_chatRoom.RoomName);
}
//эта функция вызывается еще до того как открывается веб страница IRC канала. Поэтому список всех ранее запущенных FileTransfer не отображается
function sendFileRequest(userInfo) { /*$.connection.chatHub.server.ircSendFileRequest(g_chatRoom.RoomName, g_user.id, userInfo);*/ }
function isHelpContentSignalR() { return false; }
//вывести на экран количество зрителей или слушателей media передачи
function setPeersCount(dataID, peersCount) { $.connection.chatHub.server.ircPeersCount(dataID, peersCount); }
