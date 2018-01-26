/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
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

function IRC() {
    this.elIRCConnectResponse = document.getElementById('IRCConnectResponse');
    this.browserID;//идентификатор IRC сервера. Это key в списке IRC серверов SignalRChat.ChatHub.IRCClients
    // Это продублировано в MyIrcClient.Key

    this.onGUID = function (guid){
        this.browserID = guid;
    }
    this.Connect = function () {
        var elIRCURL = document.getElementById("IRCURL");
        var IRCURL = elIRCURL.value;
        if (IRCURL == '') {
            inputKeyFilter.TextAdd(lang.IRCURLError//'Invalid IRC Server URL'
                , elIRCURL, "downarrowdivred");
            return;
        }

        var elIRCPort = document.getElementById("IRCPort");
        var IRCPort = elIRCPort.value;
        var elIRCNickname = document.getElementById("IRCNickname");
        if (elIRCNickname.value == '') {
            inputKeyFilter.TextAdd(lang.typeNickname//'Type your nickname please'
                , elIRCNickname, "downarrowdivred");
            return;
        }
        var user = {};// = g_user;//нельзя просто приравнивать к g_user потомучто будет неправильный g_user.nickname
        user.browserID = this.browserID;
        user.nickname = elIRCNickname.value;
        user.firstName = document.getElementById("IRCFullName").value;
        while ((user.firstName.length > 0) && (user.firstName[0] == '~'))
            user.firstName = user.firstName.substring(1);
        user.secondName = '';
        user.realName = document.getElementById("IRCRealName").value;
        user.password = document.getElementById("IRCPass").value;
        consoleLog('IRC.Connect() ' + IRCURL + ', ' + IRCPort);
        if (IRCPort == '')
            IRCPort = "0";
        $.connection.chatHub.server.ircConnect(IRCURL, IRCPort, JSON.stringify(user), JSON.stringify({
            Name: document.getElementById("IRCGroupName").value
            , ServerName: document.getElementById("IRCServerName").value
        }));
        this.elIRCConnectResponse.innerHTML = getWaitIconBase(' title="' + lang.IRCWaitConnectipn + '"');//Waiting for IRC server connection to complete
        document.getElementById('IRCConnectError').innerHTML = '';
    }
    this.onIsConneted = function (e) {
        consoleLog('g_IRC.onIsConneted()');
        var elIRCURL = document.getElementById("IRCURL");
        inputKeyFilter.TextAdd(lang.IRCServerUsed//'Server in use'
            , elIRCURL, "downarrowdivred");
        this.MessageError3(lang.IRCServerUsed2.replace('%s', elIRCURL.value));//'Server %s in use. Please select another server or close the server's web page.'
    }
    this.onclickOpenServerPage = function () {
        consoleLog('g_IRC.onclickOpenServerPage()');
        this.elIRCConnectResponse.innerHTML = '';
        this.connected = false;//соединение с IRC сервером
        this.сonnectionComplete = false;//успешное соединение с IRC сервером
        this.IRCDisabled();
    }
    loadScript("../SignalRChat/Scripts/IRCCommon.js", function () {
        IRCInitCommon();
    });
    this.MessageError3 = function (message) {
        g_IRC.elIRCConnectResponse.innerHTML = '';
        var elError = document.createElement('div');
        elError.innerHTML = message;
        document.getElementById('IRCConnectError').appendChild(elError);
        elError.scrollIntoView();
    }
    this.MessageError2 = function (message) {
        this.MessageError3(message);
        if (g_IRC.connected) {
            g_IRC.Disconnect();
        }
        else {
            document.getElementById('IRCToggle').disabled = false;
            this.IRCDisabled();
            $.connection.chatHub.server.ircRemove(this.browserID);
        }
    }
    this.Reply = function (message, element) { this.MessageError3(message); }
    this.IRCDisabled = function () {
        var elInputs = document.getElementById("IRCOptions").querySelectorAll('input');
        for (var i = 0; i < elInputs.length; i++) {
            if (elInputs[i].id == 'IRCToggle')
                continue;
            elInputs[i].disabled = this.connected;
        }

        var elIRCSend = document.getElementById("IRCSend");
        if (elIRCSend)
            elIRCSend.disabled = !this.connected;
        var elIRCToggle = document.getElementById("IRCToggle");
        elIRCToggle.value = this.connected ? lang.disconnect : lang.connect;
//        elIRCToggle.disabled = this.connected;
    }
    this.IRCDisabledBase = function () {
        document.getElementById("IRCSend").disabled = !this.connected;
        this.Reply('');
        var reply;
        if (this.connected) {
            var port = document.getElementById("IRCPort").value;
            if (port != '')
                port = ':' + port;
            if (this.сonnectionComplete)
                reply = lang.connectedTo;//'Connected to'
            else reply = lang.connectingTo;//Connecting to
            reply += ' ' + document.getElementById("IRCURL").value + port;
        } else reply = lang.discinnected;//Discinnected
        this.Reply(reply, 'b');//Connecting to 
    }
    this.NickChanged = function (newNick) {
        var elIRCNickname = document.getElementById("IRCNickname");
        if (elIRCNickname.value != newNick)
            this.elIRCConnectResponse.innerHTML = lang.nickChanged + ' ' + newNick;//Nick changed to 
    }
    this.NickInUse = function (message) {
        this.MessageError2(getErrorTag(message));
        inputKeyFilter.TextAdd(message, document.getElementById('IRCNickname'), "downarrowdivred");
    }
    this.ConnectToggle = function () {
        if (this.connected) {
            this.Disconnect();
            return;
        }
        this.Connect();
    }
    this.ConnectSuccess = function () {
        document.getElementById("IRCToggle").disabled = false;
        var URL = document.getElementById("IRCURL").value;
        SetCookie("IRCURL", URL);
        SetCookie("IRCPort", document.getElementById("IRCPort").value);
        SetCookie("IRCGroupName", document.getElementById("IRCGroupName").value);
        SetCookie("IRCServerName", document.getElementById("IRCServerName").value);
        var nickname = document.getElementById("IRCNickname").value;
        SetCookie("IRCNickname", nickname);
        SetCookie("IRCFullName", document.getElementById("IRCFullName").value);
        SetCookie("IRCRealName", document.getElementById("IRCRealName").value);

        var pass = '';
        if (document.getElementById("IRCRememberPass").checked)
            pass = document.getElementById("IRCPass").value;
        SetCookie("IRCPass", pass);

        g_IRC.NickChanged(nickname);
        g_IRC.сonnectionComplete = true;
        var q = new QueryString();
        var channel = q.value('Channel');
        var privateMsg = q.value('Private');
        window.location = getOrigin() + '/SignalRChat?IRCServer=' + encodeURIComponent(g_IRC.browserID)
         + (channel == undefined ?
            (privateMsg == undefined ? '' : '&Private=' + encodeURIComponent(privateMsg))
            : '&Channel=' + encodeURIComponent(channel));
    }
    this.onDisconnected = function (e) {
        consoleLog('IRC.onDisconnected(' + e + ')');
        this.elIRCConnectResponse.innerHTML = '';
        var el = document.createElement('div');
        el.innerHTML = '😞 ' + e;//Disconnected
        document.getElementById('IRCConnectError').appendChild(el);
        el.scrollIntoView();
        this.Disconnected();
    }
    this.Disconnected = function () {
        this.connected = false;
        this.сonnectionComplete = false;
        this.IRCDisabled();
        document.getElementById("IRCRememberPass").disabled = (document.getElementById("IRCPass").value == '') ? true : false;
    }
    this.onNickChanged = function (oldNick, newNick, Hostmask) {
        consoleLog('IRC.onNickChanged(oldNick: ' + oldNick + ', newNick: ' + newNick + ')');
        document.getElementById('IRCNickname').value = newNick;
    }
    this.onErrorMessage = function (e) { consoleError(e.Message.RawMessage); }
}
var g_IRC;
var defaultIRCPort = '6667';
function IRCInit() {
    g_IRC = new IRC();

    //идентификатор IRC сервера беру после попытки соединения с IRC сервером $.connection.chatHub.server.ircConnect
    //$.connection.chatHub.server.getGUID();

    var q = new QueryString();

    document.getElementById("IRCChatHeader").innerHTML = lang.IRCChatHeader;//You can connect to any IRC server. Videoconferencing and file sharing are only available with visitors who use our site as a web-based IRC client.

    document.getElementById("IRCURLLabel").innerHTML = lang.IRCURLLabel + ": ";//IRC Server URL
    var IRCURL = q.value('IRCURL');
    document.getElementById("IRCURL").value = IRCURL == undefined ? get_cookie("IRCURL") : IRCURL;

    document.getElementById("IRCPortLabel").innerHTML = lang.IRCPortLabel + ": ";//Port
    var elIRCPort = document.getElementById("IRCPort");
    elIRCPort.title = lang.IRCPortTitle + defaultIRCPort;//'IRC Server Port. Can be empty. Default: '
    var IRCPort = q.value('IRCPort');
    elIRCPort.value = IRCPort == undefined ? get_cookie("IRCPort", defaultIRCPort) : IRCPort;

    var elIRCPortDefault = document.getElementById("IRCPortDefault");
    if (elIRCPortDefault != null)
        elIRCPortDefault.value = lang.defaultString;//Default

    document.getElementById("IRCToggle").value = lang.connect;//Connect

    document.getElementById("IRCServersListHeader").innerHTML = lang.IRCServers;//IRC Servers
    document.getElementById("IRCHeaderAdditionally").innerHTML = lang.additionally;//Additionally

    document.getElementById("IRCNicknameLabel").innerHTML = lang.nickname + ": ";//Nickname
    var nickname = q.value('Nickname');
    document.getElementById("IRCNickname").value = nickname == undefined ? get_cookie("IRCNickname", g_user.nickname) : nickname;

    document.getElementById("IRCGroupNameLabel").innerHTML = lang.IRCGroup + ": ";//IRC Group
    document.getElementById("IRCGroupName").value = IRCURL == undefined ? get_cookie("IRCGroupName") : '';

    document.getElementById("IRCServerNameLabel").innerHTML = lang.IRCServerName + ": ";//IRC Server Name
    document.getElementById("IRCServerName").value = IRCURL == undefined ? get_cookie("IRCServerName") : '';

    document.getElementById("IRCFullNameLabel").innerHTML = lang.fullName + ": ";//User Name
    var strFullName = '';
    if (typeof g_user.firstName != 'undefined')
        strFullName = g_user.firstName;
    if ((typeof g_user.firstName != 'undefined') && (g_user.firstName != '') && (typeof g_user.secondName != 'undefined') && (g_user.secondName != ''))
        strFullName += " ";
    if (typeof g_user.secondName != 'undefined')
        strFullName += g_user.secondName;
    if (strFullName == "")
        strFullName = g_user.nickname;
    document.getElementById("IRCFullName").value = get_cookie("IRCFullName", strFullName);

    document.getElementById("IRCRealNameLabel").innerHTML = lang.realName + ": ";//Real Name
    document.getElementById("IRCRealName").value = get_cookie("IRCRealName", g_user.nickname);

    document.getElementById("IRCPassLabel").innerHTML = lang.pass + ": ";//Password for registered users
    var pass = get_cookie("IRCPass");
    var elIRCRememberPass = document.getElementById("IRCRememberPass");
    if (get_cookie("IRCRememberPass", "false") == 'true') {
        document.getElementById("IRCPass").value = pass;
        elIRCRememberPass.checked = true;
    } else elIRCRememberPass.checked = false;
    elIRCRememberPass.disabled = pass == '' ? true : false;
    document.getElementById("IRCRememberPassLabel").innerHTML = lang.rememberPassLabel;//Remember password
}
function onclickIRCServersList() {
    consoleLog("onclickIRCServersList()");
    onbranchFast('IRCServersList', 'branchIRCServersList');
    if (document.getElementById('IRCServersList').childNodes.length == 0) {
        var elIRCServersList = document.getElementById('IRCServersList');
        elIRCServersList.wait = true;
        elIRCServersList.innerHTML = getWaitIconBase();
        $.connection.chatHub.server.ircServers();
    }
    return false;
};
function onIRCGroup(IRCGroup) {
    consoleLog('IRC Group: ' + IRCGroup.Name);
    var elIRCGroup = document.createElement('div');
    elIRCGroup.innerHTML =
          '<a href="#" onclick="javascript: return onclickIRCGroup(this)">'
            + '<span id="branchIRCGroup">▶</span>'
            + '<span >' + (IRCGroup.Name == '' ? '____' : IRCGroup.Name) + '</span>'
        + '</a>'
        + '<div id="IRCServers" class="b-toggle"></div>'
    ;
    var elIRCServersList = document.getElementById('IRCServersList');
    if (elIRCServersList.wait) {
        elIRCServersList.innerHTML = '';
        elIRCServersList.wait = false;
    }
    elIRCServersList.appendChild(elIRCGroup);
    var elIRCServers = elIRCGroup.querySelector('div');//'#IRCServers');not compatible with Safari
    //    for (var IRCServer of IRCGroup.DBIRCServers)not compatible with Safari
    IRCGroup.DBIRCServers.forEach(function (IRCServer, index, array) {
        //        var IRCServer = IRCGroup.DBIRCServers[i];
        consoleLog('  IRC Server: ' + IRCServer.URL);
        var elIRCServer = document.createElement('div');
        elIRCServer.className = 'pointer';
        elIRCServer.onclick = onclickIRCServer;
        elIRCServer.IRCServer = {
            URL: IRCServer.URL
            , Port: IRCServer.Port
            , GroupName: IRCServer.GroupName
            , Name: IRCServer.Name
        }
        elIRCServer.style.marginLeft = '5px';
        elIRCServer.innerHTML = ((IRCServer.Name == null ? '' : IRCServer.Name) + ' (' + IRCServer.URL + ')');
        elIRCServers.appendChild(elIRCServer);
    });
};
function onclickIRCServer() {
    consoleLog("onclickIRCServer()");
    if (g_IRC && g_IRC.connected)
        return;
    document.getElementById('IRCURL').value = this.IRCServer.URL;
    document.getElementById('IRCPort').value = this.IRCServer.Port;
    document.getElementById('IRCGroupName').value = this.IRCServer.GroupName;
    document.getElementById('IRCServerName').value = this.IRCServer.Name;
    onclickIRCServersList();
};
function onclickIRCGroup(a) {
    consoleLog("onclickIRCGroup()");
    return onbranchelementBase(a.nextElementSibling//a.parentElement.querySelector('#IRCServers')
        , a.childNodes[0].childNodes[0]//a.querySelector('#branchIRCGroup')
        );
};
function onclickIRCAdditionally() {
    consoleLog("onclickIRCAdditionally()");
    return onbranch('IRCTableAdditionally', 'branchIRCAdditionally');
};
function onclickIRCPortDefault() {
    consoleLog("onclickIRCPortDefault()");
    document.getElementById('IRCPort').value = defaultIRCPort;
};
function onkeyupIRCPass() {
    //consoleLog('onkeyupIRCPass()');
    document.getElementById("IRCRememberPass").disabled = document.getElementById("IRCPass").value == '' ? true : false;
}
function onclickIRCRememberPass() {
    consoleLog('onclickIRCRememberPass()');
    SetCookie("IRCRememberPass", document.getElementById("IRCRememberPass").checked);
}
function init() { }
