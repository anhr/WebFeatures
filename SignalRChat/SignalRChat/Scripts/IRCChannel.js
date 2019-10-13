/**
 * IRC channel page functions. Instead of IRCPrivate.js file
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
function unloadIRCPage() { if (g_IRC.connected) g_IRC.get('PART ' + g_chatRoom.RoomName); }
function createElementRoom(channel, tagName) { return createIRCRoom(channel, tagName); }
function getTitle(IRCChannel, IRCPrivateMessages) { return lang.joining.replace('%s', IRCChannel) + getWaitIconBase(); }//Joining to "%s" channel.
g_IRC.getParentUser = function (el) { return el.parentElement.parentElement.parentElement; }
g_IRC.onclickKick = function (event) {
    consoleLog('IRC.onclickKick()');
    if (!event) event = window.event;
    var el = event.target || event.srcElement;
    var elUser = g_IRC.getParentUser(el);
    var comment = elUser.querySelector('.comment').value;
    g_IRC.get('KICK ' + g_chatRoom.RoomName + ' ' + getUserElUser(elUser).nickname + ((comment == '') ? '' : ' :' + comment));
    elUser.querySelector('.kicked').innerHTML = getWaitIconBase();
}
g_IRC.onclickBan = function (event) {
    consoleLog('IRC.onclickBan()');
    if (!event) event = window.event;
    var el = event.target || event.srcElement;
    var elUser = g_IRC.getParentUser(el);
    var elBanMask = elUser.querySelector('.banMask');
    var banMask = elBanMask.value
    if (banMask == '') {
        inputKeyFilter.TextAdd(lang.typeMask//Please type a mask
            , elBanMask, "downarrowdivred");
        return;
    }
    g_IRC.get('MODE ' + g_chatRoom.RoomName + ' ' + (getUserElUser(elUser).ban ? '-' : '+') + 'b ' + banMask);
}
g_IRC.onclickChannelOperator = function (event) {
    consoleLog('IRC.onclickChannelOperator()');
    if (!event) event = window.event;
    var el = event.target || event.srcElement;
    var user = getUserElUser(g_IRC.getParentUser(el));
    //mode #channelname -o nickname
    g_IRC.get('MODE ' + g_chatRoom.RoomName + ' ' + (user.IRCuser.isChannelOperator() ? '-' : '+') + 'o ' + user.nickname);
}
g_IRC.onclickVoice = function (event) {
    consoleLog('IRC.onclickVoice()');
    if (!event) event = window.event;
    var el = event.target || event.srcElement;
    var user = getUserElUser(g_IRC.getParentUser(el));
    //mode #channelname -v nickname
    g_IRC.get('MODE ' + g_chatRoom.RoomName + ' ' + (user.IRCuser.isVoice() ? '-' : '+') + 'v ' + user.nickname);
}
g_IRC.UserMode = function (message, prefix, checkbox) {
    document.querySelectorAll('.IRCuser').forEach(function (elUser) {
        var user = getUserElUser(elUser);
        if (user.nickname == message.User.Nick) {
            var IRCuser = g_IRC.getIRCuser(user);
            if (!IRCuser)
                return;
            IRCuser.ChannelModes = message.User.ChannelModes;
            elUser.querySelector('.name').innerHTML = 
                (message.Add == '+' ?
                    (IRCuser.isChannelOperator() ? '@' : prefix)
                    : (IRCuser.isVoice() ? '+' : (IRCuser.isChannelOperator() ? '@' : '')))
                + getUserString({ IRCuser: message.User, nickname: message.User.Nick });
            var elCheckbox = elUser.querySelector('.' + checkbox);
            if (elCheckbox)
                elCheckbox.checked = message.Add == '+' ? true : false;
        }
    });
}
g_IRC.onChannelOperator = function (JSONmessage) {
    var message = JSONmessage;//JSON.parse(JSONmessage);
    consoleLog('IRC.onChannelOperator(Target: ' + message.Target + ', nick: ' + message.User.Nick + ', add: ' + message.Add + ')');
    this.UserMode(message, '@', 'channelOperator');
}
g_IRC.onVoice = function (JSONmessage) {
    var message = JSONmessage;//JSON.parse(JSONmessage);
    consoleLog('IRC.onVoice(Target: ' + message.Target + ', nick: ' + message.User.Nick + ', add: ' + message.Add + ')');
    this.UserMode(message, '+', 'voice');
}
g_IRC.isChannelOperator = function () {
    if (this.ChannelModes == undefined)
        return false;
    var channelMode = this.ChannelModes['ChatSharp.IrcChannel'];
    if (channelMode == undefined)
        return false;
    return channelMode.includes('o');
}
g_IRC.isVoice = function () {
    if (this.ChannelModes == undefined)
        return false;
    var channelMode = this.ChannelModes['ChatSharp.IrcChannel'];
    if (channelMode == undefined)
        return false;
    return channelMode.includes('v');
}
g_IRC.onChannelMode = function (message) {
    consoleLog('IRC.onChannelMode()');
    if (g_chatRoom.RoomName != message.Target) {
        consoleError('Invalid message.Target: ' + message.Target);
        return;
    }
    //example: blink2!~blink2@95.188.70.66 has set channel mode +p
    var array = [g_IRC.createUser({ nickname: message.User.Nick }, 'span')
        , lang.hasSetChannelMode //' has set channel mode '
            + message.Add + message.Mode + ' '
    ];
    if (message.Parameter != '') {

        //не всегда message.Parameter есть ник.
        //Например для бана message.Parameter равен Hostmask
        //array.push(g_IRC.createUser({ nickname: message.Parameter }, 'span'));

        array.push(message.Parameter);
    }
    AddMessageToChat(array);
}
g_IRC.onUserBanned = function (message) {
    consoleLog('IRC.onUserBanned(' + message + ')');
    var elBanner = g_IRC.createUser({ nickname: message.UserBanner.Nick }, 'span');
    var array = [elBanner
        , ' [' + message.UserBanner.Hostmask + ']' + lang.setMode//' has set mode '
            + message.Add + 'b ' + message.BannedUserHost
    ];
    var regexp = message.BannedUserHost.replace(/\*/gi, '.*');
    var boUserDetected = false;
    var ban = message.Add == '+';
    document.querySelectorAll('.IRCuser').forEach(function (elUser) {
        var user = getUserElUser(elUser);
        var IRCuser = g_IRC.getIRCuser(user);
        if (!IRCuser)
            return;
        if (IRCuser.Hostmask.match(regexp) != null) {
            if (!boUserDetected) {
                array.push((ban ? lang.hasBanned//' and banned of '
                        : lang.hasUnbanned) + ' '//' and removed ban of '
                );
                array.push(g_IRC.createUser({ nickname: user.nickname }, 'span'));
                boUserDetected = true;
            }

            user.ban = ban;
            userCorrect(elUser, ban);
            var elIRCWhois = elUser.querySelector('.IRCWhois');
            if (elIRCWhois)
                elIRCWhois.querySelector('.ban').style.visibility = ban ? 'visible' : 'hidden';
            var elControl = elUser.querySelector('.Control');
            if (elControl)
                elControl.querySelector('.banButton').value = ban ? lang.unban : lang.ban;
        }
    });
    AddMessageToChat(array);
}
g_IRC.onUserKicked = function (message) {
    consoleLog('IRC.onUserKicked(' + message.Kicked + ')');
    if (g_chatRoom.RoomName != message.Channel) {
        //it is not IRC channel web page
        this.onPartedChannel(message.Channel);
        return;
    }
    var elUser = this.getElUser(message.Channel, message.Kicked);
    elUser.parentElement.removeChild(elUser);
    var IRCuser = getUserElUser(elUser).IRCuser;
    var array = [];
    if (message.Kicked == g_user.nickname) {
        array.push(lang.youKicked.replace('%s', message.Channel));//'You have been kicked from %s by '
        g_chatRoom.IRCchannel.isKicked = true;
    } else {
        array.push(g_IRC.createUser({ nickname: message.Kicked }, 'span'));
        array.push(((typeof IRCuser == 'undefined') ? '' : ' [' + IRCuser.Hostmask + ']')
            + lang.kicked.replace('%s', message.Channel));// has been kicked from %s by
    }
    AddMessageToChat(array
        , { nickname: message.Kicker }//user
        , (message.Reason == '') ? '' : '. ' + lang.reason + ': ' + message.Reason//Reason
        , message.Channel);
    document.querySelectorAll('.IRCuser').forEach(function (elUser) {
        if (getUserElUser(elUser).nickname == message.Kicked) {
            var elKick = elUser.querySelector('.kick');
            if (elKick != null) {
                elKick.style.display = 'none';
                elUser.querySelector('.kicked').innerHTML = lang.kicked2;//'Kicked out of the channel'
            }
        }
    });
}
g_IRC.UserInChannel = function (options) {
    document.querySelectorAll('.IRCuser').forEach(function (elUser) {
        var disabled = typeof options.disabled == 'undefined' ? true : false;
        var user = getUserElUser(elUser);
        if (user.nickname == options.nickname) {
            var elControl = elUser.querySelector('.Control');
            if (elControl) {
                elControl.querySelector('.reply').innerHTML = options.RawMessage;
                elUser.querySelector('.Control').querySelectorAll('input').forEach(function (elInput) {
                    if((elInput.className != "banMask") && (elInput.className != "banButton")){
                        elInput.disabled = disabled;
/*
                        if(elInput.type == "checkbox")
                            elInput.checked = false;
*/
                    }
                });
            }
        }
    });
}
g_IRC.isJoinedChannel = function (WhoIsResponse, Nick) {
    var boJoined = false;
    for (i in WhoIsResponse.Channels) {
        if (WhoIsResponse.Channels[i] == g_chatRoom.RoomName)
            boJoined = true;
    }
    if (!boJoined) {
        consoleError('User ' + Nick + ' is not joined to ' + g_chatRoom.RoomName + ' channel.');
        g_IRC.userPartChannel(g_chatRoom.RoomName, Nick);
    }
}
g_IRC.UserMessageRecieved = function (receiver, sender, message) { }
g_IRC.goToPageName = function (receiver) { return '&Channel=' + encodeURIComponent(g_chatRoom.RoomName); }
function fTRoomName() { return g_chatRoom.RoomName; }
//Отрпавляем запрост на все открытые FileTransfer уже после того как открывается веб страница IRC канала.
function onChannelPageReady() { $.connection.chatHub.server.ircSendFileRequest(g_chatRoom.RoomName, g_user.id); }
