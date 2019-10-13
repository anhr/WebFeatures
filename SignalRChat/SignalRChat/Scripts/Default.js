/**
 * Default functions
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

function MessageElement(message, noCloseButton) {
    var id = 'StateMessage';
    function removeMessage() {
        elMessageOld = document.getElementById(id);
        if (elMessageOld != null)
            elMessageOld.parentElement.removeChild(elMessageOld);
    }
    if (message == '') { removeMessage(); return; }
    displayMessage(function (elMessage) {
        removeMessage();
        elMessage.id = id;
        elMessage.innerHTML =
            message
            + '<hr><div align="center">'
                + '<input type="button" class="close" value="' + lang.close + '" >'//Close
            + '</div>'
        ;
        elMessage.querySelector('.close').onclick = removeMessage;
    });
}

if (!new QueryString().value("request")) loadScript("../SignalRChat/lang/" + getLanguageCode() + ".js", function () {

    //menu
    var elMenuUsers = document.getElementById("menuUsers");
    if (elMenuUsers) {
        elMenuUsers.innerHTML = '⁝ ' + lang.menu;//Menu ☰
    }

    //not compatible with ie7
    var elIRCHeader = document.getElementById("IRCHeader");
    if (elIRCHeader)
        elIRCHeader.innerHTML = lang.IRC;//IRC

    var elUsersHeader = document.getElementById("usersHeader");
    if (elUsersHeader)
        elUsersHeader.innerHTML = lang.users + ':';//Users

    var isPrompt = false;

    //http://unixpapa.com/js/querystring.html
    if (typeof QueryString == 'undefined')
        return;//IRCBot project
    var q = new QueryString();
    var privateUserId = q.value("private");
    g_chatRoom.PrivateID = q.value("privateID");
/*
    if (g_chatRoom.PrivateID == 'undefined') {
        consoleError('init() failed! g_chatRoom.PrivateID = ' + g_chatRoom.PrivateID);
        alert(lang.invalidParameter.replace('%s', g_chatRoom.PrivateID));//Invalid privateID : "%s" parameter
        return false;
    }
*/
    g_chatRoom.RoomName = q.value("chatRoom");
    if (typeof privateUserId != 'undefined') {
        if (typeof g_chatRoom.PrivateID == 'undefined') {
            consoleError('init() failed! g_chatRoom.PrivateID is undefined');
            return false;
        }
        g_chatRoom.privateUserId = privateUserId;
    } else {
    }
    if (!g_chatRoom.RoomName || (g_chatRoom.RoomName.replace(/^\s+/, "") == "")) {
        var IRCChannel = q.value("IRCChannel");
        if (IRCChannel) {
            loadScript("Scripts/IRCChat.js", function () {
                loadScript("Scripts/IRC.js", function () {
                    loadScript("Scripts/IRCChannelOrPrivate.js", function () {
                        loadScript("Scripts/SignalRorIRCChat.js", function () {
                            if (typeof q.value("IRCPrivate") == 'undefined')
                                loadScript("Scripts/IRCChannel.js", function () { startHub(); });
                            else loadScript("Scripts/IRCPrivate.js", function () { startHub(); });
                        });
                    });
                });
            });
            return false;
        } else {
            if (q.value("IRCServer")) {
                loadScript("Scripts/IRCChat.js", function () {
                    loadScript("Scripts/IRC.js", function () {
                        loadScript("Scripts/IRCServer.js", function () {
                            loadScript("Scripts/SignalRorIRCServer.js", function () { startHub(); });
                        });
                    });
                });
                return false;
            } else {
                alert(lang.chatRoomError);//The name of the chat room is not defined
                gotoChatPage();
                return false;
            }
        }
    } else {
        if (typeof g_user.browserID == 'undefined') {
            if (!g_user.nickname || (g_user.nickname.replace(/^\s+/, "") == "")) {
                alert(lang.nicknameError);//The nickname is not defined
                gotoChatPage();
                return false;
            }
        } else {
            loadScript("Scripts/SignalRChat.js", function () {
                g_user.query();
                loadScript("Scripts/SignalRorIRCChat.js", function () {
                    loadScript("Scripts/SignalRorIRCServer.js", function () { startHub(); });
                });
            });
        }
    }
});
function closeContextMenu(element) {
    if (element.className.indexOf('closeContextMenu') != -1)
        return;
    element.className = element.className.replace(' openContextMenu', '');
    element.className += " closeContextMenu";
}
function openContextMenuUsers() {
    var contextMenuUsers = document.getElementById("contextMenuUsers");
    if (contextMenuUsers.className.indexOf('openContextMenu') != -1) {
        consoleLog("openContextMenuUsers() contextMenuUsers.className.indexOf('openContextMenu') == " + contextMenuUsers.className.indexOf('openContextMenu'));
        return;
    }
    //consoleLog("openContextMenuUsers()");
    contextMenuUsers.className = contextMenuUsers.className.replace(' closeContextMenu', '');
    contextMenuUsers.className += " openContextMenu";
    var menuUsers = document.getElementById('menuUsers')
    var offsetSum = getOffsetSum(menuUsers);
    contextMenuUsers.style.left = offsetSum.left - contextMenuUsers.clientWidth + menuUsers.clientWidth + 'px';

    var elementUsers = document.getElementById('users');
    if (typeof elementUsers.querySelectorAll != 'undefined') {
        var videos = elementUsers.querySelectorAll('video');
        for (i = 0; i < videos.length; i++)
            videos[i].style.visibility = "hidden";

        var audios = elementUsers.querySelectorAll('audio');
        for (i = 0; i < audios.length; i++)
            audios[i].style.visibility = "hidden";

        //плавающие кнопки на панели инструментов не закрываются пунктами меню. Скрываю панель инструментов целиком
        var tools = elementUsers.querySelectorAll('#tools');
        for (i = 0; i < tools.length; i++)
            tools[i].style.visibility = "hidden";
    }
    var elIRC = document.getElementById('IRC');
    if (elIRC)
        elIRC.style.visibility = "hidden";
}
function closeContextMenuUsers() {
    var element = document.getElementById("contextMenuUsers");
    //consoleLog("closeContextMenuUsers() element.className: '" + element.className);
    closeContextMenu(element);

    var elementUsers = document.getElementById('users');

    if (typeof elementUsers.querySelectorAll != 'undefined') {//for ie7
        var videos = elementUsers.querySelectorAll('video');
        for (i = 0; i < videos.length; i++)
            videos[i].style.visibility = "visible";

        var audios = elementUsers.querySelectorAll('audio');
        for (i = 0; i < audios.length; i++)
            audios[i].style.visibility = "visible";

        var tools = elementUsers.querySelectorAll('#tools');
        for (i = 0; i < tools.length; i++)
            tools[i].style.visibility = "visible";
    }
    var elIRC = document.getElementById('IRC');
    if (elIRC)
        elIRC.style.visibility = "visible";
}
function resizeVideos() {
    var elementUsers = document.getElementById('users');

    //chaturbate
    elementUsers.querySelectorAll('#xmovie').forEach(function (elXmovie) {
        height = parseInt((elXmovie.clientWidth / 4) * 3);
        if (height == 0) {
            consoleError('height = ' + height);
            return;
        }
        elXmovie.style.height = height + 'px';
    });

    /*сейчас ширина video и audio равна ширине родителя и определяется style="width:inherit"
                        loadScript("Scripts/WebRTC/Media.js", function (){
                            var videos = elementUsers.querySelectorAll('video');
                            for(i = 0; i < videos.length; i++)
                                setVideoContainerWidth(videos[i]);
                        });
    */
    //consoleLog('resizeVideos()');
    var fileTransferContainers = document.getElementsByName("fileTransferContainer");
    for (i = 0; i < fileTransferContainers.length; i++)
        setFileTransferContainerWidth(fileTransferContainers[i]);

    //maps
    //                    if (typeof google != 'undefined')
    if (typeof ymaps != 'undefined') {
        var mapContainers = document.querySelectorAll('#mapContainer');
        for (mapIndex = 0; mapIndex < mapContainers.length; mapIndex++) {
            var mapContainer = mapContainers[mapIndex];
            mapContainer.style.height = mapContainer.clientWidth + 'px';
            if (typeof mapContainer.map == 'undefined')
                continue;
            //https://tech.yandex.ru/maps/jsbox/2.1/fillcontainer
            mapContainer.map.container.fitToViewport();
            /*
            google.maps.event.trigger(mapContainer.map, "resize");
            mapContainer.map.setCenter(new google.maps.LatLng(mapContainer.position.coords.latitude,mapContainer.position.coords.longitude));
            */
        }
    }
}
function resizeUsers(x) {
    var elementUsers = document.getElementById("users");
    var usersWidth = elementUsers.parentElement.clientWidth - x - 18 + "px";
    elementUsers.style.width = usersWidth;
    SetCookie("usersWidth", usersWidth);
    resizeVideos();
}
function setUsersWidth() {
    var usersWidth = get_cookie("usersWidth");
    if (typeof usersWidth != 'undefined')
        document.getElementById("users").style.width = usersWidth;
}
//Indicates if the browser supports the W3C Touch Events API.
//https://modernizr.com/docs/#using-modernizr-with-javascript
loadScript("/js/Modernizr/modernizr-custom.js", function () {
    consoleLog('Modernizr.touchevents = ' + Modernizr.touchevents);

    if (!Modernizr.touchevents)
        return;
    window.ontouchstartResizer = function (event) {
        consoleLog('touchstart. event: ' + strEvent + ' elResizerUsers.style.backgroundColor = ' + elResizerUsers.style.backgroundColor);
        if (event.targetTouches.length == 1) {// Если 1 палец внутри элемента
            elResizerUsers.style.backgroundColor = 'gray';
        }
    }
    window.ontouchmoveResizer = function (event) {
        //https://habrahabr.ru/post/118318/
        if (event.targetTouches.length == 1) {// Если 1 палец внутри элемента
            var touch = event.targetTouches[0];
            consoleLog('ontouchmoveResizer. touch.pageX = ' + touch.pageX);
            resizeUsers(parseInt(touch.pageX));
            if (event.targetTouches.length == 1) {// Если 1 палец внутри элемента
                elResizerUsers.style.backgroundColor = 'gray';
            }
        }
    }
    window.ontouchendResizer = function (event) {
        consoleLog('touchend. elResizerUsers.style.backgroundColor = ' + elResizerUsers.style.backgroundColor);
        if (event.targetTouches.length == 0) {
            elResizerUsers.style.backgroundColor = '';
            consoleLog('elResizerUsers.style.backgroundColor = ' + elResizerUsers.style.backgroundColor)
        }
    }
    document.getElementById('resizerUsers').innerHTML
        = '<div id="touch" style="width:25px;position:relative;left:-10px;"'
        + 'ontouchstart="javascript: ontouchstartResizer(event);"'
        + 'ontouchmove="javascript: ontouchmoveResizer(event);"'
        + 'ontouchend="javascript: ontouchendResizer(event);"></div>';
});

var elResizerUsers = document.getElementById('resizerUsers');

resizerX("resizerUsers", function (e) {
    //consoleLog("mousemove(X = " + e.pageX + ")");
    resizeUsers(e.pageX);
});


function startHub() {
    //<!--Add script to update the page and send messages.-->
    $(function () {
        try {

            // Declare a proxy to reference the hub.
            var chat = $.connection.chatHub;
            // Create a function that the hub can call to broadcast messages.
            chat.client.broadcastMessage = function (JSONUser, message) {
                // Html encode display name and message.
                var user = JSON.parse(JSONUser);
                //consoleLog('broadcastMessage(' + user.nickname + ', ' + message + ')');
                broadcastMessage(user, message);
            };
            chat.client.onEditorKey = function (userId, keyCode) { onEditorKey(userId, keyCode); };
            chat.client.onPing = function () {
                consoleLog("chat.client.onPing() Room: " + g_chatRoom.RoomName + " user: " + g_user.nickname + " UserID: " + g_user.id);
                if (typeof g_user.id == 'undefined') {
                    consoleError("g_user.id == 'undefined'");
                    return;
                }
                $.connection.chatHub.server.pong(JSON.stringify(g_user));
            }
            chat.client.onUpdateRoom = function (room, strRoomNamePrev) { onUpdateRoom(room, strRoomNamePrev); }
            chat.client.onRemoveRoom = function (roomName) {
                if (typeof onRemoveRoom != 'undefined')
                    onRemoveRoom(roomName);
            }
            chat.client.onRooms = function (rooms) { onRooms(rooms); }
            //ATTENTION!!! Never called
            chat.client.onGetVideoCount = function (videoID) {
                consoleLog('chat.client.onGetVideoCount(videoID = ' + videoID + ')');
                var videoBlock = document.getElementById(getVideoBlockID(videoID));
                if (videoBlock)
                    videoBlock.addMedia.app.peer.setPeersCount();
            }
            chat.client.onConsoleLog = function (message) { console.log(message); }
            chat.client.onConsoleError = function (message) { console.error(message); }
            chat.client.onConsoleWarn = function (message) { console.warn(message); }
            chat.client.onConsoleDebug = function (message) { console.debug(message); }

            //http://metanit.com/sharp/mvc5/16.2.php
            // Функция, вызываемая при подключении нового пользователя
            chat.client.onConnected = function (user, allUsers) {
                var id = user.id;
                var userName = user.nickname;
                consoleLog("chat.client.onConnected(" + id + ", " + userName + ", allUsers)");
                if (!userName) {
                    var message = 'Unknown nickname';
                    consoleError(message);
                    alert(message);
                    return;
                }
                if (userName == g_user.nickname) {
                    g_user.id = id;
                    g_user.browserID = user.browserID;
                    //SetCookie("browserID", g_user.browserID);
                    displayUsersCount(allUsers.length);
                } else if (typeof g_user.id == 'undefined') {
                    consoleError("chat.client.onConnected() failed! g_user.id == 'undefined'. userName: " + userName + " g_user.nickname: " + g_user.nickname);
                    return;
                }
                AddAllUsers(allUsers, g_chatRoom.RoomName);
//                loadScript("Scripts/SignalRChat.js", function () { AddAllUsers(allUsers); });
            }

            // Добавляем нового пользователя
            chat.client.onNewUserConnected = function (user, usersCount, ConnectionIDBefore, roomName) {
                newUserConnected(user, usersCount, ConnectionIDBefore, roomName);
            }

            // Удаляем пользователя
            chat.client.onUserDisconnected = function (id, userName, usersCount, roomName) { onUserDisconnected(id, userName, usersCount, roomName); }

            chat.client.onRoomNameOk = function (roomName, userID) { onRoomNameOk(roomName, userID); }
            chat.client.onRoomNameBusy = function (userID) { onRoomNameBusy(userID); }
            chat.client.onNicknameEmpty = function () {
                alert(lang.userLeft2);//The visitor has left the chat. Press Ok for close web page
                $.connection.hub.stop();
                window.close();
            }
            chat.client.onUserNotExists = function () { alert(lang.userNotExists.replace("%s", '')); }//The visitor %s does not exist
            chat.client.onDuplicateUserNameInRoom = function () {
                var message = lang.duplicateUsernameInRoom.replace("%s", g_chatRoom.RoomName);//You are already in the "%s" room
                //consoleLog(message);
                alert(message);
                gotoChatPage();
            }
            chat.client.onUpdatePrifile = function (user, nicknameOld) {
                consoleLog("chat.client.onUpdatePrifile(" + JSON.stringify(user) + ")");
                if (nicknameOld == g_user.nickname) {
                    g_user.updateProfile(user);
                    document.getElementById(g_user.id).innerHTML = getUserString(g_user);
                    setTitle();
                } else {
                    var element = document.getElementById(user.id);
                    if (element) {//user is exists in the current room
                        //consoleError("onUpdatePrifile(" + user + ") failed! user.id == g_user.id");
                        element.childNodes[1].innerHTML = user.nickname
                    } else {
                        //                            consoleError('chat.client.onUpdatePrifile(user) failed! document.getElementById("' + user.id + '") == null');
                        var arrayUserName = document.querySelectorAll('#userName');
                        for (var i = 0; i < arrayUserName.length; i++) {
                            var userName = arrayUserName[i];
                            if (userName.innerHTML != nicknameOld)
                                continue;
                            var elementUserName = userName.parentElement;
                            var elementUser = elementUserName.parentElement;
                            if (elementUser.tagName != 'B') {
                                consoleError('elementUser.tagName: ' + elementUser.tagName);
                                continue;
                            }
                            if (typeof elementUser.user != 'undefined') {
                                if (elementUser.user.nickname != nicknameOld) {
                                    consoleError('update of "' + nicknameOld + '" user failed! "' + elementUser.user.nickname + '" != "' + nicknameOld + '"');
                                }
                                elementUser.user.nickname = user.nickname;

                                //update user
                                elementUser.user = user;
                            }

                            //update users string
                            elementUserName.innerHTML = getUserString(user);

                            //update users window
                            var elementUsersWindow = elementUser.querySelector('.elementUser');
                            if (elementUsersWindow) {
                                var userInfo = elementUsersWindow.querySelector('#userInfo');
                                var nextSibling = userInfo.nextElementSibling;
                                var parentElement = userInfo.parentElement;
                                parentElement.removeChild(userInfo);
                                var elementUserInfo = document.createElement('span');
                                elementUserInfo.id = 'userInfo';
                                elementUserInfo.innerHTML = getUserInfo(elementUser);
                                parentElement.insertBefore(elementUserInfo, nextSibling);
                            }
                        }
                    }
                }
                AddMessage("<em>" + lang.userUpdatePrifile.replace("%s", nicknameOld) + user.nickname + "</em>");//'User %s has updated profile. New name:'

                //update user in all rooms
                var roomsList = document.getElementById("roomsList");
                for (var i = 0; i < roomsList.childNodes.length; i++) {
                    var elementRoomCur = roomsList.childNodes[i];
                    if (elementRoomCur.tagName == "DIV") {
                        for (var j = 0; j < elementRoomCur.childNodes.length; j++) {
                            var elementRoomChild = elementRoomCur.childNodes[j];//child elements of the room
                            if (elementRoomChild.tagName == "DIV") {
                                var elementRoomChild0 = elementRoomChild.childNodes[0];
                                for (var k = 0; k < elementRoomChild0.childNodes.length; k++) {
                                    var elementUsersList = elementRoomChild0.childNodes[k];
                                    if (elementUsersList.tagName == "DIV") {
                                        for (var l = 0; l < elementUsersList.childNodes.length; l++) {
                                            var elementUser = elementUsersList.childNodes[l];
                                            if (elementUser.tagName == "DIV") {
                                                if (elementUser.userName == nicknameOld) {
                                                    elementUser.userName = user.nickname;
                                                    elementUserChildNode0 = elementUser.childNodes[0];
                                                    if (typeof elementUserChildNode0 == 'undefined') {
                                                        consoleError('update of "' + nicknameOld + '" user in "' + elementRoomCur.childNodes[1].innerText + '" room failed! elementUserChildNode0 == "undefined"');
                                                        break;
                                                    }
                                                    var elementUserName;
                                                    if (elementUserChildNode0.tagName == "A") {//my profile
                                                        elementUserName = elementUserChildNode0;
                                                    } else {
                                                        elementUserName = elementUserChildNode0.childNodes[1];
                                                        if (elementUserName.className != "pointer") {
                                                            consoleError('update of "' + nicknameOld + '" user in "' + elementRoomCur.childNodes[1].innerText + '" room failed! elementUserName.className == "' + elementUserName.className + '"');
                                                            break;
                                                        }
                                                    }
                                                    //if(elementUserName.innerText != nicknameOld)do not support in Firefox
                                                    if (elementUserName.innerHTML != nicknameOld) {
                                                        consoleError('update of "' + nicknameOld + '" user in "' + elementRoomCur.childNodes[1].innerText + '" room failed! elementUserName.innerText == "' + elementUserName.innerText + '"');
                                                        break;
                                                    }
                                                    elementUserName.innerHTML = user.nickname;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            chat.client.onNickname = function (nickname) {
                consoleLog("chat.client.onNickname(" + nickname + ")");
                g_user.nickname = nickname;
                if (!g_user.nickname) {
                    var user;
                    if (navigator.cookieEnabled)
                        user = get_cookie("User");
                    else user = new QueryString().value('user');
                    if (user == '') {
                        gotoChatPage();
                        return;
                    }
                    g_user.nickname = JSON.parse(user).nickname;
                    //                        g_user.nickname = JSON.parse(new QueryString().value('user')).nickname;
                    if (!g_user.nickname) {
                        consoleError('chat.client.onNickname("' + nickname + '"). Invalid nickname');
                        gotoChatPage();
                        return;
                    }
                }
                initSignalRChat();
//                loadScript("Scripts/SignalRChat.js", function () { $("#rooms").load("Rooms.html", function () { initSignalRChat(); }); });
            }
            //открыть свойства пользователя, для которого была открыта приватная комната
            chat.client.onUsersRoom = function (roomName, connectionID, PrivateID, PrivateRoomName) {
                onUsersRoom(roomName, connectionID, PrivateID, PrivateRoomName);
//                loadScript("Scripts/SignalRChat.js", function () { onUsersRoom(roomName, connectionID, PrivateID, PrivateRoomName); });
            }
            chat.client.onAccessDenied = function () {
                consoleLog('chat.client.onAccessDenied()');
                alert(lang.accessDenied.replace('%s', g_chatRoom.RoomName));//You do not have access into "%s" private room
                gotoChatPage();
            }
            chat.client.onError = function (error) { ErrorMessage('SignalR onError: ' + error); }
            chat.client.onUserExistsInRoom = function (nickname, roomName) {
                alert(lang.userExistsInRoom.replace("%s2", roomName).replace("%s", nickname));//The visitor %s is exists in the %s2 room
            }
            //http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client#connectionlifetime
            //SignalR provides the following connection lifetime events that you can handle:
            $.connection.hub.starting(function () {
                consoleLog('SignalR starting: Raised before any data is sent over the connection.');
            });
            $.connection.hub.received(function () {
                //consoleLog('SignalR received: Raised when any data is received on the connection. Provides the received data.');
            });
            $.connection.hub.connectionSlow(function () {
                consoleLog('SignalR connectionSlow: We are currently experiencing difficulties with the connection.');
            });
            $.connection.hub.reconnecting(function () {
                consoleLog('SignalR reconnecting: Raised when the underlying transport begins reconnecting.');
                beep();
                /*
                //Не могу обратно восстановить список посетителей после воссоединения с сервером. Почему то с сервера не вызывавются функции
                //Clients.Caller.onConnected(newUser, roomUsers);
                //Clients.All.onNewUserConnected(newUser, roomUsers.Count, ConnectionIDBefore, room.RoomName);
    
                //Remove all users
                //http://forum.vingrad.ru/forum/topic-263388.html
                var el = document.getElementById("chatusers");
                while (el.childNodes[0]) {
                    el.removeChild(el.childNodes[0]);
                }
                */
                disable(true);
            });
            $.connection.hub.reconnected(function () {
                var chatRoom = JSON.parse(JSON.stringify(g_chatRoom));//copy of object
                delete chatRoom.IRCchannel;
                //если я не удалю IRCchannel то будет ошибка:
                //jquery.signalR-2.0.0.js:1450 WebSocket is already in CLOSING or CLOSED state.
                //72.391 blink2: SignalR error: Error: WebSocket closed.
                //если попробовать отпавить файл на IRC канале на котором много посетителей.
                //Для примера зайти на irc.webmaster.com сервер, открыть #kampung канал. Там обычно больше 300 посетителей. Попробовать отправить файл
                consoleLog('SignalR reconnected: Raised when the underlying transport has reconnected. User: '
                    + JSON.stringify(deleteg_IRCuser()) + '. Room: ' + JSON.stringify(chatRoom));
                //var server = $.connection.chatHub.server;

                //Не могу обратно восстановить список посетителей после воссоединения с сервером. Почему то с сервера не вызывавются функции
                //Clients.Caller.onConnected(newUser, roomUsers);
                //Clients.All.onNewUserConnected(newUser, roomUsers.Count, ConnectionIDBefore, room.RoomName);
                //Поэтому в $.connection.hub.reconnecting не удаляю список посетителей


                //                    server.updateUser(g_user.id, g_user.nickname);
                //                    server.updateUser(JSON.stringify(g_user));

                //http://metanit.com/sharp/mvc5/16.2.php
                // обработка логина
                //                    chat.server.connect(JSON.stringify(g_user), JSON.stringify(g_chatRoom));

                disable(false);
            });
            $.connection.hub.stateChanged(function (state) {
                //http://stackoverflow.com/questions/9334838/signalr-detect-connection-state-on-client
                var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
                consoleLog('SignalR state changed from: ' + stateConversion[state.oldState]
                 + ' to: ' + stateConversion[state.newState]);

                function stateMessage(state) {
                    var message = "";
                    switch (state) {
                        case 0://connecting
                            message = (isRussian() ? "Соединение" : "Сonnecting") + "...";
                            break;
                        case 1://connected
                            message = "";
                            break;
                        case 2://reconnecting
                            message = '<img src="../img/Wait.gif" style="width:20px; height:20px;" alt="wait" />  ' +
                                (isRussian() ? "Восстановление соединения" : "Reconnecting") + "...";
                            break;
                        case 4://disconnected
                            message = (isRussian() ? "Потеря соединения" : "Disconnected")
                                + "... <input type='button' value='" + (isRussian() ? "Cоедениться снова" : "Connect again") + "' onclick='javascript: return onConnectAgain()' />";
                            break;
                        default:
                            ErrorMessage("Unknown SignalR state: " + state);
                            return;
                    }
                    MessageElement(message);
//                    onresize();//for compatibility with IE5
                }
                stateMessage(state.newState);
            });
            $.connection.hub.disconnected(function () {
                //эта строка вызывает исключение
                //Cannot read property 'send' of null
                //во время перезагрузки веб страницы
                //consoleLog('SignalR disconnected: Raised when the connection has disconnected.');
                console.log('SignalR disconnected: Raised when the connection has disconnected.');
            });
            $.connection.hub.error(function (error) {
                consoleError('SignalR error: ' + error)
            });

            //To enable client-side logging on a connection,
            //set the logging property on the connection object before you call the start method to establish the connection.
            //$.connection.hub.logging = true;

            // Start the connection.
            $.connection.hub.start().done(function () {
                $('#send').click(function () {
                    onClickSend();
                });
/*
                if (!init())
                    return;
*/
                init();
                init2();
            });
        } catch (e) {
            ErrorMessage(e.message);
        }
    });
}

function AddEventToChat(event, user, roomName) {
    AddMessageToChat(lang.user//'User '
        , user, event, roomName);
}

function AddMessageToChat(message, user, event, roomName) {
    var element = document.createElement("em");
    element.name = "message";
    if (typeof message == "string")
        element.appendChild(document.createTextNode(message));
    else if (Array.isArray(message)) {
        message.forEach(function (el) {
            switch(typeof el)
            {
                case "object":
                    element.appendChild(el);
                    break;
                case "string":
                    element.appendChild(document.createTextNode(el));
                    break;
                default: consoleError('typeof el: ' + typeof el);
            }
        });
    }
    else element.appendChild(message);
    if (typeof user != 'undefined')
        element.appendChild(AddElementUser(user, roomName));
    if (typeof event != 'undefined')
        element.appendChild(document.createTextNode(event));
    var elementUser = document.createElement("div");
    elementUser.appendChild(element);
    AddElement(elementUser);
}
//http://metanit.com/sharp/mvc5/16.2.php
//Добавление нового пользователя
function AddUser(newUser, ConnectionIDBefore, roomName) {
    var id = newUser.id;
    var name = newUser.nickname;
    var typeofRoomName = typeof roomName;
    var chatusers;
    if (typeofRoomName == "object") {
        chatusers = roomName;
    } else {
        var roomId;
        if ((typeofRoomName == 'undefined') || (roomName == null) || (roomName == g_chatRoom.RoomName))
            roomId = "chatusers";
        else roomId = "Users" + roomName;
        var chatusers = document.getElementById(roomId);
    }
    if (!chatusers)
        return null;

    var elementBefore = getElementBefore(ConnectionIDBefore);
    var myAccount = document.getElementById(id);
    if (myAccount) {
        if (id != g_user.id)
            consoleError('Duplicate user id = ' + id);
        //Если не передвигать мой аккаунт, то может получиться не правильная сортировака посеителей
        //когда новый посетитель по алфавиту должен быть вставлен перед моим аккаунтом
        myAccount = myAccount.parentElement;
        if (elementBefore)
            chatusers.insertBefore(myAccount, elementBefore);
        else chatusers.appendChild(myAccount);//move my account to the end of the users list
        return null;
    }
    var elUsers = chatusers.querySelectorAll('.user');
    for (var i = 0; i < elUsers.length; i++) {
        if (elUsers[i].userName == name) {
            consoleError('Duplicate user: "' + name + "'");
            return null;
        }
    }
    var user = document.createElement("div");
    user.className = 'user';
    user.userName = newUser.nickname;//name;
    var elementUser = AddElementUser(newUser, roomName, true);
    user.appendChild(elementUser);
    if (elementBefore)
        chatusers.insertBefore(user, elementBefore);
    else chatusers.appendChild(user);

    if ((g_chatRoom.privateRoomName == roomName) && (g_chatRoom.privateUserId == newUser.id)) {
        consoleLog("privateRoomName: " + roomName + ", private userName: " + name);
        var elTreeView = elementUser.querySelector('.treeView');
        elTreeView.params.boAddUser = true;
        myTreeView.onclickBranch(elTreeView);
        //                usersWindow(elementUser, true);
    }

//consoleLog('chatusers id : ' + document.getElementById('chatusers').id + ' childNodes.length ' + document.getElementById('chatusers').childNodes.length);
    return elementUser;
}
function onclickUser(id) {
    return onbranch('informer' + id, 'branchUser' + id);
};

function onConnectAgain() {
    //consoleLog("onConnectAgain()");
    location.reload();
}
function onclickFileTransfers() {
    return onbranchFast('informerFileTransfers', 'branchFileTransfers');
};
////////////////////////////////////////////////
//ckeditor http://sdk.ckeditor.com/samples/api.html
function InsertHTML(value) {
    // Get the editor instance that you want to interact with.
    var editor = CKEDITOR.instances.editor;

    // Check the active editing mode.
    if (editor.mode == 'wysiwyg') {
        // Insert HTML code.
        // http://docs.ckeditor.com/#!/api/CKEDITOR.editor-method-insertHtml
        editor.insertHtml(value);
    }
    else
        alert('You must be in WYSIWYG mode!');
}

function InsertText(value) {
    // Get the editor instance that you want to interact with.
    var editor = CKEDITOR.instances.ckeditor;

    // Check the active editing mode.
    if (editor.mode == 'wysiwyg') {
        // Insert as plain text.
        // http://docs.ckeditor.com/#!/api/CKEDITOR.editor-method-insertText
        editor.insertText(value);
    }
    else
        alert('You must be in WYSIWYG mode!');
}
//ckeditor http://sdk.ckeditor.com/samples/api.html
////////////////////////////////////////////////

//boBodyFocus = false if document is not visible.
//The document is not visible when the user minimizes the webpage or moves to another tab.
//Add * into document's title if it is not visible (boBodyFocus = false).
//Play sound if document is not visible (boBodyFocus = false) and new message has arrived from server.
//http://stackoverflow.com/questions/19519535/detect-if-browser-tab-is-active-or-user-has-switched-away/19519701#19519701
//Do not works in Safari 5.1
var vis = (function () {
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function (c) {
        if (c) {
            if (typeof eventKey === "undefined")
                consoleError("The page's visibility detection failed! eventKey === 'undefined'");
            else document.addEventListener(eventKey, c);
        }
        return !document[stateKey];
    }
})();
vis(function () {
    boBodyFocus = vis();
    //consoleLog(boBodyFocus ? 'Page visible' : 'Page not visible');
    if (boBodyFocus)
        documentTitle();
});
function onclickInvitations(id) {
    return onbranch('informerInvitations', 'branchInvitations');
};
function getUserString(user) {
    if (user.nickname == '')
        consoleError('invalud user.nickname: ' + user.nickname);
    var age = '';
    if (user.birthday)
        age = ' <span title="' + lang.age + '">'//Age
                + getAge(user.birthday)
            + '</span>: ';
    return ((typeof user.prefix == 'undefined') ? '' : user.prefix)
//        + getGenderString(user).gender + age + '<span id="userName" title="' + lang.aboutUser + ' ' + user.nickname + '">'//about
        + getGenderString(user).gender + age + '<span title="' + lang.aboutUser + ' ' + user.nickname + '">'//about
        + user.nickname + '</span>';
}
function displayMessage(callback) {
    var elMessage = document.createElement('div');
    elMessage.className = "center blok";
    elMessage.style.overflow = "auto";
    callback(elMessage);
    document.body.appendChild(elMessage);
}
