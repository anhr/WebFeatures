/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
 * Open IRC server web page
 * Not compatible with IRCChannelOrPrivate.js
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

//Channels (Rooms)
function IRCServerInit() {
    //menu
    var elMenuUsers = document.getElementById("menuUsers");
    if (elMenuUsers) {
        document.getElementById("IRCJoinButton").innerHTML = lang.joinChannel;//'Join to channel'
        document.getElementById("IRCNickButton").innerHTML = lang.newNick;//New Nick
        document.getElementById("NSCommandsButton").innerHTML = lang.IRC.NSCommands;//'Nickserv Assistant'
        document.getElementById("CSAssistantButton").innerHTML = lang.IRC.CSAssistant;//'ChanServ Assistant'
        document.getElementById("IRCDisconnect").innerHTML = lang.IRCDisconnect;//Disconnect from IRC server
    }
    
    document.getElementById("IRCSend").placeholder = lang.IRCCommand;//Type an IRC command
    document.getElementById("send").title = lang.IRCsendCommand;//Send the command to the server
    document.getElementById("updateRoomList").title = lang.update;//Update
    document.getElementById("clearRoomList").title = lang.clear;//Clear

    //registering in Nickserv
    document.getElementById("NSCommands").innerHTML = '㎱ ' + lang.IRC.NSCommands;//Nickserv Assistant
    document.getElementById("NSRegisteringOptionsHeader").innerHTML = lang.NSRegisteringTitle;//Registering your nickname in Nickserv.
    document.getElementById("NSPassLabel").innerHTML = lang.password + ': ';//'Password'
    document.getElementById("NSPassLabel2").innerHTML = lang.passwordRe + ': ';//'Retype Password'
    document.getElementById("NSEmailLabel").innerHTML = lang.NSEmail + ': ';//'An email containing an authentication code will be sent to the specified email address'
    document.getElementById("NSRegister").value = lang.NSRegister;//'Register'
    document.getElementById("NSCloseRegistering").title = lang.close;//Close
    document.getElementById("NSDrop").value = lang.NSDrop;//Drop Nickname
    var elNSIdentify = document.getElementById("NSIdentify");
    elNSIdentify.value = lang.NSIdentify;//Identify
    elNSIdentify.title = lang.NSIdentifyTitle;//In order to use a registered nickname, and before you can perform any ChanServ functions, you will be required to identify yourself with NickServ.
    var elNSSendPass = document.getElementById("NSSendPass");
    elNSSendPass.value = lang.NSSendPass;//Password Recovery
    elNSSendPass.title = lang.NSSendPassTitle;//If you forgot your password you may use this button to have a key sent to the email address corresponding to the specified nickname, that can be used to set a new password.
    
    //new nick
    document.getElementById("IRCNickHeader").innerHTML = '📛 ' + lang.newNick;//New Nick
    document.getElementById("IRCNewNickLabel").innerHTML = lang.newNick + ': ';//New Nick
    var elIRCNewNick = document.getElementById("IRCNewNick");
    if (elIRCNewNick.value == '')
        elIRCNewNick.value = get_cookie("IRCNickname");
    document.getElementById("IRCNewNickButton").value = lang.change;//Change
    document.getElementById("IRCCloseNick").title = lang.close;//Close

    //Join

    document.getElementById("roomsHeader").innerHTML = lang.rooms;//Rooms
    var elIRCChannelsHeaderRow = document.getElementById("IRCChannelsHeaderRow");
    elIRCChannelsHeaderRow.querySelector('.Name').innerHTML = lang.name;//Name
    elIRCChannelsHeaderRow.querySelector('.colName').title = lang.sortName;//Sort by channel name
    elIRCChannelsHeaderRow.querySelector('.colTopic').innerHTML = lang.topic;//Topic
    elIRCChannelsHeaderRow.querySelector('.colUsers').title = lang.sortUser;//Sort by channel users count//usersCount;//Count of users in the channel

    setUsersWidth();
}
loadScript("lang/IRC/" + getLanguageCode() + ".js", function () {
    IRCServerInit();
});
function onclickRooms() {
    consoleLog("onclickRooms()");
    var elChannelsList = document.getElementById('roomsListBranch');
    var res = onbranchelementFast(elChannelsList, 'branchRooms');
    if (isBranchExpandedFast(elChannelsList) && (elChannelsList.querySelector('tbody').querySelectorAll('tr').length == 1))
        g_IRC.get('LIST');
    return res;//onbranchFast('roomsListBranch', 'branchRooms');
};
function setTitle() {
    var title = document.getElementById("title");
    title.innerHTML = documentTitlePrefix();
    title.appendChild(createElementMyUser(true, document.getElementById('titleBranch')));
    documentTitle();
}
function documentTitle() { document.title = (boBodyFocus ? "" : "*") + g_IRC.ircClient.ServerHostname + ' - ' + g_user.nickname; }
function openIRCPage(q) {
    var IRCServerID = q.value("IRCServer");
    consoleLog('openIRCPage(IRCServerID: "' + IRCServerID + '")');
    $.connection.chatHub.server.ircGetServer(IRCServerID, '');
    g_IRC.IRCServerID = IRCServerID;
    g_IRC.joinedChannel = function (channelName, joined) { }
    g_IRC.onUserQuit = function (message) { consoleLog('IRC.onUserQuit(' + message.User.Nick + ')'); }
    g_IRC.onUserKicked = function (message) {
        consoleLog('IRC.onUserKicked(' + message.Kicked + ')');
        if (g_user.nickname != message.Kicked)
            return;
        g_IRC.onPartedChannel(message.Channel);
    }
    g_IRC.onUserMessageRecieved = function (receiver, sender, message) {
        consoleLog('g_IRC.onUserMessageRecieved(...)');

        if (g_IRC.getCTCP(message, sender))
            return;

        document.getElementById("noInvitations").style.display = 'none';
        document.getElementById("invitations").style.display = 'block';
        onbranch('informerInvitations', 'branchInvitations', true);
        var invitationId = 'inviter' + sender;
        var elInformerInvitations = document.getElementById("informerInvitations");
        var elInformerInvitation = elInformerInvitations.querySelector('#' + invitationId);
        if (!elInformerInvitation) {
            $("#informerInvitations").append(
                  '<div class="invitation gradient" id="' + invitationId + '" name="invitation" style="padding:5px; margin-top:5px; overflow:auto;">'
                + '<b>'
                    + lang.privateMessage.replace('%s', sender)//You have received a private message from %s:
                    + '<ul class="messages branchLeft" style="padding-left:10px"></ul>'
                + '</b>'
                + ' <div>'
                    + '<a'
                        + ' target="_blank" onclick="javascript: return removeInviter(\'' + sender + '\', true)">'
                        + '<input type="button" value="' + lang.reply + '" >'//Reply
                    + '</a>'
                    + '<input type="button" onclick="javascript: removeInviter(\'' + sender + '\')" value="' + lang.close + '" >'//'Close'
                + '</div>'
            );
            elInformerInvitation = elInformerInvitations.querySelector('#' + invitationId);
        }
        var elMessage = document.createElement('li');
        elMessage.innerHTML = message;
        var elMessages = elInformerInvitation.querySelector('.messages');
        elMessages.appendChild(elMessage);
        var arrayMessages = [];
        for (var i = 0; i < elMessages.childNodes.length; i++)
            arrayMessages.push(elMessages.childNodes[i].innerHTML);
        elInformerInvitation.querySelector('a').href = '?IRCChannel=' + encodeURIComponent(sender)
            + '&browserID=' + g_user.browserID
            + '&IRCServerID=' + g_IRC.IRCServerID
            + '&IRCPrivate=' + encodeURIComponent(JSON.stringify(arrayMessages));
        invitationsCount();
        beep("../MyIsapi/sounds/knockKnock.mp3");
        documentTitle();
    }
    g_IRC.onJoinedChannel = function (channelName, noDisplayMessage) {
        consoleLog('IRC.onJoinedChannel(' + channelName + ')');
        $.connection.chatHub.server.ircIsJoined(channelName);
        var elIRCServers = null;
        var elIRCJoinedChannels = document.getElementById("IRCJoinedChannels");
        elIRCJoinedChannels.style.display = "block";
        if (elIRCJoinedChannels.childNodes.length == 0) {
            elIRCServers = elIRCJoinedChannels.appendChild(myTreeView.createBranch({
                name: lang.IRCChannels,//'Joined Channels'
                title: lang.IRCChannelsTitle,//'List of channels you have joined'
                treeViewTagName: 'h1',
            }));
        }
        myTreeView.AddNewBranch(elIRCJoinedChannels, {
            branch: function () {
                var elChannel = g_IRC.getServerChannel(channelName);
                return createIRCRoom({
                    RoomName: channelName,
                    topic: elChannel ? elChannel.querySelector('.colTopic').innerText : '',
                    joined: true,
                    noDisplayMessage: noDisplayMessage
                });
            }
        });
        if (elIRCServers)
            myTreeView.onclickBranch(elIRCServers.querySelector('.treeView'));

//        g_IRC.displayJoinedMessage(channelName, noDisplayMessage);
    }
    g_IRC.getJoinedChannel = function (channelName) {
        //consoleLog('IRC.getJoinedChannel(' + channelName + ')');
        var elIRCChannels2 = document.getElementById('IRCJoinedChannels');//'IRCChannels2');
        var IRCChannels = elIRCChannels2.querySelectorAll('.IRCRoom');
        for (var i = 0; i < IRCChannels.length; i++) {
            var elIRCChannel = IRCChannels[i];
            if (elIRCChannel.querySelector('.treeView').params.channel.toLowerCase() == channelName.toLowerCase())
                return elIRCChannel;
        }
        return null;
    }
    g_IRC.onPartedChannel = function (channelName) {
        consoleLog('IRC.onPartedChannel(' + channelName + ')');
        g_IRC.onIsJoined(channelName, false);
        var elIRCChannel = g_IRC.getJoinedChannel(channelName);
        if (elIRCChannel == null) {//сюда попадает на веб странице IRC канала когда пользовател вручную вызвал RART channelName
            //или когда закрывается другой IRC канал из списка каналов в диалоге WhoIs одного из пользователей данного канала
            g_IRC.partedChannel(channelName);
            return;
        }
        elIRCChannel.parentElement.removeChild(elIRCChannel);
        var elIRCChannels = document.getElementById('IRCJoinedChannels');//'IRCChannels2');
        if (elIRCChannels.querySelectorAll('.IRCRoom').length == 0)
            elIRCChannels.style.display = 'none';
//        g_IRC.removeMessageElement(channelName);
    }
    g_IRC.isJoined = function (channel) { return g_IRC.getJoinedChannel(channel) == null ? false : true; }
    g_IRC.closeExistPage = function () { }
    g_IRC.invalidServerId = function () { g_IRC.onInvalidServerId(g_IRC.IRCServerID); }
    g_IRC.onInvalidServerId = function (IRCServerID) {
        //alert(lang.IRCInvalidServerId + IRCServerID)//'Invalid IRCServer '
        gotoChatPage();
    }
    g_IRC.onIRCSend = function (response) {

        var code = response.keyCode;
        /*not compatible with Safari
        if (typeof response.key != 'undefined')//for edge, chrome
            code = response.key;
        else if (typeof response.code != 'undefined')//for Safari, chrome
            code = response.code;
        else {
            consoleError('onIRCSend(' + response.keyCode + ')');
            return;
        }
        code = code.toLowerCase();
        */
        switch (code) {
            case 13://'enter':
                {
                    onClickSend();
                    break;
                }
                //case 'arrowup':
                //case 'up'://for edge
            case 38:
                {
                    if (g_IRC.commandsArray.length == 0)
                        break;
                    if (g_IRC.commandsIndex == -1)
                        g_IRC.commandsIndex = g_IRC.commandsArray.length - 1;
                    else if (g_IRC.commandsIndex > 0)
                        g_IRC.commandsIndex = g_IRC.commandsIndex - 1;
                    response.currentTarget.value = g_IRC.commandsArray[g_IRC.commandsIndex];
                    break;
                }
                //case 'arrowdown':
                //case 'down'://for edge
            case 40:
                {
                    if (g_IRC.commandsArray.length == 0)
                        break;
                    if (g_IRC.commandsIndex == -1)
                        g_IRC.commandsIndex = g_IRC.commandsArray.length - 1;
                    else if (g_IRC.commandsIndex < g_IRC.commandsArray.length - 1)
                        g_IRC.commandsIndex = g_IRC.commandsIndex + 1;
                    response.currentTarget.value = g_IRC.commandsArray[g_IRC.commandsIndex];
                    break;
                }
        }
    }

    //channels list

    g_IRC.clearChannelsList = function () {
        var elTbody = document.getElementById('roomsListBranch')//'IRCChannelsList')
            .querySelector('tbody');
        for (var i = elTbody.childNodes.length - 1; i > 0; i--)
            elTbody.removeChild(elTbody.childNodes[i]);
        //elChannelsList.innerHTML = '';
    }
    g_IRC.channelsCount = 0;
    g_IRC.usersCount = 0;
    g_IRC.getCookieList = function () {
        g_IRC.descountName = get_cookie("IRCdescountName", 'false') == 'true' ? true : false;
        g_IRC.descountUsers = get_cookie("IRCdescountUsers", 'true') == 'true' ? true : false;;
    }
    g_IRC.onListUpdate = function () {
        consoleLog('IRC.onListUpdate()');
        g_IRC.getCookieList();
        g_IRC.get('LIST');
    }
    g_IRC.onListStart = function (message) {
        consoleLog('IRC.onListStart()');
        var elChannelsList = document.getElementById('roomsListBranch');//'IRCChannelsList');
        if (!isBranchExpandedFast(elChannelsList))
            onbranchelementFast(elChannelsList, 'branchRooms');//'branchIRCChannelsList');
        g_IRC.clearChannelsList();
        g_IRC.channelsCount = 0;
        g_IRC.usersCount = 0;
        document.getElementById('roomsWait').innerHTML = getWaitIconBase();
    }
    g_IRC.onListReply = function (message) {
        //        consoleLog('Channel: ' + message.ListState.Message.Parameters[1]);
        g_IRC.channelsCount++;
        g_IRC.usersCount += parseInt(message.ListState.Message.Parameters[2]);
        document.getElementById('roomsCount')//'IRCChannelsListCount')
            .innerHTML = g_IRC.channelsCount
            + '. ' + lang.usersChannels + ': ' + g_IRC.usersCount//'Users'
        var elChannel = document.createElement('tr');
        elChannel.className = 'row';
        elChannel.innerHTML =
//			'<td class="col colName">' + message.ListState.Message.Parameters[1] + '</td>'//channel name
            '<td class="col colName"></td>'//channel name
            + '<td class="col colUsers"><span style="float:right">' + message.ListState.Message.Parameters[2] + '</span></td>'//users count
            //буквы одинаковой ширины. <pre> нужен для того что бы не пропадали идущие подряд пробелы
            + '<td class="col"><pre style="margin:0;"><FONT class="colTopic" style="font-family:monospace;"></FONT></pre></td>'//topic
        ;
        elChannel.querySelector('.colName').appendChild(createIRCRoom({ RoomName: message.ListState.Message.Parameters[1] }));
        $(elChannel.querySelector('.colTopic')).html(g_IRC.mircToHtml(message.ListState.Message.Parameters[3]))
        document.getElementById('roomsListBranch').querySelector('tbody').appendChild(elChannel);
    }
    g_IRC.getCookieList();
    g_IRC.onSortChannels = function (col, int) {
        //Sort channels http://stackoverflow.com/questions/14160498/sort-element-by-numerical-value-of-data-attribute
        var elChannelsList = document.getElementById('IRCChannelsListTbody');
/*
        //remove all JOIN dialogs
        elChannelsList.querySelectorAll('div').forEach(function (elIRCJoin) {
            elIRCJoin.parentElement.removeChild(elIRCJoin);
        });
*/
        var elChannelsHeader = document.getElementById('IRCChannelsHeaderRow');

        //clear sorts elements
        var arrayElSorts = elChannelsList.querySelectorAll('.sort');
        for (i in arrayElSorts)
            arrayElSorts[i].innerHTML = '';

        var elSort = elChannelsHeader.querySelector(col).querySelector('.sort');
        elSort.innerHTML = getWaitIconBase();

        //Если я не закрою все IRCChannel то сортировка будет некорректна
        //потому что в IRCChannel есть элементы типа tr
        //close all IRCChannel elements
        elChannelsList.querySelectorAll('.IRCChannel').forEach(function (elIRCChannel) {
            elIRCChannel.parentElement.removeChild(elIRCChannel);

            //если просто закрыть ветку то сортировка все равно будет неправильной
            // думаю потому что ветка закрывается медленно
/*
            var elCloseChannel = elIRCChannel.querySelector('.closeChannel');
            elCloseChannel.onclick({ target: elCloseChannel });
*/
        });

        setTimeout(function () {
            var $elChannelsList = $('#IRCChannelsListTbody');
            $elChannelsList.find('tr').sort(function (a, b) {
                var cola = a.querySelector(col);
                var colb = b.querySelector(col);
                if ((cola == null) || (colb == null))
                    return -1;//IRCChannel dialog is open
                if ((cola.className.indexOf('colHeader') != -1) || (colb.className.indexOf('colHeader') != -1))
                    return -1;//do not sort the table header row

                var avalue = cola.innerText;
                var bvalue = colb.innerText;
                if (int) {//sort of interer value
                    if (g_IRC.descountUsers) {
                        var value = avalue;
                        avalue = parseInt(bvalue);
                        bvalue = parseInt(value);
                    } else {
                        avalue = parseInt(avalue);
                        bvalue = parseInt(bvalue);
                    }
                } else {//sort of strings
                    if (g_IRC.descountName) {
                        var value = avalue;
                        avalue = bvalue.toLowerCase();
                        bvalue = value.toLowerCase();
                    } else {
                        avalue = avalue.toLowerCase();
                        bvalue = bvalue.toLowerCase();
                    }
                }
                if (avalue < bvalue) return -1;
                if (avalue > bvalue) return 1;
                return 0;
            })
            .appendTo($elChannelsList);

            //move header to up
            elChannelsList.insertBefore(elChannelsHeader, elChannelsList.firstChild);

            SetCookie("IRCdescountName", g_IRC.descountName ? 'true' : 'false');
            SetCookie("IRCdescountUsers", g_IRC.descountUsers ? 'true' : 'false');
            SetCookie("IRCCLSortCol", col);

            var descount;
            if (int) {
                g_IRC.descountUsers = !g_IRC.descountUsers;
                descount = g_IRC.descountUsers ? '↓' : '↑';
            } else {
                g_IRC.descountName = !g_IRC.descountName;
                descount = g_IRC.descountName ? '↓' : '↑';
            }
            elSort.innerHTML = descount;
            document.getElementById('roomsWait').innerHTML = '';
        }, 100);
    }
    g_IRC.onListEnd = function (message) {
        consoleLog('IRC.onListEnd()');
        var col = get_cookie("IRCCLSortCol", '.colName');
        g_IRC.onSortChannels(col, col == '.colName' ? false : true);
    }
    g_IRC.onkeyupIRCJoinPass = function () {
        if (!event) event = window.event;
        var el = event.target || event.srcElement;
        g_IRC.disableRememberPass(el.parentElement.parentElement);
    }
    g_IRC.IsJoinedChannel = function (IRCChannelName) {
        var elTreeView = document.getElementById("IRCJoinedChannels").querySelector('.treeView');
        if (!elTreeView || (typeof elTreeView.branchElement == 'undefined'))
            return false;
        var channels = elTreeView.branchElement.querySelectorAll('.IRCRoom');
        for (var i = 0; i < channels.length; i++) {
            var elChannel = channels[i];
            if (elChannel.querySelector('.name').innerText == IRCChannelName) {
                consoleLog('channel ' + IRCChannelName + ' is joined before');
                return true;
            }
        }
        return false;
    }
    g_IRC.getServerChannel = function (channelName) {
        var colNames = document.getElementById('rooms').querySelectorAll('.colName');
        for (var i = 1; i < colNames.length; i++) {//пропустить заголовок таблицы
            var elColName = colNames[i];
            if (elColName.innerText == channelName)
                return elColName.parentElement;
        }
        return null;
    }
    g_IRC.onUserPartedChannel = function (channelName, userNick) {
        consoleLog('IRC.onUserPartedChannel(' + channelName + ', ' + userNick + ')');
    }
    g_IRC.joinedChannels = function (WhoIsResponse) {
        if (WhoIsResponse.User.Nick != g_user.nickname)
            return;
        consoleLog('IRC.joinedChannels()');
        g_IRC.appendJoinedChannels(document.getElementById('IRCJoinedChannels'), WhoIsResponse, 'h1');
    }
    g_IRC.displayChatBody = function () { displayChatBody(); }
    g_IRC.onDisconnected = function (e) {
        consoleLog('IRC.onDisconnected(' + e + ')');
        g_IRC.Disconnected();
    }
    g_IRC.isJoinedChannel = function (WhoIsResponse, Nick) { }
    g_IRC.onErrorMessage = function (e) {
        switch (parseInt(e.Message.Command)) {
            case 475://ERR_BADCHANNELKEY "<channel> :Cannot join channel (+k)"
                var elIRC = document.getElementById('IRC'),
                    elIRCJoin = elIRC.querySelector('.IRCJoin');
                if ((elIRCJoin == null) || (elIRCJoin.className.indexOf(' expanded') == -1))
                    elIRCJoin = onclickIRCJoin2(elIRC);
                elIRCJoin.querySelector('.IRCChannelName').value = e.Message.Parameters[1]
                break;
        }
    }
    g_IRC.isReply = function (command) { return true; }
    g_IRC.onchangeIRCChannelName = function (event) {
        var el = getElementFromEvent(event);
        consoleLog('onchangeIRCChannelName() ' + el.value);
    }
    g_IRC.redirectedToAnotherChannel = function (message) { }
    g_IRC.Command = function (command) {
        g_IRC.Reply('[RAW]: ' + command);
        g_IRC.get(command);
    }
    g_IRC.NSCommand = function (command) { g_IRC.Command('NickServ ' + command);}
    g_IRC.getNSPass = function () {
        var elNSPass = document.getElementById("NSPass");
        var NSPass = elNSPass.value;
        if (NSPass == '') {
            inputKeyFilter.TextAdd(lang.typePassword//'Type password please'
                , elNSPass, "downarrowdivred");
            elNSPass.focus();
        }
        return NSPass;
    }
    g_IRC.onclickNSSendPass = function () {
        consoleLog("IRC.onclickNSSendPass()");
        var ns = document.getElementById('NSRegistering').IRC.ns;
        if (ns.sendpass != undefined) {
            //http://wiki.foonetic.net/wiki/Nickserv_Commands#Identifying_.26_Retrieving_a_password
            var params = g_IRC.NSCommandParams(ns.sendpass);
            if (params == '') params = ' ' + g_user.nickname;//irc.data.lt парамерты на литовском языке
            g_IRC.NSCommand("SENDPASS" + params);
            return;
        } else {
            var params;
            if (ns.resetpass != undefined) {
                params = g_IRC.NSCommandParams(ns.resetpass);
                if (params == '') return;
            } else params = ' ' + g_user.nickname + ' ' + NSPass;
            g_IRC.NSCommand("RESETPASS" + params);
        }
    }
    g_IRC.NSCommandParams = function (array) {
        if (array == undefined) {
            consoleError('array: ' + array);
            return '';
        }
        var command = '';
        for (i = 0; i < array.length; i++) {
            switch (array[i]) {
                case "nickname":
                case "nick"://irc.webmaster.com
                case "account"://irc.freenode.net
                    command += ' ' + g_user.nickname;
                    break;
                case "password":
                case "newpassword"://irc.gamesurge.net
                    var NSPass = g_IRC.getNSPass();
                    if (NSPass == '') return '';
                    command += ' ' + NSPass;
                    break;
                case "email"://irc.swiftirc.net
                case "email-address"://irc.freenode.net
                case "email address"://irc.webchat.org
                    var email = g_IRC.getNSEmail();
                    if (email == '')
                        return '';
                    command += ' ' + email;
                    break;
                case " ": break;//irc.swiftirc.net
                default: consoleError('array[i] = ' + array[i]); return '';
            }
        }
        return command;
    }
    g_IRC.onclickNSDrop = function () {
        //http://wiki.foonetic.net/wiki/Nickserv_Commands#Drop_a_Nickname
        consoleLog("IRC.onclickNSDrop()");
        var ns = document.getElementById('NSRegistering').IRC.ns;
        if (ns.unregister == undefined) {
            var params = '';
            if (ns.drop != undefined) params = g_IRC.NSCommandParams(ns.drop);
            if (params == '') {
                var NSPass = g_IRC.getNSPass();
                if (NSPass == '') return;
                params = ' ' + g_user.nickname + " " + NSPass
            }
            g_IRC.NSCommand("DROP" + params);
        } else {
            consoleLog('NSUnregister');
            var NSPass = g_IRC.getNSPass();
            if (NSPass == '') return;
            g_IRC.NSCommand("UNREGISTER " + NSPass);
        }
    }
    g_IRC.onclickNSIdentify = function () {
        consoleLog("IRC.onclickNSIdentify()");
        //http://wiki.foonetic.net/wiki/Nickserv_Commands#Identifying_.26_Retrieving_a_password
        var NSPass = g_IRC.getNSPass();
        if (NSPass == '') return;
        g_IRC.NSCommand("IDENTIFY " + NSPass);
    }
    g_IRC.getNSEmail = function () {
        var elNSEmail = document.getElementById("NSEmail");
        elNSEmail.onchange = null;
        CreateEmailFilter("NSEmail");
        if (!elNSEmail.ikf.customFilter(elNSEmail)) {
            elNSEmail.focus();
            delete elNSEmail.ikf;//фильтр нужно удалять после нажатия кнопки Register. иначе постоянно будет выскакивать сообщение что емайл введен неверно
            elNSEmail.onkeyup = null;
            elNSEmail.onchange = null;
            return '';
        }
        return elNSEmail.value;
    };
    g_IRC.onclickNSRegister = function () {
        consoleLog("IRC.onclickNSRegister()");
        var NSPass = g_IRC.getNSPass();
        if (NSPass == '') return;
        var elNSPass2 = document.getElementById("NSPass2");
        var NSPass2 = elNSPass2.value;
        if (NSPass2 == '') {
            inputKeyFilter.TextAdd(lang.typePassword//'Type password please'
                , elNSPass2, "downarrowdivred");
            elNSPass2.focus();
            return;
        }
        if (NSPass2 != NSPass) {
            alert(lang.passNotMatch);//Your new password entries did not match.
            elNSPass2.focus();
            return;
        }
        var email = g_IRC.getNSEmail();
        if (email == '')
            return;

        //http://wiki.foonetic.net/wiki/Nickserv_Commands#Registering_Nicknames
        var params = g_IRC.NSCommandParams(document.getElementById('NSRegistering').IRC.ns.register);
        if (params == '') params = ' ' + NSPass + " " + email;
        g_IRC.NSCommand("REGISTER" + params);
    };
    g_IRC.onclickIRCNickChange = function () {
        consoleLog("IRC.onclickIRCNickChange()");
        var elIRCNewNick = document.getElementById("IRCNewNick");
        var IRCNewNick = elIRCNewNick.value;
        if (IRCNewNick == '') {
            inputKeyFilter.TextAdd(lang.typeNewNick//'Type new nick please'
                , elIRCNewNick, "downarrowdivred");
            elIRCNewNick.focus();
            return;
        }
        //https://tools.ietf.org/html/rfc1459#section-4.1.2
        g_IRC.Command('NICK ' + IRCNewNick);

        onclickIRCNick();

        SetCookie("IRCNickname", IRCNewNick);
    };
    g_IRC.updateProfile2 = function (ircClient) { g_user.updateProfile(ircClient.User); }

    //syntax of Nickserv http://wiki.foonetic.net/wiki/Nickserv_Commands  and ChanServ http://wiki.foonetic.net/wiki/ChanServ_Commands commands
    // returns true if params is detected
    g_IRC.syntax = function (syntax, arCommandParams) {
//        if (syntax.match(/.* UNREGISTER .*/) != null) {
/*
            //NickServ UNREGISTER
            //"/msg AuthServ@Services.GameSurge.net UNREGISTER <password>"
            //Open irc.gamesurge.net and try unregister your nickname in Nickserv
            if (arCommandParams.unregister == undefined) {
                arCommandParams.unregister = {};
                document.getElementById('NSDrop').value = lang.IRC.unregister;//Unregister
            }
        } else */{
            //Connect to irc.rizon.net for testing of \037 code
            //Connect to irc.webmaster.com and open ChanServ Assistant for testing of ' #&lt;' code
            //Connect to irc.gamesurge.net and open ChanServ Assistant for testing of ' \[|\]' code
//            var arSyntax = syntax.split(/\037| &lt;| #&lt;|&gt;| \[|\]/);//&lt; is < and &gt; is >//ar[3].split(/.* DROP| \037|\037/)
//            var arSyntax = syntax.split(/\037| &lt;| #&lt;|&gt;/);//&lt; is < and &gt; is >//uncompatible with "/msg ChanServ UNREGISTER &lt;#channel&gt; [&lt;confirmation&gt;]" Open irc.gamesurge.net for testing
            var arSyntax = syntax.split(/\037|&lt;| #&lt;|&gt;/);//&lt; is < and &gt; is >//
            function params() {
                if (arSyntax.length <= 1) return null;
                var arParams = new Array,
                    optional = false;//true - Optional parameters
                for (i = 1; i < (arSyntax.length) ; i++) {
                    switch (arSyntax[i]){ 
                        case '':
                        case ' '://Connect to irc.webmaster.com and open ChanServ Assistant
                            continue;
                        case ' ['://Connect to irc.2600.net and open ChanServ Assistant for testing
                            if (optional) consoleError('optional = ' + optional);
                            optional = true;//Optional parameters
                            continue;
                    }
/*not compatible with irc.gamesurge.net : Syntax: REGISTER password [email]. Open ChanServ  Assistant for testing
                    if (arSyntax[i].indexOf(' [') == 0) {//Connect to irc.gamesurge.net and open ChanServ Assistant for testing
                        if (optional) consoleError('optional = ' + optional);
                        optional = true;//Optional parameters
                        continue;
                    }
*/
                    if (arSyntax[i].indexOf(']') == 0) {//Connect to irc.2600.net and open ChanServ Assistant for testing
                        if (!optional) consoleError('optional = ' + optional);
                        optional = false;
                        continue;
                    }
//                    var arOptional = arSyntax[i].split(/ \[|\]/);//not compatible with irc.rizon.net : Syntax: REGISTER password [email]. Open  Assistant for testing
                    var arOptional = arSyntax[i].split(/\[|\]/);
                    if (arOptional.length > 1) {//Optional parameters. Connect to irc.gamesurge.net and open ChanServ Assistant for testing
                                                //Connect to irc.rizon.net and open Nickserv Assistant for testing
                        var arParamsOptional = new Array;
                        arParamsOptional.name = 'optional';
                        for (j = 0; j < arOptional.length ; j++) {
                            if ((arOptional[j] == '') || (arOptional[j] == ' '))
                                continue;
                            arParamsOptional.push(arOptional[j]);
                        }
                        if (arParamsOptional.length == 0) consoleError('arParamsOptional.length = ' + arParamsOptional.length);
                        else arParams.push(arParamsOptional);
                        continue;
                    }
                    if (i != (arSyntax.length - 1)) {
                        if (optional) {//Optional parameters
                            var arParamsOptional = new Array;
                            arParamsOptional.name = 'optional';
                            arParamsOptional.push(arSyntax[i]);
                            arParams.push(arParamsOptional);
                            continue;
                        }
                        arParams.push(arSyntax[i]);
                    }
                }
                return arParams;
            }
            if (arSyntax[0].indexOf('DROP') != -1) {
                //"Syntax: DROP nickname"
                var arParams = params();
                if (arParams != null) arCommandParams.drop = arParams;
/*arCommandParams переписывается когда более одного раза вызыватся NickServ help <command>. Это присходит если вызвать ее вручную
                if (arParams != null) {
                    if (arCommandParams.drop != undefined) consoleError('arCommandParams.drop: ' + arCommandParams.drop);
                    arCommandParams.drop = arParams;
                }
*/
                return true;
            } else if (arSyntax[0].indexOf('UNREGISTER') != -1) {
                //"/msg AuthServ@Services.GameSurge.net UNREGISTER <password>"
                //Open irc.gamesurge.net and try unregister your nickname in Nickserv
                var arParams = params();
                if (arParams != null) arCommandParams.unregister = arParams;
/*arCommandParams переписывается когда более одного раза вызыватся NickServ help <command>. Это присходит если вызвать ее вручную
                if (arParams != null) {
                    if (arCommandParams.unregister != undefined) consoleError('arCommandParams.unregister: ' + arCommandParams.unregister);
                    arCommandParams.unregister = arParams;
                }
*/
                return true;
            } else if (arSyntax[0].indexOf('SENDPASS') != -1) {
                //Open irc.freenode.net and try password recovery in Nickserv
                var arParams = params();
                if (arParams != null) arCommandParams.sendpass = arParams;
/*arCommandParams переписывается когда более одного раза вызыватся NickServ help <command>. Это присходит если вызвать ее вручную
                if (arParams != null) {
                    if (arCommandParams.sendpass != undefined) consoleError('arCommandParams.sendpass: ' + arCommandParams.sendpass);
                    arCommandParams.sendpass = arParams;
                }
*/
                return true;
            } else if (arSyntax[0].indexOf('RESETPASS') != -1) {
                //Open irc.gamesurge.net and try password recovery in Nickserv
                var arParams = params();
                if (arParams != null) arCommandParams.resetpass = arParams;
/*arCommandParams переписывается когда более одного раза вызыватся NickServ help <command>. Это присходит если вызвать ее вручную
                if (arParams != null) {
                    if (arCommandParams.resetpass != undefined) consoleError('arCommandParams.resetpass: ' + arCommandParams.resetpass);
                    arCommandParams.resetpass = arParams;
                }
*/
                return true;
            } else if (arSyntax[0].indexOf('REGISTER') != -1) {
                var arParams = params();
                if (arParams != null) arCommandParams.register = arParams;
/*arCommandParams переписывается когда более одного раза вызыватся NickServ help <command>. Это присходит если вызвать ее вручную
                if (arParams != null) {
                    if (arCommandParams.register != undefined) consoleError('arCommandParams.register: ' + arCommandParams.register);
                    arCommandParams.register = arParams;
                }
*/
                return true;
            } else if (arSyntax[0].indexOf('TOPIC') != -1) {
                var arParams = params();
                if (arParams != null) arCommandParams.topic = arParams;
                return true;
            } else if (arSyntax[0].indexOf('INFO') != -1) {
                var arParams = params();
                if (arParams != null) arCommandParams.info = arParams;
                return true;
            }
        }
        return false;
    }
    g_IRC.NSSyntax = function (syntax) {
        var elNSRegistering = document.getElementById('NSRegistering');
        if (elNSRegistering.IRC == undefined)
            return;
        g_IRC.syntax(syntax, elNSRegistering.IRC.ns);

        var elNSDrop = document.getElementById('NSDrop');
        if ((elNSRegistering.IRC.ns.unregister != undefined) && (elNSDrop.value != lang.IRC.unregister))
            elNSDrop.value = lang.IRC.unregister;//Unregister
    }
    g_IRC.CSTopic = function (message) {
        var elCSAssistant = document.getElementById('CSAssistant');
        if (!elCSAssistant || (elCSAssistant.querySelector('.CSChannel').value != message.Message.Parameters[0]))
            return;
        inputKeyFilter.TextAdd(lang.topicUpdated//'Channel's topic was updated'
            , elCSAssistant.querySelector('#CSTopic'), "uparrowdivgreen", true);
    }
}
function IRCMessageError(message) { g_IRC.Reply(message); }
function onclickIRCJoin2(elParent, IRCChannelName, pass, disabled) {
    consoleLog("onclickIRCJoin2()");
    var elIRCJoin = elParent.querySelector('.IRCJoin');
    var expanded = ' expanded';
    if (elIRCJoin == null) {
        elIRCJoin = g_IRC.createJoin(IRCChannelName, undefined, disabled);
        elIRCJoin.className += expanded;
        elParent.insertBefore(elIRCJoin, elParent.childNodes[0]);
    } else {
        if (elIRCJoin.className.indexOf(expanded) == -1)
            elIRCJoin.className += expanded;
        else elIRCJoin.className = elIRCJoin.className.replace(expanded, '');
    }
    if (!elIRCJoin.disabledChannelName)
        elIRCJoin.scrollIntoView();
    return elIRCJoin;
}
function onclickIRCJoinRememberPass() {
    if (!event) event = window.event;
    var el = event.target || event.srcElement;
    SetCookie("IRCJoinRememberPass", el.parentElement.parentElement.querySelector('.IRCJoinRememberPass').checked);
}
function getAge(birthday) { return null; }
function onclickNSRegistering() {
    consoleLog("onclickNSRegistering()");
    var NSRegistering = 'NSRegistering';
    var res = onbranch(NSRegistering);
    var elNSRegistering = document.getElementById(NSRegistering);
    if (elNSRegistering) {
        if (elNSRegistering.IRC == undefined) elNSRegistering.IRC = {};
        if (elNSRegistering.IRC.ns == undefined) {
            g_IRC.help = 'ns';
            elNSRegistering.IRC.ns = {};
//            elNSRegistering.ns.register = {};
            g_IRC.NSCommand('help REGISTER');
            g_IRC.NSCommand('help UNREGISTER');
            g_IRC.NSCommand('help SENDPASS');
            g_IRC.NSCommand('help RESETPASS');
            g_IRC.NSCommand('help DROP');
        }
        elNSRegistering.scrollIntoView();
    }
    return res;
};
function onclickIRCNick() {
    consoleLog("onclickIRCNick()");
    var IRCNick = 'IRCNick';
    var res = onbranch(IRCNick);
    var elIRCNick = document.getElementById(IRCNick);
    if (elIRCNick)
        elIRCNick.scrollIntoView();
    return res;
};
function disable(isDisable) {
    document.getElementById("IRCSend").disabled = isDisable;
    document.getElementById("send").disabled = isDisable;
    if (!isDisable)
        $('#IRCSend').focus();
}
function onClickSend() {
    var elIRCSend = document.getElementById('IRCSend');
    var command = elIRCSend.value;
    if (command.length == 0) {
        inputKeyFilter.TextAdd(lang.IRCtypeCommand//'Type a command first'
            , elIRCSend, "downarrowdivred");
        elIRCSend.focus();
        return;
    }
    consoleLog("onClickSend(" + command + ")");
    g_IRC.Reply('[RAW]: ' + command);
    if ((command.length > 0) && (command[0] == '/'))
        command = command.substring(1);
    g_IRC.get(command);
    for (var i = 0; i < g_IRC.commandsArray.length; i++) {
        if (g_IRC.commandsArray[i] == command) {
            g_IRC.commandsArray.splice(i, 1);
            break;
        }
    }
    g_IRC.commandsArray.push(command);
    elIRCSend.value = '';
    g_IRC.commandsIndex = -1;
    return true;
}
function displayChatBody() {
    //    MessageElement("");
    document.getElementById("openpage").style.display = "none";
    document.getElementById("chatbody").style.visibility = "visible";
}
window.addEventListener("beforeunload", onbeforeunload);
//not compatible with Firefox
function onbeforeunload(e) {
    consoleLog('onbeforeunload(event)');
    if (!((typeof g_IRC.ircClient != 'undefined') && (g_IRC.ircClient.ServerHostname != '')))
        return null;
    else {
        var message = 'message';
        e.returnValue = message;
        return message;
    }
}
function removeInviter(inviter) {
    var elInvitation = document.getElementById('inviter' + inviter);
    elInvitation.parentElement.removeChild(elInvitation);
    removeInvitations();
}
function onChannelPageReady() { }
function deleteg_IRCuser() { return g_user; }