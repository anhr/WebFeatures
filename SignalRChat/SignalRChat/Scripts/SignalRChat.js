/**
 * SignalRChat functions. Instead of IRCChat.js file
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

function SignalRChatTest() {
    if (document.querySelector('head').querySelector('#Scripts\\/IRCChat\\.js') == null)
        return;
    consoleError('SignalRChat.js is not compatible with IRCChat.js');
}
SignalRChatTest();
var send = document.getElementById("send");
send.value = isRussian() ? "Отправить" : "Send";
g_user.query = function () {
    var queryString = new QueryString();
    var browserID = queryString.value('browserID');
    if (typeof browserID != 'undefined') {
        g_user.browserID = browserID;
        return;
    }
    var JSONuser;
    if (navigator.cookieEnabled)
        JSONuser = get_cookie("User");
    else JSONuser = queryString.value('user');
    if (JSONuser == '') {
        consoleError('JSONuser = ' + JSONuser);
        alert('Invalud user')
        return;
    }
    if (typeof JSONuser == 'undefined') {
        consoleError('g_user.query() failed!');
        return;
    }
    g_user.updateProfile(JSON.parse(JSONuser));
}
function init() {
    $.connection.chatHub.server.getNickname(g_user.browserID);
    getRooms();
}
function init2() {
    if (g_user.browserID == "") {
        //alert('$.connection.hub.start().done failed! g_user.browserID == ""');
        gotoChatPage();
        return;
    }
    //http://metanit.com/sharp/mvc5/16.2.php
    // обработка логина
    g_user.browser = DetectRTC.browser;
    g_user.isMobileDevice = DetectRTC.isMobileDevice;
    g_user.os = {
        name: DetectRTC.osName
        , version: DetectRTC.osVersion
    };
    $.connection.chatHub.server.connect(JSON.stringify(g_user), JSON.stringify(g_chatRoom));
}
function editorKey(keyCode) {
    if (typeof g_user.id == 'undefined') {
        consoleError('editorKey(' + keyCode + ') failed! g_user.id = ' + g_user.id);
        return;
    }
    $.connection.chatHub.server.editorKey(g_chatRoom.RoomName, g_user.id, keyCode);
}
function onEditorKey(userId, keyCode) {
    //                    consoleLog('chat.client.onEditorKey(' + userId + ', ' + keyCode + ')');
    var elementEventKey = document.getElementById('chatusers').querySelector('#' + CSSescape(userId)).querySelector('.eventKey');
    elementEventKey.style.display = 'inline'
    elementEventKey.intervalKey = function () {
        //consoleLog('elementEventKey.intervalKey');
        if (this.innerHTML == '. ')
            this.innerHTML = ' .';
        else this.innerHTML = '. ';
    }
    elementEventKey.setTimeoutKey = function () {
        window.setTimeout(function () { elementEventKey.timeoutKey.call(elementEventKey) }, 2000);
        this.displayEventKey = true;
        if (!elementEventKey.intervalID)
            elementEventKey.intervalID = window.setInterval(function () { elementEventKey.intervalKey.call(elementEventKey) }, 300);
    }
    elementEventKey.timeoutKey = function () {
        //                        consoleLog('elementEventKey.timeoutKey');
        if (elementEventKey.displayEventKeyContinue) {
            elementEventKey.setTimeoutKey();
            elementEventKey.displayEventKeyContinue = false;
            return;
        }
        elementEventKey.style.display = 'none'
        elementEventKey.displayEventKey = false;
        window.clearInterval(elementEventKey.intervalID);
        delete elementEventKey.intervalID;
    }
    if (!elementEventKey.displayEventKey) {
        elementEventKey.setTimeoutKey();
    } else elementEventKey.displayEventKeyContinue = true;
}
function SendMessage(data, value) {
    $.connection.chatHub.server.send(g_chatRoom.RoomName, JSON.stringify(g_user), data);
}
function isIgnore(id) {
    var ignore = document.getElementById('chatusers').querySelector('#' + CSSescape(id)).querySelector('.ignore');
    if (ignore && ignore.checked)
        return true;
    return false;
}

function getUserInfo(elementParent) {
    var user = getUserFromChatUsers(elementParent);
    var userInfo = '';
    if (((user.firstName != null) && (user.firstName != '')) || ((user.secondName != null) && (user.secondName != '')))
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.name + ':</span></td>'//'Name'
            + '<td style="border:0px">'
                + ((user.firstName == null) ? '' : user.firstName) + ' ' + ((user.secondName == null) ? '' : user.secondName)
            + '</td></tr>';
    if (user.birthday && (user.birthday != ''))
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.age + ':</span></td>'//'Age'
            + '<td style="border:0px" id="age">' + getAge(user.birthday) + '</td></tr>';
    var gender = getGenderString(user);
    if (gender.gender != '')
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.gender + ':</span></td>'//'Gender'
            + '<td style="border:0px">' + gender.gender + ' ' + gender.title + '</td></tr>';

    //visitor's local time
    elementParent.visitorLocalTime = {
        timezoneShift: new Date().getTimezoneOffset() - user.timezoneOffset
        , interval: function () {
            //consoleLog("setInterval. visitor's local time");
            var date = new Date(new Date().setMinutes(new Date().getMinutes() + this.visitorLocalTime.timezoneShift));
            var elVisitorLocalTime = this.querySelector('#visitorLocalTime');
            if (elVisitorLocalTime)
                elVisitorLocalTime.innerHTML
                    //toLocaleTimeString() иногда возвращает время, которое отличается от toTimeString() непонятно почему.
                    //Может быть это связано с летним временем
                    //Я заметил что на моем Server 2012R2 неправильно указана time zone для Москвы (+4 вместо +3) и Красноярска
                    //= date.toLocaleTimeString();
                    //сейчас время выводится без учета региональных особенностей
                    = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
    }
    var hoursDifference = parseInt(elementParent.visitorLocalTime.timezoneShift / 60);
    elementParent.timeoutId = window.setInterval(function () { elementParent.visitorLocalTime.interval.call(elementParent) }, 1000);
    userInfo += '<tr title="' + lang.visitorTime + '"><td style="border:0px"><span style="float:right">' + lang.time + ':</span></td>'//'visitor's local time'
        + '<td style="border:0px">'
            + '<span id="visitorLocalTime"></span>'
            + '<span>' + ((hoursDifference == 0) ? '' : ('. ' + lang.hoursDifference.replace('%s', hoursDifference))) + '</span> '
        + '</td></tr>';

    if (user.browser)
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.browser + ':</span></td>'//'Browser'
            + '<td style="border:0px">' + user.browser.name + ' ' + user.browser.version + '</td></tr>';

    if (user.os)
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.os + ':</span></td>'//'OS'
            + '<td style="border:0px">' + user.os.name + ' ' + ((user.os.version == -1) ? '' : user.os.version) + '</td></tr>';

    if (typeof user.isMobileDevice != 'undefined')
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.device + ':</span></td>'//'Device'
            + '<td style="border:0px">' + ((user.isMobileDevice == true) ? lang.mobile : lang.desktop) + '</td></tr>';

    //location
    if (user.location && (user.location != ''))
        userInfo += '<tr><td style="border:0px"><span style="float:right">' + lang.location + ':</span></td>'//'Location'
            + '<td style="border:0px" id="location">' + user.location + '</td></tr>';

    if (userInfo != '')
        userInfo = '<table style="width:auto"><tbody>' + userInfo + '</tbody></table>'

    //Geolocation
    if (user.position)
        userInfo +=
                  '<a href="#" onclick="javascript: return onclickGeolocation(event)">'
                    + '<span id="branchGeolocation">▶</span>'
                    + '<span>' + lang.geolocationPrompt + '</span>'//Geolocation
                + '</a>'
            + '<div id="geolocation" class="b-toggle">'
                + '<div id="mapContainer" class="blok" style="margin:5px;" onresize></div>'
            + '</div>';

    //aboutMe
    if (user.aboutMe && (user.aboutMe != ''))
        userInfo += '<div>' + lang.aboutMe + ': '//'About Me'
            + user.aboutMe + '</div>';

    if (userInfo != '')
        userInfo += '<hr>'

    //ignore
    var checked;
    if (user.ignore)
        checked = 'checked';
    else checked = '';
    userInfo += '<div><input type="checkbox" ' + checked + ' onclick="onclickIgnore()" class="ignore"/>' + lang.ignore + '</div>'//Ignore

    return userInfo;
}

function createElementUser(user, id, boSaveUser, roomName) {
    var tagName;
    if (typeof tagName == 'undefined')
        tagName = 'span';
    var elementParent = document.createElement(tagName);
    elementParent.id = id;
    if (boSaveUser)
        elementParent.user = user;
    else elementParent.userId = user.id;
    elementParent.appendChild(myTreeView.createBranch(
    {
        name:
              '<span class="eventKey" style="display:none" title="' + lang.pressKey + '">. </span>'//The visitor is typing text
            + getUserString(user),
        tagName: tagName,
        params:
        {
            createBranch: function () {
                var element;
                //добавляем окно пользователя
                var userName = user.nickname;
                var id = user.id;
                consoleLog('User onclick id = ' + id + ', userName = ' + userName);

                element = document.createElement("div");
                element.className = "gradient elementUser";
                var inviteToCurrentChat = "";
                if (roomName != g_chatRoom.RoomName)
                    inviteToCurrentChat =
                          '<div>'
                            + '<input type="text" id="invitationText' + id + '" style="margin:5px;" placeholder="' + lang.invitationsText + '" />'//Invitations text
                            + '<input type="button" onclick="javascript: return onInvitation(\'' + id + '\', \'' + userName + '\')"'
                            + ' id="inviteButton' + id + '"'
                            + ' value="' + lang.invite + '"'//Invite
                            + ' title="' + lang.inviteTo.replace("%s2", g_chatRoom.RoomName).replace("%s", userName) + '"'//Invite %s user to the %s2 room
                            + ' />'
                            + '<span id="invitationResponse' + id + '" style="margin:5px;"></span>'
                        + '</div>'
                ;
                var userInfo = getUserInfo(elementParent);
                if (userInfo != '')
                    userInfo = '<span id="userInfo">' + userInfo + '</span>'

                element.innerHTML =
                      userInfo
                      + inviteToCurrentChat
                      + '<span class="triangle">▶</span>'
                      + '<span class="pointer" onclick="javascript: onClickPrivate(event)"'
                          + ' title="' + lang.privateTitle.replace("%s", userName) + '"'//Invite %s for a private chat
                      + ' />'
                        + lang.privateUser//Private
                      + '</span>'
                ;
                elementParent.appendChild(element);
                if ((g_chatRoom.privateRoomName == roomName) && this.boAddUser) {
                    document.getElementById("invitationResponse" + id).innerHTML = getWaitIcon();
                }
                //здесь сделал задержку 100 мс. для того что бы сработал g_elementExpandedClass.scrollIntoView()
                //когда открывается приватная комната и я хочу чтобы было видно окно посетителя, который приглашен для привата.
                //Можно было бы вызывать g_elementExpandedClass.scrollIntoView() сразу когда тег "chatbody" становится видимым:
                //document.getElementById("chatbody").style.visibility = "visible";
                //но я не могу найти место где это делается
                setTimeout(function () {
                    element.scrollIntoView();
                }, 100);
                return element;
            }
        }
    }));
    return elementParent;
}
function createElementMyUser() {
    var a = document.createElement("a");
    a.innerHTML = getUserString(g_user);
    if ((typeof g_user.browserID == 'undefined') || (g_user.browserID == '')) {
        consoleError("createElementMyUser() failed! g_user.browserID is undefined");
    }
    a.href = '../chat/?browserID=' + g_user.browserID + '&chatRoom=' + encodeURIComponent(g_chatRoom.RoomName);
    a.target = "_blank";
    a.title = lang.myProfile;//My profile
    return a;
}
function documentTitlePrefix() { return g_chatRoom.isPrivate() ? lang.strPrivate + ' ' : '' }//private
function getElementBefore(ConnectionIDBefore) {
    if ((typeof ConnectionIDBefore == 'undefined') || (ConnectionIDBefore == ''))
        return null;
    var elementBefore = null;
    var elChatusers = document.getElementById('chatusers');
    if (typeof elChatusers.querySelector != 'undefined')//for ie5
        elementBefore = elChatusers.querySelector('#' + CSSescape(ConnectionIDBefore));
    if (elementBefore)
        elementBefore = elementBefore.parentElement;
    return elementBefore;
}
function onclickRooms() {
    consoleLog("onclickRooms()");
    return onbranchFast('roomsListBranch', 'branchRooms');
};

function onClickGoToRoom(e) {
    if (!e) e = window.event;
    var elementGoToRoom = e.target || e.srcElement;
    consoleLog("onClickGoToRoom(" + elementGoToRoom + ")");

    var roomName = elementGoToRoom.parentElement.parentElement.roomName;

    //ATTENTION!!! do not use browserID instead of UserBrowserID because browserID is reserved param
    var response = getSynchronousResponse("XMLHttpRequest.aspx?isVisitingRoom=" + encodeURIComponent(roomName) + "&UserBrowserID=" + g_user.browserID);
    switch (response) {
        case "0": {
            consoleLog('You can vizit into "' + roomName + '" room.');
            //Открыть новую вкладку браузера можно только тут
            window.open(getOrigin() + "/SignalRChat?browserID=" + g_user.browserID + "&chatRoom=" + encodeURIComponent(roomName), '_blank');
            return;
        }
        case "1": {
            var message = lang.duplicateUsernameInRoom.replace("%s", roomName);//You are already in the "%s" room
            consoleLog(message);
            inputKeyFilter.TextAdd(message, elementGoToRoom, "downarrowdivred");
            return;
        }
        default: consoleError("Response: " + response);
    }
}

function openRoomBranch(itemRoom) {
    consoleLog("openRoomBranch(" + itemRoom + ")");

    if ((itemRoom.className != "pointer") || (itemRoom.tagName != "SPAN")) {
        consoleError("openRoomBranch(" + itemRoom + ") failed! invalid itemRoom");
        return;
    }

    var roomName = itemRoom.innerHTML;
    var elementParent = itemRoom.parentElement;
    var triangle = '▼';

    if (getElementByClassName(elementParent, "elementRoom") == null) {
        //добавляем окно комнаты
        consoleLog('Ctreate elementRoom: "' + roomName + '"');

        var element = document.createElement("div");
        element.className = "elementRoom b-toggle expanded";
        element.roomName = roomName;
        element.innerHTML =
                '<div class="branch gradient_gray">'
            + ' <input type="button" onclick="javascript: onClickGoToRoom(event)"'
                + ' title="' + lang.gotoRoom.replace("%s", roomName) + '"'//'Go to "%s" room'
            + '     value=' + lang.join//Join//.go//'Go'
            + ' />'
            + ' <hr>'
            + ' <h2 style="margin-top:5px;" title="' + lang.roomUsers.replace("%s", roomName) + '">' + lang.users + '</h2>'
            + ' <div id="Users' + roomName + '" class="branch"></div>'
            + '</div>'
        ;
        elementParent.appendChild(element);
        $.connection.chatHub.server.getRoomUsers(roomName);
    } else {
        //var element = elementParent.getElementsByClassName("elementUser")[0].childNodes[0];Do not support by IE 8
        var element = getElementByClassName(elementParent, 'elementRoom');
        var expanded = ' expanded';
        if (element.className.indexOf(expanded) == -1)
            element.className += " expanded";//показать окно комнаты
        else {
            element.className = element.className.replace(expanded, '');//скрыть окно комнаты
            triangle = '▶';
        }
    }
    //elementChatUsers.getElementsByClassName('triangle')[0].innerText = triangle;Do not support by IE 8
    getElementByClassName(elementParent, 'triangle').innerText = triangle;
}

function onclickItemRoom(e) {
    if (!e) e = window.event;

    //http://javascript.ru/forum/events/28424-kak-otmenit-sobytie-roditelya.html
    e.cancelBubble = true;

    openRoomBranch(e.target || e.srcElement);
}
function setRoomsCount() { document.getElementById("roomsCount").innerHTML = document.getElementById("roomsList").querySelectorAll('.room').length; }
//ATTENTION!!! Also see createElementRoom in G:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\Chat\Default.aspx
function createElementRoom(room) {
    var objectRoom = createElRoomSignalR(room);
    if ((g_chatRoom.RoomName == room.RoomName) || room.isPrivate)
        objectRoom.elRoom.innerHTML = room.RoomName + objectRoom.elUsersCount;
    else objectRoom.elRoom.innerHTML = '<span class="triangle">▶</span><span class="pointer" onclick="javascript: onclickItemRoom(event)">'
        + room.RoomName + '</span>' + objectRoom.elUsersCount;
    return objectRoom.elRoom;
}
function onRooms(rooms) {
    consoleLog('onRooms()');
    var el = document.getElementById("roomsList");
    el.innerHTML = '';
    rooms.forEach(function (room) { el.appendChild(createElementRoom(room)); });
    setRoomsCount();
    if (g_chatRoom.privateUserId != '') {
        //Может приватная комната вызываемого посетителя уже открыта?
        var response = getSynchronousResponse("XMLHttpRequest.aspx?isVisitingRoom=" + encodeURIComponent(g_chatRoom.RoomName)
            + "&UserBrowserID=" + g_chatRoom.privateUserId);
        switch (response) {
            case "0": {
                $.connection.chatHub.server.getUsersRoom(g_chatRoom.privateUserId, g_chatRoom.RoomName, g_user.browserID);//открыть свойства пользователя, для которого была открыта приватная комната
                break;
            }
            case "1": {//is open
                break;
            }
            default: consoleError("Response: " + response);
                return;
        }
    }
}
function getRooms() {
    document.getElementById("rooms").style.display = "block";
    document.getElementById("roomsHeader").innerHTML = lang.rooms;//Rooms
    $.connection.chatHub.server.getRooms();
}
//открыть свойства пользователя, для которого была открыта приватная комната если у этого пользователя приват еще не открыт
function onUsersRoom(roomName, connectionID, PrivateID, PrivateRoomName) {
    consoleLog("onUsersRoom(" + roomName + ", " + connectionID + ")");
    g_chatRoom.privateRoomName = roomName;
    onclickRooms();
    var roomsList = document.getElementById("roomsList");
    for (var i = 0; i < roomsList.childNodes.length; i++) {
        var elementRoomCur = roomsList.childNodes[i];
        if (elementRoomCur.tagName == "DIV") {
            if (getItemRoomName(elementRoomCur) == roomName) {
                openRoomBranch(elementRoomCur.childNodes[1])
                invitation(connectionID, {
                    RoomName: PrivateRoomName,
                    Private: true,
                    PrivateID: PrivateID
                });
                return;
            }
        }
    }
    consoleError("onUsersRoom(" + roomName + ", " + connectionID + ") failed!");
}
function onUpdateRoom(room, strRoomNamePrev) {
    g_onUpdateRoom(room, strRoomNamePrev);
    setRoomsCount();
}
function onRemoveRoom(roomName) {
    g_onRemoveRoom(roomName);
    setRoomsCount();
}
// Добавляем нового пользователя
function newUserConnected(user, usersCount, ConnectionIDBefore, roomName) {
    consoleLog("NewUserConnected(" + JSON.stringify(user) + ', ConnectionIDBefore: ' + ConnectionIDBefore + ", roomName: " + roomName + ")");
    var elementUser = AddUser(user, ConnectionIDBefore, roomName);
    if (!elementUser) {
        return;
    }

    if (roomName != g_chatRoom.RoomName)
        return;

    displayUsersCount(usersCount);

    AddEventToChat(lang.userJoined, user, roomName);

    function userInfo(parentID) {
        var informer = document.getElementById(parentID);
        if (informer == null)
            return;//нет включенных камер или микрофонов
        var childNodes = informer.childNodes;
        for (i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if ((typeof node.addMedia == 'undefined') || !node.addMedia.app.useLocalMedia)
                continue;
            $.connection.chatHub.server.userInfo(JSON.stringify(g_user), JSON.stringify(getMedias(node.addMedia.app.videoID)), roomName);
            break;
        }
    }

    //Cameras
    userInfo("informerVideos");
    //Microphones
    userInfo("informerMicrophones");

    //send files
    sendFilesInfo(user.id);
}
function unloadPage() {
    consoleLog('unloadPage() SignalRChat.js');
}
function onUserDisconnected(id, userName, usersCount, roomName) {
    // Удаляем пользователя
    consoleLog("onUserDisconnected(" + id + ", " + userName + ")");

    displayUsersCount(usersCount);
    var elUser = document.getElementById('chatusers').querySelector('#' + CSSescape(id));
    if (elUser) {
        clearTimeout(elUser.timeoutId);
        //посетители могут удалчться не только из текущей комнаты но из списка комнат
        elUser.parentElement.parentElement.removeChild(elUser.parentElement)
    }
    //Не удаляю приглашение потому что приглашений может быть несколько от одного и того же пользователя в разных комнатах
    //и сюда попадет если пользователь вышел из одной из комнат.
    //Но приглашение остается в силе потому что пользователь продолжает приглашать из другой комнаты
    //для тестирования надо слелать приглашение в приват.
    //Появится приватная комната и в ней будет еще одно прглашение
    //Теперь выходим из первой комнаты
    document.getElementById('invitations').querySelectorAll('.invitation').forEach(function (elInvitation) {
        if (elInvitation.querySelector('.inviterName').innerText == userName)
            elInvitation.parentElement.removeChild(elInvitation);
    });
        
    if (roomName == g_chatRoom.RoomName)
        AddMessage("<em>" + lang.userLeft.replace("%s", userName) + "</em>");//'User %s has left the chat.'
    if (typeof FileTransfer != 'undefined')
        window.closeFileTransfer(userName);
    removeWaitPermission(id, 1);//snapshot
    removeWaitPermission(id, 2);//video record
    if (g_chatRoom.isPrivate() && (userName == g_user.nickname)) {
        alert(lang.userLeft2);//The visitor has left the chat. Press Ok for close web page
        $.connection.hub.stop();
        window.close();
    }
}
function onClickPrivate(e) {
    if (!e) e = window.event;

    //http://javascript.ru/forum/events/28424-kak-otmenit-sobytie-roditelya.html
    e.cancelBubble = true;

    var itemPrivate = e.target || e.srcElement;
    if (itemPrivate.tagName == "SPAN")
        itemPrivate = itemPrivate.parentElement;
    else return;
    privateBranch(itemPrivate);
}

function onkeyupRoomName(e) {
    if (!e) e = window.event;
    var element = e.target || e.srcElement;
    consoleLog("onkeyupRoomName()");
    var roomName = element.value;
    if (roomName.replace(/^\s+/, '') == '') {
        return;
    }
    $.connection.chatHub.server.validRoomName(roomName, element.userID);
}
function onclickGoToPrivate(userID) {
    var inputPrivateRoomName = document.getElementById('RoomName' + userID);
    var roomName = inputPrivateRoomName.value;
    if (roomName.replace(/^\s+/, '') == '') {
        inputKeyFilter.TextAdd(lang.typeRoomName, inputPrivateRoomName, "downarrowdivred");//Type a name of the room first
        inputPrivateRoomName.focus();
        return false;
    }

    var element = document.getElementById('GoPrivate' + userID);
    var parentElement = getElementUser(element.parentElement);
    var user = getUserFromChatUsers(parentElement);

    var response = getSynchronousResponse("XMLHttpRequest.aspx?ValidRoomName=" + encodeURIComponent(roomName) + "&userID='" + userID);
    if (response == "0") {
        consoleLog('Room "' + roomName + '" is busy. userID=' + userID);
        var inputPrivateRoomName = document.getElementById('RoomName' + userID);
        inputKeyFilter.TextAdd(lang.roomIsBusy, inputPrivateRoomName, "downarrowdivred");//room is busy
        return false;
    }

    consoleLog('Room name "' + roomName + '" is valid. userID=' + userID);
/*сейчас приглашение делаю после открытия приватной комнаты при условии что приглашаемого еще нет в привате
    invitation(userID, {
        RoomName: roomName,
        Private: true,
        PrivateID: response
    });
*/
    element.href = '?browserID=' + g_user.browserID + '&chatRoom=' + encodeURIComponent(roomName) + '&private=' + userID
        + '&privateID=' + response;
    /*
    //Открыть новую вкладку браузера можно только тут
    var win = window.open('?browserID=' + g_user.browserID + '&chatRoom=' + encodeURIComponent(roomName) + '&private=' + userID
        + '&privateID=' + response, '_blank');
    if(win == null){
        alert(lang.pupupBlocked);//'Pupup window is blocked in your browser. Please unblok pupup windows for our site and try again.'
        return;
    }
    */
    AddMessageToChat(lang.youInvited//'You invited '
        , user
        , lang.inPrivateRoom//' into a private room. '
          + lang.WaitingAnswer);//'Waiting for a visitor answer
    return true;
}
function privateBranch(itemPrivate) {

    if (typeof itemPrivate == 'undefined') {
        consoleError("privateBranch(itemPrivate) failed! itemPrivate is undefined");
        return;
    }

    consoleLog("privateBranch(" + itemPrivate + ")");

    var triangle = getElementByClassName(itemPrivate, 'triangle');
    if (!triangle) {
        consoleError("privateBranch(itemPrivate) failed! triangle is null");
        return;
    }
    var expanded = ' expanded';
    var element = getElementByClassName(itemPrivate, "branch");
    if (triangle.innerHTML == "▶") {
        triangle.innerHTML = "▼"
        if (!element) {
            element = document.createElement("div");
            element.className = 'branch b-toggle' + expanded;
            var user = getUserFromChatUsers(itemPrivate.parentElement.parentElement);
            var userID = user.id;
            var userName = user.nickname;
            element.innerHTML =
                '<div>'

                    //input The name of the private room
                  + '<input'
                    + ' id="RoomName' + userID + '"'
                    + ' title="' + lang.privateRoomTitle + userName + '"'//The name of the private room with 
                    + ' placeholder="' + lang.privateRoomName + '"'//Private room name
                    + ' onkeyup="onkeyupRoomName(event)"'
                    + ' value=' + g_user.nickname
                  + ' />'

                  //button Go to Private room
                  + '<a href="#" target="_blank" id="GoPrivate' + userID + '" onclick="javascript: return onclickGoToPrivate(\'' + userID + '\')">'
                        + '<input type="button" style="margin-left:5px"'
                            + ' value="' + lang.go + '"'//Go
                            + ' title="' + lang.goTitle + userName + '"'//Go to private room with 
                        + ' />'
                  + '</a>'
                  + '<span id="invitationPrivateResponse' + userID + '" style="margin:5px;"></span>'
                + '</div>'
            ;
            itemPrivate.appendChild(element);

            var inputRoomName = document.getElementById('RoomName' + userID);
            inputRoomName.roomIsBusy = true;
            inputRoomName.userID = userID;
        } else {
            element.className += expanded;
        }
        setTimeout(function () { element.scrollIntoView(); }, 0);
    } else {
        triangle.innerText = "▶"
        if (!element) {
            consoleError("onClickPrivate(e) failed! branch is undefined");
            return;
        }
        element.className = element.className.replace(expanded, '');//закрыть окно
    }
}
function onRoomNameOk(roomName, userID) {
    consoleLog("onRoomNameOk(" + roomName + ", " + userID + ")");
    document.getElementById("RoomName" + userID).roomIsBusy = false;

    //тут не получается открыть новую вкладку браузера
    //window.open('?userId=' + g_user.id + '&chatRoom=' + roomName + '&private=jhgj', '_blank');
    //g_inputPrivateRoomName = null;
}
function onRoomNameBusy(userID) {
    consoleLog("onRoomNameBusy(" + userID + ")");
    document.getElementById("RoomName" + userID).roomIsBusy = true;
    var inputPrivateRoomName = document.getElementById('RoomName' + userID);
    inputKeyFilter.TextAdd(lang.roomIsBusy, inputPrivateRoomName, "downarrowdivred");//room is busy
    inputPrivateRoomName.focus();

    var element = document.getElementById("invitationPrivateResponse" + userID);
    if (element)
        element.innerHTML = '';
}
function onclickGeolocation(event) {
    consoleLog("onclickGeolocation()");
    var elementUser = getElementUser(event.target.parentElement);
    var informer = elementUser.querySelector('#geolocation');
    var res = onbranchelementBase(informer, elementUser.querySelector('#branchGeolocation'));
    if (isBranchExpanded(informer)) {
        var mapContainer = elementUser.querySelector('#mapContainer');
        mapContainer.style.height = mapContainer.clientWidth + 'px';
        mapContainer.position = getUserFromChatUsers(elementUser).position;
        mapPosition(mapContainer);
        setTimeout(function () { mapContainer.scrollIntoView(); }, 100);
    } else consoleLog("onclickGeolocation() branch = not Expanded");
    return res;
};
function onInvite(invitationDataJSON) {
    var invitationDataMessage = JSON.parse(invitationDataJSON);
    var elUserName = getElUserName(invitationDataMessage.inviter.nickname);
    if (elUserName && (elUserName.invitartion == 'ignore')) {
        $.connection.chatHub.server.invitationIgnore(JSON.stringify(invitationDataMessage));
        return;
    }
    var inviterName = invitationDataMessage.inviter.nickname;
    var invitation = invitationDataMessage.invitationText;
    consoleLog('chat.client.onInvite(from: "' + inviterName + '", to: "' + invitationDataMessage.room.RoomName + '" room, "' + invitation + '")');

    var invitationText = invitation == "" ? " " : ': "' + invitation + '" ';
    var inviterID = getInviterID(invitationDataMessage.inviter.id);

    var invitations = document.getElementById("informerInvitations").querySelectorAll('.invitation');
    var elInvitation;
    for (var i = 0; i < invitations.length; i++) {
        var elInvitationCur = invitations[i];
        if(
            (elInvitationCur.querySelector('.inviterName').innerText == inviterName)
            && (elInvitationCur.querySelector('.invitationToRoom').innerText == invitationDataMessage.room.RoomName)
        ){
            elInvitation = elInvitationCur;
            break;
        }
    }

    if (!elInvitation) {

        //new invitation

        document.getElementById("noInvitations").style.display = 'none';
        document.getElementById("invitations").style.display = 'block';
        onbranch('informerInvitations', 'branchInvitations', true);

        elInvitation = document.createElement('div');
        elInvitation.className = "invitation gradient";
        elInvitation.style.padding = '5px';
        elInvitation.style.marginTop = '5px';
        elInvitation.style.overflow = 'auto';
        elInvitation.innerHTML =
              ' <b>' + lang.invitation + '</b>'//Invitation
            + ' <span class="invitationText"></span>'
            + ' <b>' + lang.from + '</b> <span class="inviterName">' + inviterName + '</span>'
            + ' <b>' + lang.to + '</b> <span class="invitationToRoom"></span> <b>' + lang.room + '</b>'
            + ' <b class="forPrivate"></b>'
            + ' <div>'
                + '<a href="#" class="accept" target="_blank"'
                        + ' onclick="javascript: return onInvitationOK()">'
                    + '<input type="button" style="margin-top:5px;" value="' + lang.accept + '" />'//Accept
                + '</a>'
                + ' <input type="button" onclick="javascript: return onInvitationReject()"'
                    + ' style="margin-top:5px;" value="' + lang.reject + '" />'//Reject
                + ' <input type="button" onclick="javascript: return onInvitationIgnore()"'
                        + ' style="margin-top:5px;" value="' + lang.ignore + '"'//'Ignore'
                        + ' title="' + lang.ignoreInvitation + '" />'//'Ignore all invitation of this visitor'
            + ' </div>';
        document.getElementById("informerInvitations").appendChild(elInvitation);
        invitationsCount();
    }
    elInvitation.querySelector('.invitationText').innerHTML = invitationText;
    elInvitation.querySelector('.invitationToRoom').innerHTML = invitationDataMessage.room.RoomName;
    elInvitation.querySelector('.forPrivate').innerHTML = invitationDataMessage.room.Private ? lang.forPrivate : "";//'for a private conversation'
    elInvitation.invitationDataMessage = invitationDataMessage;
    beep("../MyIsapi/sounds/knockKnock.mp3");
}
function getElInvitation() {
    if (!event) event = window.event;
    return (event.target || event.srcElement).parentElement.parentElement;
}
function onInvitationOK() {
    var elInvitation = getElInvitation().parentElement;
    var invitationDataMessage = elInvitation.invitationDataMessage;
    consoleLog("onInvitationOK(" + invitationDataMessage.inviter.id + ")");
    $.connection.chatHub.server.invitationOK(JSON.stringify(invitationDataMessage));
    var privateID = '';
    if (typeof invitationDataMessage.room.PrivateID != 'undefined')
        privateID = '&privateID=' + invitationDataMessage.room.PrivateID;
    elInvitation.querySelector('.accept').href =
        '?browserID=' + g_user.browserID + '&chatRoom=' + invitationDataMessage.room.RoomName + privateID;
    removeInviter(elInvitation);
    return true;//false - Stop the browser following the link
}
function onInvitationReject() {
    var elInvitation = getElInvitation();
    var invitationDataMessage = elInvitation.invitationDataMessage;
    consoleLog("onInvitationReject(" + invitationDataMessage.inviter.id + ")");
    $.connection.chatHub.server.invitationReject(JSON.stringify(invitationDataMessage));
    removeInviter(elInvitation);
    // Stop the browser following the link
    return false;
}
function onInvitationIgnore() {
    var elInvitation = getElInvitation();
    var invitationDataMessage = elInvitation.invitationDataMessage;
    consoleLog("onInvitationIgnore(" + invitationDataMessage.inviter.id + ")");
    var elUserName = getElUserName(invitationDataMessage.inviter.nickname);
    if (elUserName == null) {//посетитель покнул эту комнату
        alert(lang.noIgnore + invitationDataMessage.inviter.nickname);//you can not ignore 
    } else {
        elUserName.invitartion = 'ignore';;
        $.connection.chatHub.server.invitationIgnore(JSON.stringify(invitationDataMessage));
        removeInviter(elInvitation);
    }
    // Stop the browser following the link
    return false;
}
function getElUserName(userName) {
    var userNames = document.getElementById('chatusers').querySelectorAll('#userName');
    for (var i = 0; i < userNames.length; i++) {
        var elUserName = userNames[i];
        if (elUserName.innerText == userName)
            return elUserName;
    }
    return null;//посетитель покинул комнату
}
function getInviterID(id) { return 'inviter' + id; }
function removeInviter(elInvitation) {
    elInvitation.parentElement.removeChild(elInvitation);
    removeInvitations();
}
function onInvitationStart(invitationDataJSON) {
    var invitationDataMessage = JSON.parse(invitationDataJSON);
    consoleLog('chat.client.onInvitationStart("' + invitationDataJSON + '")');
    setInvitationResponse(invitationDataMessage, function (object) {
        object.innerHTML = getWaitIcon();
    });
}
function onInviteOK(invitationDataJSON) {
    var invitationDataMessage = JSON.parse(invitationDataJSON);
    consoleLog('chat.client.onInviteOK("' + invitationDataMessage.inviter.nickname + '", "' + invitationDataMessage.invitationText + '")');
    setInvitationResponse(invitationDataMessage, function (object) {
        AddSmile(object, '😀', lang.invitationAccepted);//'Your invitation has been accepted'
    });
    AddEventToChat(lang.hasAccepted, document.getElementById(invitationDataMessage.idAsk).user);//' has accepted your invitation.'
}
function onInviteReject(invitationDataJSON) {
    var invitationDataMessage = JSON.parse(invitationDataJSON);
    consoleLog('chat.client.onInviteReject("' + invitationDataMessage.inviter.nickname + '", "' + invitationDataMessage.invitationText + '")');
    setInvitationResponse(invitationDataMessage, function (object) {
        AddSmile(object, '😕', lang.invitationRejected);//"Your invitation has been rejected"
    });
    AddEventToChat(lang.hasRejected, document.getElementById(invitationDataMessage.idAsk).user);//' has rejected your invitation.'
}
function onInviteIgnore(invitationDataJSON) {
    var invitationDataMessage = JSON.parse(invitationDataJSON);
    consoleLog('chat.client.onInviteIgnore("' + invitationDataMessage.inviter.nickname + '", "' + invitationDataMessage.invitationText + '")');
    var idAsk = invitationDataMessage.idAsk;
    var invitationResponse = getInvitationResponse(idAsk);
    setInvitationResponse(invitationDataMessage, function (object, idAsk) {
        AddSmile(object, '😡', lang.inviteeNotAllow);//"The invitee does not allow to you to make a new invitations"
        var roomName = object.parentElement.querySelector('#RoomName' + idAsk);
        if (roomName)
            roomName.disabled = true;
        var goPrivate = object.parentElement.querySelector('#GoPrivate' + idAsk);
        if (goPrivate)
            goPrivate.disabled = true;
    });
    if (invitationResponse.id == "invitationResponse" + idAsk) {
        document.getElementById("inviteButton" + idAsk).disabled = true;
        document.getElementById("invitationText" + idAsk).disabled = true;
        return;
    }
    AddEventToChat(lang.hasIgnore, document.getElementById(invitationDataMessage.idAsk).user);//' does not allow to you to make a new invitations.'
}
function initSignalRChat() {
    if (g_chatRoom.isPrivate()) {
        var response = getSynchronousResponse("XMLHttpRequest.aspx?isVisitingRoom=" + encodeURIComponent(g_chatRoom.RoomName)
            + "&UserBrowserID=" + g_user.browserID);
        switch (response) {
            case "0": {
                consoleLog('You can vizit into "' + g_chatRoom.RoomName + '" room.');
                break;
            }
            case "1": {
                var message = lang.duplicateUsernameInRoom.replace("%s", g_chatRoom.RoomName);//You are already in the "%s" room
                alert(message);
                gotoChatPage();
                return;
            }
            default: consoleError("Response: " + response);
                return;
        }
    }
    setTitle();
    initSample();//ckeditor http://ckeditor.com/
}
function getInvitationResponse(idAsk) {
    var invitationResponse = document.getElementById("invitationResponse" + idAsk);
    if (invitationResponse && (invitationResponse.innerHTML != '')) {
        return invitationResponse;
    }

    invitationResponse = document.getElementById("invitationPrivateResponse" + idAsk);
    if (!invitationResponse) {//сюда попадает когда 
        //consoleError("invite user " + idAsk + " is not found");
        return null;
    }
    if (invitationResponse.innerHTML != '')
        return invitationResponse;

    //consoleError("getInvitationResponse(" + idAsk + ") failed! invitationResponse is now found");
    return null;
}
function setInvitationResponse(invitationDataMessage, callback) {
    var elementResponseId;
    if (g_chatRoom.RoomName != invitationDataMessage.room.RoomName)
        elementResponseId = 'invitationPrivateResponse';
    else elementResponseId = 'invitationResponse';

    var invitationResponses = document.querySelectorAll("#" + elementResponseId + invitationDataMessage.idAsk);
    for (var i = 0; i < invitationResponses.length; i++) {
        callback(invitationResponses[i], invitationDataMessage.idAsk);
    }
}
function invitation(idAsk, room, invitationText) {
    var invitationDataMessage = new Object()
    invitationDataMessage.idAsk = idAsk;//ID of user for invitation
    if (typeof invitationText == 'undefined')
        invitationDataMessage.invitationText = "";
    else invitationDataMessage.invitationText = invitationText;
    invitationDataMessage.inviter = g_user;
    invitationDataMessage.room = room;
    consoleLog('invitation(' + idAsk + ', "' + invitationDataMessage.invitationText + '") to ' + room.RoomName + ' room. PrivateID = ' + room.PrivateID);
    $.connection.chatHub.server.invitation(JSON.stringify(invitationDataMessage));
}
function onInvitation(idAsk, userName) {
    var elementChatusers = document.getElementById("chatusers");
    for (var i = 0; i < elementChatusers.childNodes.length; i++) {
        if (elementChatusers.childNodes[i].userName == userName) {
            inputKeyFilter.TextAdd(
                lang.duplicateOtherUserInRoom.replace("%s2", g_chatRoom.RoomName).replace("%s", userName)//'The %s visitor already in the "%s2" room'
                , document.getElementById('inviteButton' + idAsk));
            return;
        }
    }
    invitation(idAsk, g_chatRoom, document.getElementById("invitationText" + idAsk).value);
}
function editorWidth() {
    //For compatibility with IE6 
    document.getElementById("editor").style.width = document.getElementById("send_hide").clientWidth - document.getElementById("send").clientWidth - 50 + 'px';
}
function getAge(birthday) {
    if (!birthday) {
        consoleError('birthday: ' + birthday);
        return null;
    }
    //http://javascript.ru/forum/misc/38107-vychislenie-vozrasta.html
    return (((new Date().getTime() - new Date(birthday)) / (24 * 3600 * 365.25 * 1000)) | 0)
}
function getGenderString(user) {
    var gender = '', color = 'black', title = '', old = false;
    if (user.birthday && (getAge(user.birthday) > 30))
        old = true;
    if ((typeof user.genderId != 'undefined') && (user.genderId != null)) {
        switch (user.genderId) {
            case '0'://select gender
                gender = '';
                break;
            case '3'://male
                if (old) {
                    gender = '👨';//♂
                    title = lang.male;//'male'
                } else {
                    gender = '👦';//♂
                    title = lang.giy;//'giy'
                }
                break;
            case '4'://female
                color = 'pink';
                if (old) {
                    gender = '👩';//🛊♀
                    title = lang.female;//'female'
                } else {
                    gender = '👧';//🛊♀
                    title = lang.girl;//'girl'
                }
                break;
            case '2'://couple
                gender = '🚻';
                title = lang.couple;//'couple'
                break;
            case '1'://another
                gender = '⚥';//⚣♀♂⚢⚲
                color = 'blue';
                title = lang.another;//'another'
                break;
            default:
                consoleError('invalid gender id: ' + user.genderId);
        }
    }
    if (gender != '')
        gender = '<font style="COLOR: ' + color + ';" title="' + title + '">' + gender + '</font> ';
    return {
        gender: gender
        , title: title
    };
} 
function colorsArray(editor) { }
function onChannelPageReady() { }
function ckeditorToolbar(config) {
    //http://www.uas.alaska.edu/a_assets/ckeditor/samples/plugins/toolbar/toolbar.html 
    // Toolbar configuration generated automatically by the editor based on config.toolbarGroups.
    config.toolbar = [
        { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source'] },
        {
            name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: [//'Find', 'Replace', '-', 'SelectAll', '-',
              'Scayt']
        },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
        { name: 'links', items: ['Link', 'Unlink'] },
        {
            name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley',
              'SpecialChar']
        },
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
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
function isSendByEnter() { return isToolbarHide(); }
function openToolbarTitle() { return lang.MultilineMode; }//"Multiline mode";
function closeToolbarTitle() { return lang.SingleLineMode; }//"Single line mode";
function deleteg_IRCuser() { return g_user; }
function deleteIRCuser(user) { }
function privMsgFileTransfer(fileTransfer) { }
function sendFileRequest(userInfo) { $.connection.chatHub.server.sendFileRequest(g_user.id, userInfo); }
function fTRoomName() { return g_chatRoom.RoomName; }
function isHelpContentSignalR() { return true; }
//вывести на экран количество зрителей или слушателей media передачи
function setPeersCount(dataID, peersCount) { $.connection.chatHub.server.peersCount(dataID, peersCount); }

