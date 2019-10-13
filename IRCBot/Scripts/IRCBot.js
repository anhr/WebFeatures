var lang = {}
$(function () {
    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;
    // Create a function that the hub can call to broadcast messages.
    chat.client.broadcastMessage = function (name, message) {
    };
    /// <summary>
    /// Add a channel elements into web page
    /// </summary>
    /// <param name="IRCServer">IRCBot.MyIRCServer</param>
    /// <param name="IRCChannel">IRCBot.ViewIRCCS</param>
    /// <param name="joined">true: посетитель находдится на канале</param>
    chat.client.onChannel = function (IRCServer, IRCChannel, joined) {
        consoleLog('onChannel(...) IRCServer: ' + IRCServer.URL + ' Nick: ' + IRCServer.Nick + ' Channel: ' + IRCChannel.Name + ' joined: ' + joined);
        IRCChannel.setStatus = function (joined, el) {
//            IRCChannel.joined = joined;
            elStatus = el.querySelector('#status');
            if (elStatus == null) return;//User has disconnected from IRC server (chat.client.onIRCDisconnected), but did not open the channel's branch before
            elStatus.innerHTML = joined ? 'Joined' : 'Parted';
        };
        findServer(IRCServer.URL, IRCServer.Nick, function (elIRCServer) {

            /// <param name="chaturbate">
            /// undefined or true - добавитиь ветку chaturbate
            /// </param>
            /// <remarks>
            /// если добавить ветку chaturbate в канал, который находится внутри пользователя с сайта chaturbate
            /// то получится вложенные списки пользователей с сайта chaturbate
            /// и тогда в function findServer появится лишний элемент #chaturbateList,
            /// который будет открываться с помошщью elChaturbateTreeView.onclick()
            /// а это в свою очередь, приведет к ошибке "Cannot read property 'href' of undefined"
            /// при вызове g_chaturbate.href2Nick(elChaturbate.user.href)//ветка ▼IRC еще не была открыта
            /// Для теститрования надо запустить "Connect to all IRC"
            /// </remarks>
            function createBranch(chaturbate) {
                if (chaturbate == undefined) chaturbate = true;
                var el = document.createElement("div");
                el.id = 'channel';
                el.style.display = 'none';
                el.innerHTML =
                      '<div id="reply"></div><div><input type="button" id="btnJoin" value="Join"><input type="button" id="btnPart" value="Part">'
                    + '<b>status: </b><span id="status"></span></div>'
                    + (chaturbate ? 
                          '<b>My topic: </b><input id="myTopic" value="' + IRCChannel.Topic.replace(/"/g, '&quot;') + '" style="width:100%">'
                        + '<input type="button" id="btnTopic" value="Set Topic ↓">'
                        + '<div><b>Real topic: </b><span id="topic"><span></div>'

                        //chat
                        + '<span id="chatBranch"></span>'
                        + '<div id="chat2" style="display:none;">'
                            + '<div class="messages" style="height:' + (document.body.clientHeight / 2) + 'px;">'
                                + '<span id="chatClear" class="sendButton" title="Clear replies">X</span>'
                                + '<div id="chat"></div>'
                            + '</div>'
                            + '<input id="chatInput" style="width:100%">'
                        + '</div>'
                        + '<div>В списке посетителей не будут посторонние посетители до того, как на него не вошел владелец канала</div>'
                        + '<div id="users"><div id="usersList" style="display:none"></div></div>'
                    : '')
                ;

                var elBtnJoin = el.querySelector('#btnJoin');
                IRCChannel.setStatus(joined, el);
                if (joined) {
                    if (chaturbate) {//get topic and channel users list only for owner of the channel
                        chat.server.ircGetTopic(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
                        chat.server.ircNames(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
                    }
                }
/*
                var elStatus = el.querySelector('#status');
                if (joined) {
                    elStatus.innerHTML = 'Joined';
                    if (chaturbate) {//get topic and channel users list only for owner of the channel
                        chat.server.ircGetTopic(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
                        chat.server.ircNames(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
                    }
                } else {
                    elStatus.innerHTML = 'Parted';
                }
*/
                elBtnJoin.onclick = function () {
                    //Раньше IRCServer приходил из моего сервера когда вызывался chat.client.onChannel
                    //Этот IRCServer не могу использовать потому что когда ник слишком длинный, то при следующем соединении к IRC серверу он укорачивается
                    //и IRCServer.Nick неверный.
                    //Если ник слишком длинный, то вызывается IRCClient.MaxNickLength += (s, e) =>
                    //в котором вызывается IRC команда QUIT
                    //по которой вызывается IRCClient.Disconnected += (s, e) =>
                    //в которой удаляется старый MyIrcClient
                    IRCServer = getParentIRCServer(this);

                    var message = 'Joining to #' + IRCChannel.Name + '. ' + IRCServer.URL + ' nick: ' + IRCServer.Nick;
                    consoleLog(message);
                    el.querySelector('#status').innerHTML = getWaitIconBase() + ' ' + message;
                    chat.server.ircAddChannel(IRCServer.URL, IRCServer.Nick, JSON.stringify(IRCChannel));
                }
                el.querySelector('#btnPart').onclick = function () {
                    var message = 'Parting #' + IRCChannel.Name + '...';
                    consoleLog(message);
                    el.querySelector('#status').innerHTML = getWaitIconBase() + ' ' + message;
                    var elTopic = el.querySelector('#topic');
                    if (elTopic != null) elTopic.innerHTML = '';//топика нет у посетителя с сайта https://chaturbate.com/
                    chat.server.ircPartChannel(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
                };

                if (!chaturbate) return el;

                //Chat
                el.querySelector('#chatBranch').appendChild(myTreeView.createBranch({
                    name: 'Chat',
                    params: {
                        //animate: true,появляется горизонтальный скролл
                        createBranch: function () { return el.querySelector('#chat2'); }
                    }
                }));
                el.querySelector('#chatClear').onclick = function (event) {
                    consoleLog('chatClear');
                    el.querySelector('#chat').innerHTML = '';
                }
                el.querySelector('#chatInput').onkeyup = function (event) {
                    if (event.key != 'Enter')
                        return;
                    var message = event.target.value;
                    if (message == '')
                        return;
                    var channelName = ChannelName(IRCChannel.Name);
                    chat.server.sendMessage(IRCServer.URL, IRCServer.Nick, message, channelName);
                    if (elIRCServer.IRCServer.connected) {
                        //Если оставить эту строку, то в окне id=chat2 будут появляться сообщения от пользователя, владельца канала, даже если он не подключен к IRC серверу
                        //Если убрать эту строку, то в окне id=chat2 не будут появляться сообщения от пользователя, владельца канала, потому что посетитель не получает ответ PRIVMSG на собственные сообщения
                        AddMessageToChat(IRCServer.URL, channelName, IRCServer.Nick, message);
                        event.target.value = '';
                    }
                    else alert('Connect to IRC server first');
                }

                el.querySelector('#users').appendChild(myTreeView.createBranch({
                    name: "Users",
                    params: { createBranch: function () { return el.querySelector('#usersList'); } }
                }));
                el.querySelector('#btnTopic').onclick = function () {
                    IRCChannel.Topic = el.querySelector('#myTopic').value;
                    $.connection.chatHub.server.ircSetTopic(IRCServer.URL, IRCServer.Nick, IRCChannel.Name, IRCChannel.Topic);
                };
                return el;
            }

            //Add channel
            var elChannels = elIRCServer.querySelector('#channels');
            for (i = 0; i < elChannels.childNodes.length; i++) {
                if (elChannels.childNodes[i].IRCChannel.Name == IRCChannel.Name) return;
            };
            var elBranch = myTreeView.createBranch({
                name: ChannelName(IRCChannel.Name),
                id: 'channelRoot',
                params:
                {
                    createBranch: function () {
                        var el = elBranch.querySelector('#channel');
                        if (el == null) el = createBranch(getParentIRCServerElement(elBranch).IRCServer.chaturbate == undefined ? true : false);
                        return el;
                    }
                }
            });
            if (joined) elBranch.appendChild(createBranch(elIRCServer.IRCServer.chaturbate == undefined ? true : false ));
            elBranch.IRCChannel = IRCChannel;
            elChannels.appendChild(elBranch);
            chat.server.ircChanelCreated(IRCServer.URL, IRCServer.Nick, IRCChannel.Name);
        }, true);
    };
    chat.client.onEventLogEntry = function (eventLogEntry) {
        myEventLog.onEventLogEntry(eventLogEntry);
    };
    chat.client.onChaturbateUserRemove = function (ServerHostname, href) {
        consoleLog('onChaturbateUserRemove ' + ServerHostname + ' href: ' + href);
        findIRCServer(ServerHostname, function (elIRCServer) {
            var elChaturbateList = elIRCServer.querySelector('#chaturbateList');
            for (var i = 0; i < elChaturbateList.childNodes.length; i++) {
                var elChaturbate = elChaturbateList.childNodes[i];
                if (elChaturbate.tagName.toUpperCase() == "IMG")
                    continue;//список посетителей с сайта Chaturbate еще не открыт. Вместо списка там картинка wait
                if (elChaturbate.user.href == href) {
                    elChaturbate.parentElement.removeChild(elChaturbate);
                    break;
                }
            }
        });
    }
    function IRCDlg(IRCServer, isChaturbate) {
        if (isChaturbate == undefined) isChaturbate = false;
        var el = document.createElement('div');
        el.style.display = 'none';
        el.className = 'IRCServer';
        el.IRCServer = IRCServer;
        el.innerHTML = getSynchronousResponse('IRC.html') + (isChaturbate ? 
            '<div id="chaturbate"><div id="chaturbateBranch" style="display:none">'
                + '<input id="btnUpdateChaturbate" type="button" value="Update">'
                + '<input id="btnChaturbateListToggle" type="button" value="Open" title="Open all chaturbate users">'
                + '<input id="btnChaturbateConnect" type="button" value="Update and Connect" title="Update chaturbate users list and connect all chaturbate users to IRC">'
                + '<input id="btnChaturbateStop" type="button" value="Stop" title="Stop connect all chaturbate users to IRC">'
                + '<input id="btnChaturbateDisconnect" type="button" value="Disconnect" title="Disconnect all from IRC">'
                + '<span id="status"></span>'
                + '<div id="chaturbateList"></div>'
            + '</div></div>'
            : ''
            )
        ;

        //Это нужно для function getParentIRCServerElement(el) 
        //что бы не появлялось сообщение об ошибке 'getParentIRCServerElement failed!'
        //когда я автоматически присоединяю к IRC серверу посетителей с сайта Chaturbate
        // и закрыл ветку Chaturbate.
        // В этом случае я не могу найти ParentIRCServerElement потому что ветка Chaturbate скрыта 
        // и содержится в branchElement, которая не имеет родитеьского элемента
        var elChaturbateBranch = el.querySelector('#chaturbateBranch');
        if (elChaturbateBranch != null) elChaturbateBranch.IRCDlg = el;

        if (isChaturbate){
            el.querySelector('#btnUpdateChaturbate').onclick = function (event) {
                consoleLog('Update Chaturbate');
                chat.server.chaturbateUsers(IRCServer.URL, false);
            }
            var boOpenAll = true,
                elBtnChaturbateListToggle = el.querySelector('#btnChaturbateListToggle'),
                chaturbateList = '#chaturbateList',
                elChaturbateList = el.querySelector(chaturbateList);
            elChaturbateList.innerHTML = getWaitIconBase();
            elChaturbateList.IRCParams = {
                emptyList: true//set to false after adding of the first user into ChaturbateList
            };
            elBtnChaturbateListToggle.onclick = function (event) {
                consoleLog('Chaturbate List Toggle');
                var treeView = '.treeView';
                el.querySelector(chaturbateList).childNodes.forEach(function (elUser) {
                    var elTreeView = elUser.querySelector(treeView);
                    if (elTreeView.querySelector('.triangle').innerHTML == "▼") {
                        if (!boOpenAll)
                            elUser.querySelector(treeView).onclick();
                    } else {
                        if (boOpenAll)
                            elUser.querySelector(treeView).onclick();
                    }
                });
                boOpenAll = !boOpenAll;
                if (boOpenAll) {
                    elBtnChaturbateListToggle.value = 'Open';
                    elBtnChaturbateListToggle.title = 'Open all users';
                } else {
                    elBtnChaturbateListToggle.value = 'Close';
                    elBtnChaturbateListToggle.title = 'Close all users';
                }
            }
            //Connect all chaturbate users to IRC
            el.querySelector('#btnChaturbateConnect').onclick = function (event) {
                consoleLog('Chaturbate connect all');
                chat.server.ircChaturbateConnectAll(getParentIRCServer(el).URL);
            }
            el.querySelector('#btnChaturbateStop').onclick = function (event) {
                consoleLog('Stop chaturbate connect all');
                chat.server.ircChaturbateStopConnectAll(IRCServer.URL);
            }
            el.querySelector('#btnChaturbateDisconnect').onclick = function (event) {
                consoleLog('chaturbate disconnect all');
                var elchaturbateList = el.querySelector(chaturbateList);
                elchaturbateList.childNodes.forEach(function (elUser) {
                    if (!elUser.user.connected) return;
                    var btnConnect = '#btnConnect',
                        detailsBranch = '#detailsBranch',
                        treeView = '.treeView',
                        IRC = '#IRC',
                        elBtnConnect = elUser.querySelector(btnConnect);
                    if (!elBtnConnect) {
                        var elDetailsBranch = elUser.querySelector(detailsBranch);
                        if (!elDetailsBranch) {
                            elUser.querySelector(treeView).onclick();
                            elDetailsBranch = elUser.querySelector(detailsBranch);
                        }
                        var elIRC = elDetailsBranch.querySelector(IRC);
                        if (!elIRC) {
                            elDetailsBranch.querySelector(treeView).onclick();
                            elIRC = elDetailsBranch.querySelector(IRC);
                        }
                        elBtnConnect = elIRC.querySelector(btnConnect);
                        if (!elBtnConnect) {
                            elIRC.querySelector(treeView).onclick();
                            elBtnConnect = elUser.querySelector(btnConnect);
                        }
                    }
                    elBtnConnect.onclick();
                });
            }
            el.querySelector('#chaturbate').appendChild(myTreeView.createBranch({
                name: "Chaturbate",
                id: 'chaturbateRoot',
                params: {
                    createBranch: function () { return el.querySelector('#chaturbateBranch'); },
                    onOpenBranch: function (a) {
                        consoleLog('get Chaturbate list');
                        var elChaturbateList = el.querySelector(chaturbateList);
                        if (elChaturbateList.IRCParams.copyUsers) chat.server.chaturbateCopyUsers(IRCServer.URL);//, IRCChannel.Name);
                        else {
                            if (elChaturbateList.IRCParams.emptyList)//получить список только если он пустой
                                //иначе список будет считываться дважды если поставлена галочка updateChaturbate периодического обновления списка
                                //и пользователь нажал btnConnect соединеня с IRC сервером владельца канала
                                chat.server.chaturbateUsers(IRCServer.URL, true);
                        }
                    },
                }
            }));
        }
        el.querySelector('#nick').value = IRCServer.Nick;
        el.querySelector('#pass').innerHTML = IRCServer.Pass;
        el.querySelector('.messages').style.height = (document.body.clientHeight / 2) + 'px';

        //Replies
        el.querySelector('#repliesBranch').appendChild(myTreeView.createBranch({
            name: 'Replies',
            params: {
                //animate: true,появляется горизонтальный скролл
                createBranch: function () { return el.querySelector('#replies2'); }
            }
        }));
        el.querySelector('#repliesClear').onclick = function (event) {
            consoleLog('repliesClear');
            el.querySelector('#replies').innerHTML = '';
        }
        el.querySelector('#command').onkeyup = function (event) {
            if (event.key != 'Enter')
                return;
            var command = event.target.value;
            if (command == '')
                return;
            if ((command.length > 0) && (command[0] == '/'))
                command = command.substring(1);
            var message = 'command: ' + command;
            consoleLog(message);
            AddMessage('[RAW]: ' + command, IRCServer.URL, IRCServer.Nick)
            chat.server.ircGet(IRCServer.URL, IRCServer.Nick, command);
            event.target.value = '';
        }
        /// после создания диалога IRC.html надо добавить туда каналы. 
        /// Иначе, после обновления веб станицы не будет видно веток с каналаами у пользователя с сайта https://chaturbate.com/
        /// если до обновления веб страницы этот пользователь уже был присоединен к IRC серверу
        chat.server.getChanels(IRCServer);
        return el;
    }
    function parentUser(el) {
        var parentElement = el.parentElement;
        while ((parentElement != undefined) && (parentElement.user == undefined)) parentElement = parentElement.parentElement;
        return parentElement;
    }
    function connectAndStatus(el, IRCServer, connected) {
        //el.IRCServer и IRCServer не совпадают.
        //el.IRCServer это параметры владелца канала 
        //IRCServer это параметры текущего прользователя. У него нет функции setStatus
        el.IRCServer.setStatus(connected, el);
        el.querySelector('#btnConnect').onclick = function () {
            var parentElement = parentUser(el);
            if (IRCServer.URL == undefined) {//connecting to IRC of chaturbate user
                parentElement.user.connected = connected;
                Object.assign(IRCServer, getParentIRCServer(parentElement));
                IRCServer.Pass = '';
                IRCServer.chaturbate = parentElement.user;
            }
            var elNick = el.querySelector('#nick');
            IRCServer.Nick = elNick.value;
            if ((IRCServer.MaxNickLength != undefined) && (IRCServer.MaxNickLength <= IRCServer.Nick.length)) {
                IRCServer.Nick = IRCServer.Nick.substr(0, IRCServer.MaxNickLength);
                elNick.value = IRCServer.Nick;
                delete IRCServer.MaxNickLength;
            }
            var message = 'Toggle connection ' + IRCServer.URL + ' ' + IRCServer.Nick + '...';
            consoleLog(message);
            el.querySelector('#status').innerHTML = getWaitIconBase() + ' ' + message;
            chat.server.ircConnect(JSON.stringify(IRCServer));
        }
    }
    chat.client.onChaturbateUser = function (ServerHostname, user, connected, IRCnick)
    {
        user.connected = connected;
/*
//debug
var childNodes = document.querySelector('#chaturbateList').childNodes;
if ((childNodes.length > 0) && (childNodes[0].user != undefined) && (childNodes[0].user.connected == undefined))
    consoleError('user.connected = ' + childNodes[0].user.connected);
*/
        //consoleLog( 'onChaturbateUser ' + ServerHostname + ' user: ' + user.href + ' connected = ' + connected);
        findIRCServer(ServerHostname, function (elIRCServer) {
            var elChaturbateRoot = elIRCServer.querySelector('#chaturbateRoot'),
                elChaturbateList = elIRCServer.querySelector('#chaturbateList');
            if (elChaturbateList == null)
                consoleError('chat.client.onChaturbateUser failed! elChaturbateList == null');
            if (elChaturbateList.IRCParams.emptyList) {
                elChaturbateList.innerHTML = '';//clear wait icon
                elChaturbateList.IRCParams.emptyList = false;
            }

            //Не хочу открывать ветку Chaturbate каждый раз когда добавляется новый посетитель
            // потому что после обновления веб страницы во время атоматического присоедиения сразу к нескольким IRC сервера посетителей с сайта Chaturbate
            //открывается сразу много веток
            //if (!myTreeView.isOpenedBranch(elChaturbateRoot)) elChaturbateRoot.querySelector('.treeView').onclick();

            var elBefore;
            for (var i = 0; i < elChaturbateList.childNodes.length; i++) {
                var elChaturbate = elChaturbateList.childNodes[i];
                if (elChaturbate.user.href == user.href) {
                    //update user
                    /*for debugging
                    if (elChaturbate.user.cams.viewers != user.cams.viewers)
                        consoleWarn('Chaturbate update user: ' + user.href
                            + ' old viewers: ' + elChaturbate.user.cams.viewers + ' new viewers: ' + user.cams.viewers);
                    */
                    var elImg = elChaturbate.querySelector('#img');
                    g_chaturbate.details(elChaturbate, user, elImg == null ? undefined : { width: parseInt(elImg.style.width) });

                    //move elChaturbate up or down
                    var nextElementSibling = elChaturbate.nextElementSibling;
                    while ((nextElementSibling != null) && (nextElementSibling.user.cams.viewers > elChaturbate.user.cams.viewers))
                        nextElementSibling = nextElementSibling.nextElementSibling;
                    if (nextElementSibling != elChaturbate.nextElementSibling)
                        elChaturbateList.insertBefore(elChaturbate, nextElementSibling);
                    else {
                        var previousElementSibling = elChaturbate.previousElementSibling;
                        while ((previousElementSibling != null) && (previousElementSibling.user.cams.viewers < elChaturbate.user.cams.viewers))
                            previousElementSibling = previousElementSibling.previousElementSibling;
                        if (previousElementSibling != null) {
                            if (previousElementSibling != elChaturbate.previousElementSibling) {
                                //consoleError('under constraction');//мне кажется сюда вообще не может попасть
                                if (previousElementSibling.nextElementSibling)
                                    elChaturbateList.insertBefore(elChaturbate, previousElementSibling.nextElementSibling);
                                else consoleError('previousElementSibling.nextElementSibling = ' + previousElementSibling.nextElementSibling)
                            }
                        }
                        //если оставить эту строку то неверно сортируется первый пользователь с сайта Chaturbate 
                        //после обновления списка пользователей с сайта Chaturbate 
                        //else elChaturbateList.appendChild(elChaturbate);
                    }
                    return;
                }
                if ((elChaturbate.user.cams.viewers < user.cams.viewers) && (elBefore == undefined)) {
                    elBefore = elChaturbate;
/*
                    //debug
                    for (var j = 0; j < elChaturbateList.childNodes.length; j++) {
                        var elChaturbate = elChaturbateList.childNodes[j];
                        if (elChaturbate.user.href == user.href) {
                            consoleError('Duplicate User: ' + user.href);
                            return;
                        }
                    }
                    
                    elChaturbateList.insertBefore(elUser, elChaturbate);
                    return;
*/
                }
            }
            var elUser = document.createElement("div");
            elUser.user = user;
            elUser.user.connected = connected;
            elUser.appendChild(myTreeView.createBranch(
                {
                    name: (connected ? '<span title="connected" id="connected">⚡</span>' : '')
                        + '<span title="' + user.gender + '">' + g_chaturbate.genderImg(user.gender)
                        + '</span> <span title="age">' + user.age + '</span> '
                        + '</span> <span id="viewers" title="viewers">' + user.cams.viewers + '</span> '//for debugging
                        + user.href,
                    params: {
                        createBranch: function () {
                            var el = document.createElement('div'),
                                path = '../SignalRChat/Scripts/IRC/Chaturbate/';
                            el.innerHTML = getSynchronousResponse(path + 'ChaturbateUser.html');
                            /*если я тут буду загружать файл с языком, то почемуто функция,
                            которая должна вызываться после загрузки, вызывается еще до полной загрузки 
                            Сейчас этот файл я загружаю в $.connection.hub.start().done
                            loadScript(path + 'lang/' + getLanguageCode() + '.js', function () {
                                g_chaturbate.userDlg(el, user, {
                                    //video: { width: 0, height: 0 },
                                    img: { width: 150 },
                                });
                            });
                            */
                            g_chaturbate.userDlg(el, user, {
                                //video: { width: 0, height: 0 },
                                img: { width: 150 },
                            });
                            el.querySelector('#IRC').appendChild(myTreeView.createBranch({
                                name: "IRC",
                                params: {
                                    createBranch: function () {
                                        var IRCServer = {
                                            Nick: IRCnick == null ? g_chaturbate.href2Nick(user.href) : IRCnick,
//                                            URL: getParentIRCServer(el).URL,
                                            URL: ServerHostname,
                                            chaturbate: user,
                                            setStatus: elIRCServer.IRCServer.setStatus,
                                        }
                                        var elDlg = IRCDlg(IRCServer);
                                        connectAndStatus(elDlg, IRCServer, connected);
                                        //connections is incorrect if another user is connected after calling of chat.client.onChaturbateUser
                                        //displayConnections(el, connections);
                                        return elDlg;
                                    }
                                }
                            }));
                            return el;
                        }
                    }
                })
            );
            if (elBefore != undefined) elChaturbateList.insertBefore(elUser, elBefore);
            else elChaturbateList.appendChild(elUser);
        });
    }
    chat.client.onIRCServer = function (IRCServer, connected, connections) {
        consoleLog('IRCServer: ' + IRCServer.URL);
        IRCServer.setStatus = function (connected, el, status) {
            var elBtnConnect = el.querySelector('#btnConnect');
            var elStatus = el.querySelector('#status');
            if (connected) {
                elBtnConnect.value = 'Disconnect.';
                elStatus.innerHTML = 'Connected.';
            } else {
                elBtnConnect.value = 'Connect.';
                elStatus.innerHTML = 'Disconnected.';
            }
            if (status != undefined)
                elStatus.innerHTML += ' ' + status;
            el.IRCServer.connected = connected;
        };
        var elIRCServersList = document.getElementById("IRCServersList");
        if (elIRCServersList.childNodes[0].tagName == "IMG")
            elIRCServersList.innerHTML = '';
        elIRCServersList.appendChild(myTreeView.createBranch({
            name: IRCServer.URL,
            params:
            {
                createBranch: function () {
                    var el = IRCDlg(IRCServer, true),
                        elConnections = document.createElement('span');
                    elConnections.innerHTML =
                          '<div>'
                            + '<input type="checkbox" id="updateChaturbate" /><label for="updateChaturbate">Connect all chaturbate users and update chaturbate list every </label>'
                            + '<input id="updateChaturbatePeriod" value="50" /><span> sec. </span>'//Time of update of https://chaturbate.com/ is 50 sec.
                            + '<span> Max connections: </span><input id="maxConnections"/>'
                            + '<span> Next connection delay: </span><span id="nextConnection"></span><span> millisecs.</span>'
                            + '<span id="serverStatus"></span>'
                            + '<span id="chaturbateRestart"></span>'
                        + '</div>'
                        + '<b>connections:</b><span id="connections"></span>';

                    //update chaturbate period
                    chat.server.getUpdateChaturbatePeriod(IRCServer.URL);
                    elConnections.querySelector("#updateChaturbate").onclick = function () {
                        consoleLog('onclick updateChaturbate');
                        chat.server.updateChaturbateEvery(this.checked ? parseInt(elConnections.querySelector("#updateChaturbatePeriod").value) : 0
                            , IRCServer.URL);
                        if (el.IRCServer.connected == false)
                            el.querySelector('#btnConnect').onclick();//присоеденить владельца канала к IRC серверу
                    }

                    el.insertBefore(elConnections, el.childNodes[0]);

                    connectAndStatus(el, IRCServer, connected);
                    displayConnections(el, connections);
                    return el;
                }
            }
        }));
    }
    chat.client.onMessageElement = function (message) {
        MessageElement(message);
    }
    chat.client.onUpdateChaturbatePeriod = function (ServerHostname, period) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            var elUpdateChaturbate = elIRCServer.querySelector('#updateChaturbate');
            if (period == 0) {
                elUpdateChaturbate.checked = false;
            } else {
                elUpdateChaturbate.checked = true;
                elIRCServer.querySelector('#updateChaturbatePeriod').value = period;
            }
        });
    }
    chat.client.onMaxConnections = function (ServerHostname, maxConnections) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            elIRCServer.querySelector('#maxConnections').value = maxConnections;
        });
    }
    chat.client.onNextConnectionDelay = function (ServerHostname, nextConnectionDelay) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            elIRCServer.querySelector('#nextConnection').innerHTML = nextConnectionDelay;
        });
    }
    chat.client.onUpdateChaturbate = function (ServerHostname, checked) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            elIRCServer.querySelector('#updateChaturbate').checked = checked;
        });
    }
    function displayConnections(elIRCServer, connections) {
        var connectionsId = '#connections',
            elConnections = elIRCServer.querySelector(connectionsId);
        if (elConnections == null) {
            elIRCServer = getParentIRCServerElement(elIRCServer.parentElement);
            elConnections = elIRCServer.querySelector(connectionsId);
        }
        if (elConnections == null) {
            elIRCServer = getParentIRCServerElement(elIRCServer.parentElement);
            elConnections = elIRCServer.querySelector(connectionsId);
        }

        //debugging
        if (elConnections == null)
            consoleError('elConnections: ' + elConnections);
        var connectionsLocal = elIRCServer.IRCServer.connected == true ? 1 : 0,
            elChaturbateList = elIRCServer.querySelector('#chaturbateList');
        if (elChaturbateList && !elChaturbateList.IRCParams.emptyList) {
            elChaturbateList.childNodes.forEach(function (elUser) {
                if (elUser.tagName == "IMG") return;//ChaturbateList is empty
                if (elUser.user.connected == undefined) {
                    consoleError(elIRCServer.IRCServer.URL + ' elUser.user.connected = ' + elUser.user.connected);
                    return;
                }
                if (elUser.user.connected) connectionsLocal++;
            });
            //Проверку количества присоединенных к IRC серверу пользователей можно только если была открыта ветка со списком пользователей с сайта Chaturbate
            // потому что в противном случае elUser.user.connected еще не известен
            if (connectionsLocal != connections) {
                consoleError(elIRCServer.IRCServer.URL + ' connectionsLocal ' + connectionsLocal + ' != connections ' + connections);
                //Найти посетителя у которого неверно указано elIRCServer.IRCServer.connected
                chat.server.testConnections(elIRCServer.IRCServer.URL);
            }
        }

        elIRCServer.IRCServer.connections = connections;
        elConnections.innerHTML = connections;
    }
    /// <summary>
    /// проверить каждого посетителя присоединен он к IRC серверу или нет.
    /// </summary>
    /// <param name="ServerHostname"></param>
    /// <param name="nick"></param>
    /// <param name="connected">
    /// true: пользователь nick на моем сервере определен как присоедененный к IRC серверу
    /// </param>
    /// <remarks>
    /// В displayConnections обнаружилась ошибка в количестве соединений к IRC серверу.
    /// Изменить статус пользователя на веб странице если он не совпадает с его статусом на моем сервере.
    /// Отправить на мой сервер testConnectionsFailed(...) если на веб странице не найден посетитель, который есть на моем сервере
    /// </remarks>
    chat.client.onTestConnections = function (ServerHostname, nick, connected) {
        //        consoleLog('chat.client.onTestConnections(' + ServerHostname + ', ' + nick + ', connected = ' + connected + ')');
        var res = findServer(ServerHostname, nick, function (elIRCServer){
            elIRCServer.IRCServer.testConnection = true;
            if (elIRCServer.IRCServer.connected == connected) return;
            consoleError('chat.client.onTestConnections(' + ServerHostname + ', ' + nick + ', connected = ' + connected +
                ') elIRCServer.IRCServer.connected ' + elIRCServer.IRCServer.connected + ' != ' + connected);
            elIRCServer.IRCServer.setStatus(connected, elIRCServer, 'Test connections failed!');
        });
        if (res == '')
            return;
        consoleError('chat.client.onTestConnections(' + ServerHostname + ', ' + nick + ', connected = ' + connected +
            ') failed! elIRCServer is not found. ' + res + ' Removing of ' + nick + ' from my server');
        //тупо удаляю с сервера посетителя, которого нет на веб странице, потому что не знаю почему его там нет.
        chat.server.testConnectionsFailed(ServerHostname, nick);
    }
    /// <summary>
    /// Удалить с веб страницы всех посетителей, которых нет на моем веб сервере
    /// </summary>
    chat.client.onTestConnectionsStop = function (ServerHostname) {
        findChaturbateList(ServerHostname, function (elChaturbateList) {
            for (var i = elChaturbateList.childNodes.length - 1; i >= 0; i--) {
                var elChild = elChaturbateList.childNodes[i],
                    elIRCServer = elChild.querySelector('.IRCServer');
                if(elIRCServer != null){
                    if (!elIRCServer.IRCServer.testConnection) {
                        consoleError(elIRCServer.IRCServer.URL +
                            ' ' + elIRCServer.IRCServer.Nick +
                            ' elIRCServer.IRCServer.testConnection = ' + elIRCServer.IRCServer.testConnection +
                            ' Removing of ' + elIRCServer.IRCServer.Nick + ' from web page'
                            );
                        elChaturbateList.removeChild(elChild);
                        //                    elIRCServer.IRCServer.setStatus(!elIRCServer.IRCServer.connected, elIRCServer, 'Test connections failed!');
                    }
                    else delete elIRCServer.IRCServer.testConnection;
                }
            }
/*отказался от этого кода потому что трудно удалить пользователя из elChaturbateList потому что у пользователя очень далеко находится родитель elChaturbateList
            elChaturbateList.querySelectorAll('.IRCServer').forEach(function (elIRCServer) {
                if (!elIRCServer.IRCServer.testConnection) {
                    consoleError(elIRCServer.IRCServer.URL +
                        ' ' + elIRCServer.IRCServer.Nick +
                        ' elIRCServer.IRCServer.testConnection = ' + elIRCServer.IRCServer.testConnection +
                        ' Removing of ' + elIRCServer.IRCServer.Nick + ' from web page'
                        );
//                    elIRCServer.IRCServer.setStatus(!elIRCServer.IRCServer.connected, elIRCServer, 'Test connections failed!');
                }
                delete elIRCServer.IRCServer.testConnection;
            });
*/
        });
    }
    function removeUserFromAllChannels(ServerHostname, nick) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            var channelRootList = elIRCServer.querySelectorAll('#channelRoot');
            for (var i = 0; i < channelRootList.length; i++) {
                var elChannelRoot = channelRootList[i];
                if (getParentIRCServer(elChannelRoot).chaturbate == undefined)//Это условие выполняется только для корневого elIRCServer
                    //Корневой elIRCServer имеет дочерние elIRCServer для каждого посетителя с сайта https://chaturbate.com/
                    //Поэтому channelRootList содержит указатели на элементы channelRoot для каждого посетителя с сайта https://chaturbate.com/
                    // Но список joined to channel users имеет только корневой elIRCServer.
                    // Остальные elIRCServer надо игнорировать.
                    //Иначе будет очень мого бесполезных вызовов этой функции
                    IRCUserPartedChannel(ServerHostname, elChannelRoot.IRCChannel.Name, nick);
            }
        });
    }
    chat.client.onIRCSetStatus = function (ServerHostname, nick, message) {
        consoleLog('onIRCSetStatus(' + ServerHostname + ', ' + nick + ', message: ' + message + ')');
        findServer(ServerHostname, nick, function (elIRCServer) {
            elIRCServer.IRCServer.setStatus(false, elIRCServer, message);
        });
    }
    chat.client.onChaturbateRestart = function (ServerHostname, message) {
        consoleLog('onChaturbateRestart(' + ServerHostname + ', message: ' + message + ')');
        var elIRCServer = findServerRoot(ServerHostname);
        if (elIRCServer == null) {
            consoleError('elIRCServer == null');
            return;
        }
        elIRCServer.querySelector("#chaturbateRestart").innerHTML = ' ' + message;
    }
    chat.client.onIRCDisconnected = function (ServerHostname, nick, message, connections) {
        consoleLog('onIRCDisconnected(' + ServerHostname + ', ' + nick + ', connections = ' + connections + ', message: ' + message + ')');

        //эта функция не вызывается на сервере irc.freenode.net
        //Вместо нее вызывается chat.client.onIRCUserQuit

        var res = findServer(ServerHostname, nick, function (elIRCServer) {
            elIRCServer.IRCServer.connected = false;
            var elParentUser = parentUser(elIRCServer);
            if (elParentUser) {
                elParentUser.user.connected = false;
                var elName = elParentUser.parentElement.querySelector('.treeView').querySelector('.name'),
                    elConnected = elName.querySelector('#connected');
                if (elConnected == null) consoleError('Find #connected failed!');
                else elName.removeChild(elConnected);
            }
            elIRCServer.IRCServer.setStatus(false, elIRCServer, message);
            findChannel(ServerHostname, nick, null, function (elChannel) {
                var elTopic = elChannel.querySelector('#topic');
                if (elTopic != null) elTopic.innerHTML = '';
                var elStatus = elChannel.querySelector('#status');
                if (elStatus != null) elStatus.innerHTML = '';
                elChannel.IRCChannel.isSetTopic = 0;

                IRCUserPartedChannel(ServerHostname, elChannel.IRCChannel.Name, nick);
                displayConnections(elIRCServer, connections);
            });
        });
        if (res != '') {
            //Сюда порадает после обновления списка посетителей с сайта Chaturbate
            //когда посетитель был присоединен к IRC серверу и прекратил трансляцию
            //В этом случае посетитель уже был удален в функции onChaturbateUserRemove
            //consoleError(res);
        } else {
            message = message.toLowerCase();
            if (
                (message.indexOf('banned') == -1)//for irc.webmaster.com IRC server
                && (message.indexOf('kill') == -1)//for irc.webmaster.com IRC server
                )
                AddMessage(message, ServerHostname, nick);
            else AddError(message, ServerHostname, nick);
        }
        removeUserFromAllChannels(ServerHostname, nick);
    }
    chat.client.onIRCNickInUse = function (e, ServerHostname) {
        consoleLog('onIRCNickInUse. ServerHostname: ' + ServerHostname + ' nick: ' + e.InvalidNick);
        AddError('Nick in use', ServerHostname, e.InvalidNick);
    }
    chat.client.onIRCIsConnected = function (message) { alert("onIRCIsConnected under constraction"); }
    chat.client.onIRCConnect = function (e, ServerHostname, nick) {
        if (ServerHostname == undefined) ServerHostname = '';
        consoleLog('onIRCConnect(' + ServerHostname + ', ' + nick + ', ' + (typeof e.Message == 'undefined' ? '' : e.Message.RawMessage) + ')');
        if (e != '') {
            //consoleError('Connect to IRC failed!');
            var message = "";
            if (typeof e.Error != 'undefined') {
                message = e.Error.Message;
                if (e.Error.InnerExceptions != undefined) for (var i = 0; i < e.Error.InnerExceptions.length; i++)
                    message += ' ' + e.Error.InnerExceptions[i].Message;
            } else if (typeof e.Command != 'undefined') {
                if (typeof e.InvalidNick != 'undefined') {
                    //с таким ником нельзя присоединиться к IRC серверу
                    message += ' ' + 'nick: ' + e.InvalidNick;
                } else consoleError("e.InvalidNick: " + e.InvalidNick);
                if (typeof e.Message != 'undefined') {
                    message += ' ' + e.Message;
                } else consoleError("e.Message: " + e.Message);
            } else if (typeof e.Message != 'undefined') {//":verne.freenode.net 461 bonalink USER :Not enough parameters"
                if (typeof e.Message.RawMessage != 'undefined') {
                    function defaultMessage() {
                        var message = e.Message.Command;//e.Message.RawMessage;
                        for (var item in e.Message.Parameters)
                            message += ' ' + (item == '2' ? ':' : '') + e.Message.Parameters[item];
                        return message;
                    }
                    switch (parseInt(e.Message.Command)) {
                        case 451://ERR_NOTREGISTERED ":You have not registered" - Returned by the server to indicate that the client must be registered before the server will allow it to be parsed in detail.
                            message = 'You have not registered.';
                            break;
                        case 442://ERR_NOTONCHANNEL "<channel> :You're not on that channel"
                            message = defaultMessage();
                            findChannel(ServerHostname, nick, e.Message.Parameters[1], function (elChannel, elIRCServer) {
                                if (elIRCServer.IRCServer.Nick != e.Message.Parameters[0]) {
                                    consoleError(elIRCServer.IRCServer.Nick + ' != ' + e.Message.Parameters[0]);
                                    return;
                                }
                                parted(elChannel, elIRCServer);
                            });
                            break;
                        case 465://ERR_YOUREBANNEDCREEP ":You are banned from this server"

                            //irc.gamesurge.net слишком часто присоединял следующего посетителя
                            //:VortexServers.IL.US.GameSurge.net 465 blink1 :AUTO Excessive connections from a single host..
                            //Похоже на бан

                            message = defaultMessage();
                            findServer(ServerHostname, nick, function (elIRCServer) {
                                elIRCServer.IRCServer.banned = true;
                            });
                            break;
                        default:
                            message = defaultMessage();
                    }
                } else consoleError("e.Message.RawMessage: " + e.Message.RawMessage);
            } else if ((typeof e.SocketError != 'undefined') && (e.SocketError == 0)) {//SocketError.Success успешное соединение с сервером
                function setIRCServer(elIRCServer) {
                    //                    if (elIRCServer.IRCServer.chaturbate != undefined) elIRCServer.IRCServer.chaturbate.connected = true;
                    elIRCServer.IRCServer.connected = true;
                    elIRCServer.IRCServer.currentTime = Date.now();
                    var elParentUser = parentUser(elIRCServer);
                    if (elParentUser) {
                        elParentUser.user.connected = true;
                        var elName = elParentUser.parentElement.querySelector('.treeView').querySelector('.name');
                        if (elName.querySelector('#connected') == null) {
                            var elConnected = document.createElement('span');
                            elConnected.title = 'connected';
                            elConnected.id = 'connected';
                            elConnected.innerHTML = '⚡';
                            elName.insertBefore(elConnected, elName.childNodes[0]);
                        } else consoleError('duplicate #connected');
                    }
                    elIRCServer.IRCServer.setStatus(true, elIRCServer);
                    displayConnections(elIRCServer, e.connections);
                }
                if (findServer(ServerHostname, nick, function (elIRCServer) {
                    elIRCServer.IRCServer.connected = true;
                    elIRCServer.IRCServer.currentTime = Date.now();
                    var elParentUser = parentUser(elIRCServer);
                    if (elParentUser) {
                        elParentUser.user.connected = true;
                        var elName = elParentUser.parentElement.querySelector('.treeView').querySelector('.name');
                        if (elName.querySelector('#connected') == null) {
                            var elConnected = document.createElement('span');
                            elConnected.title = 'connected';
                            elConnected.id = 'connected';
                            elConnected.innerHTML = '⚡';
                            elName.insertBefore(elConnected, elName.childNodes[0]);
                        } //else consoleError('duplicate #connected');сюда попадает когда обновляю список контактов
                    }
                    elIRCServer.IRCServer.setStatus(true, elIRCServer);
                    displayConnections(elIRCServer, e.connections);
                }) != '') {
                }
                return;
            } else message = JSON.stringify(e);
            AddError(message, ServerHostname, nick);
            return;
        }
        g_IRC.ConnectSuccess();
    }
    chat.client.onIRCBotMessage = function (date, ServerHostname, nick, message, channelName) {
        consoleLog('onIRCBotMessage ' + ServerHostname + ', ' + channelName + ', ' + nick + ', ' + message);
        AddBotMessage((channelName == null ? '' : '<' + channelName + '> ') + message, ServerHostname, nick, date);
    }
    chat.client.onIRCBotVersion = function (date, ServerHostname, nick, message, channelName) {
        consoleLog('onIRCBotVersion ' + ServerHostname + ', ' + channelName + ', ' + nick + ', ' + message);
        AddBotMessage((channelName == null ? '' : '<' + channelName + '>') + 'Version: ' + message, ServerHostname, nick, date, 'yellow');
    }
    chat.client.onIRCBotError = function (date, ServerHostname, nick, error, errorId, channelName) {
        consoleLog('onIRCBotError ' + ServerHostname + ', ' + nick + ', ' + error);
        AddError(error, ServerHostname, nick, date, errorId, channelName);
        if (errorId != '401')//ERR_NOSUCHNICK "<nickname> :No such nick/channel"
            return;
        var elIRCServer = findServerRoot(ServerHostname);
        if (elIRCServer == null) {
            consoleError('elIRCServer == null');
            return;
        }
        var noSuchNick = error.split(' ')[3];//имя пользователя, который не найден на IRC сервере ":java.webchat.org 401 bonalink kickzamat :No such nick"
        //был случай когда на irc.webmaster.com в списке посетителей канала #videochat появился неизвестный посетитель kickzamat
        //Я попробовал отправить 
        //WHOIS kickzamat
        //что бы узнать кто это
        //но получил ответ
        //":java.webchat.org 401 bonalink kickzamat :No such nick"
        //Значит этого посетителя надо удалить
        //Но когда я обновил веб страницу после редактитрования этого файла, то посетителя kickzamat уже не было в списке посетителей
        //Поэтому не получлось проверить этот код
        //Для поверки я убрал комментарий из строки внизу и отпарвил на IRC сервер команду WHOIS kickzamat. 
//AddUser({ Hostmask: noSuchNick + "!" + noSuchNick + "@95.188.70.kj42=", Mode: "", Nick: noSuchNick }, '', elIRCServer.querySelector('#channelRoot'))
        //теперь этот пользователь снова появился в списке посетителей и можно проверить как он удаляется
        elIRCServer.querySelectorAll('.user').forEach(function (elUser) {
            if (elUser.userName != noSuchNick)
                return;
//            alert(error);
            elUser.parentElement.removeChild(elUser);
        });
    }
    chat.client.onChaturbateStatus = function (ServerHostname, status) {
        var error = status.indexOf('<FONT') == 0,
            message = 'onChaturbateStatus(' + status + ')';
        if(error) consoleError(message);
        else consoleLog(message);
        document.querySelectorAll('.IRCServer').forEach(function (elIRCServer) {
            if (elIRCServer.IRCServer.URL == ServerHostname) {
                var elChaturbateRoot = elIRCServer.querySelector('#chaturbateRoot');
                if (elChaturbateRoot) {
                    if (!myTreeView.isOpenedBranch(elChaturbateRoot)) elChaturbateRoot.querySelector('.treeView').onclick();
                    elIRCServer.querySelector('#chaturbateBranch').querySelector('#status').innerHTML = status;
                    if (error) AddError(status, ServerHostname);
                }
            }
        });
    }
    chat.client.onChannelStatus = function (ServerHostname, nick, channelName, status) {
        consoleLog('onChannelStatus(' + ServerHostname + ', ' + nick + ', ' + channelName + ', ' + status + ')');
        findChannel(ServerHostname, nick, channelName, function (elChannel) {
//            elChannel.querySelector('#chaturbate').querySelector('#status').innerHTML = status;
            elChannel.querySelector('#status').innerHTML = status;
        });
    }
    chat.client.onIRCTopicTooLong = function (ServerHostname, nick, channelName, MaxTopicLength) {
        consoleLog('onIRCTopicTooLong(' + ServerHostname + ', ' + nick + ', ' + channelName + ', MaxTopicLength = ' + MaxTopicLength + ')');
        findChannel(ServerHostname, nick, channelName, function (elChannel) {
            elChannel.IRCChannel.MaxTopicLength = MaxTopicLength;
            elChannel.querySelector('#status').innerHTML = "Channel's topic too long. Max topic length is " + MaxTopicLength;
        });
    }
    function getUsersList(elChannel, elIRCServer) {
        var elUsersList,
            usersList = '#usersList',
            users = '#users';
        elIRCServer.querySelector('#channels').querySelectorAll('#channelRoot').forEach(function (elChannelRoot) {
            if (elChannelRoot.IRCChannel.Name != elChannel.IRCChannel.Name)
                return;
            elUsersList = elChannelRoot.querySelector(usersList);
            if (elUsersList == null) {//Это не владелец канала или у владельца канала не открыта ветка канала или он ее снова закрыл
                var elUsers = elChannelRoot.querySelector(users);
                if (elUsers == null){//у владельца канала ни разу не была открыта ветка канала
                    var elTreeView = elChannelRoot.querySelector('.treeView');
                    if (elTreeView.branchElement == undefined) {
                        elTreeView.onclick();//открывать ветку канала только когда она ни разу не была открыта и ветка не существует
                        elUsersList = elChannelRoot.querySelector(usersList);
                    } else elUsersList = elTreeView.branchElement.querySelector(usersList);//ветка канала была создана ранее и закрыта
                }
                if (elUsersList == null) {
                    elUsers = elChannelRoot.querySelector(users);
                    if (elUsers == null) return;//списка посетителей нет. Значит это не владелец канала
                    elUsersList = myTreeView.getTreeBranch(elUsers);
                }
                
            }
        });
        return elUsersList;
    }
    //get array if elements id=#usersList from elChannel
    function getChatUsers(elChannel, elIRCServer) {
        var usersList = '#usersList',
            channelRoot = '#channelRoot',
            treeView = '.treeView',
            elUsersList = elChannel.querySelector(usersList);
        if (elUsersList == null) {
//            var elUsers = elIRCServer.querySelector('#users');
            var elUsers = elChannel.querySelector('#users');
            if (elUsers != null) return myTreeView.getTreeBranch(elUsers);//список пользователей elUsers не существует у посетителей с сайта https://chaturbate.com/
            else {//elChannel указывает на канал внутри посетителя с сайта https://chaturbate.com/
                //Этот канал не имеет элементов чата и списка посетителей канала
                //В этом случае надо найти канал внутри владельца канала, который имеет список посетителей канала
                var channelRootList = elIRCServer.querySelectorAll(channelRoot);
                for (var i = 0; i < channelRootList.length; i++) {
                    var elChannelRoot = channelRootList[i];
                    if (elChannelRoot.IRCChannel.Name != elChannel.IRCChannel.Name) continue;
                    elUsersList = elChannelRoot.querySelector(usersList);
                    if (elUsersList == null) {
                        elUsersList = getUsersList(elChannel, elIRCServer);
                    }
                    if (elUsersList) break;
                }
            }
        }
        if (elUsersList == null) consoleError('elUsersList: ' + elUsersList);
        return elUsersList;
    }
    chat.client.onIRCChannelListRecieved = function (ServerHostname, nick, channel, ChannelModes) {
        consoleLog('onIRCChannelListRecieved(' + ServerHostname + ', ' + channel.channelName + ')');
        findChannel(ServerHostname, nick, channel.channelName, function (elChannel, elIRCServer) {
/*если я очищу список посетителей канала, то неправильно будут отображаться посетители с сайта Chaturbate
Детали смотри в chat.client.onIRCChaturbateJoinedChannel
            var chatusers = getChatUsers(elChannel, elIRCServer);
            if (chatusers != null) chatusers.innerHTML = '';
*/
            //удалить тех посетителей канала, которых нет в новом списке
            var elUsersList = getChatUsers(elChannel, elIRCServer);
//            for (var i = 0; i < elUsersList.childNodes.length; i++)
            elUsersList.querySelectorAll('.user').forEach(function (elUser) {
                var userName = elUser.userName,
                    detected = false;
                for (var j = 0; j < channel.Users.length; j++) {
                    IRCuser = channel.Users[j];
                    if (userName == IRCuser.Nick) {
                        detected = true;//этот посетитель есть в новом списке
                        break;
                    }
                }
                if (detected)
                    return;
consoleError('not tested');
                elUser.parentElement.removeChild(elUser);
            });

            channel.Users.sort(function (a, b) { return g_IRC.sort(a, b, ChannelModes); });
            channel.Users.forEach(function (IRCuser) {
                if (!AddUser(IRCuser, ChannelModes[IRCuser.Nick], elChannel)) {
                    //сейчас сюда попадает потому что я не очищаю список посетителей а только удаляю оттуда тех, кого нет в новом списке
                    //consoleError('Duplicate user ' + IRCuser.Nick + ' in ' + channel.channelName);
                }
            });
//            displayUsersCount();
        });
    }
    chat.client.onIRCChaturbateJoinedChannel = function (ServerHostname, nick, channelName, chaturbate) {
        consoleLog('onIRCChaturbateJoinedChannel(' + ServerHostname + ', ' + nick + ', ' + channelName + ')');

        //добавить пользователю свойство chaturbate
        findIRCChannel(ServerHostname, channelName, function (elChannel, elIRCServer) {
            var elUser = findElUser(elChannel, elIRCServer, nick);
            if (elUser == null) {
                //сюда попадает когда нажимаю кнопку btnChaturbateConnect которая присоединяет к IRC серверу всех посетителей с сайта Chaturbate
                //а затем обновляю веб страницу еще до того как все пользователи присоединились к веб серверу.
                //Думаю это потому что после обновления веб страницы некорректро отображаются посетители в списке usersList посетителей канала.
                //
                //Если поставить галочку updateChaturbate и присоеденить к IRC серверу владелца каналов, тем самым запуститив процесс переодического подсоединения к IRC серверу всех посетителей с последующим обновлением списка посетителей,
                //то этой пролблемы не будет, потому что во время присоединения к каналу владелца канала он получаесписок посетителей канала
                //и этот список восстанавливается после обновления веб страницы
                consoleError('elUser: ' + elUser + ' ' + ServerHostname + ', ' + nick + ', ' + channelName);
                return;
            }
            g_chaturbate.appendChaturbate(elUser, chaturbate, '../SignalRChat/');
        });
    }
    chat.client.onRenameChannel = function (ServerHostname, nick, channelName, newChannelName) {
        findChannel(ServerHostname, nick, channelName, function (elChannel, elIRCServer) {
            elChannel.querySelector('.treeView').querySelector('.name').innerHTML = newChannelName;
            elChannel.IRCChannel.Name = newChannelName.replace('#', '');
            elChannel.querySelector('#reply').innerHTML = 'Renamed ' + channelName + ' to ' + newChannelName;
        });
    }
    chat.client.onIRCUserJoinedChannel = function (ServerHostname, nick, channelName, JSONIRCuser, prefix) {
        var IRCuser = JSONIRCuser,//JSON.parse(JSONIRCuser);
            userNick = IRCuser.Nick,
            anoterUser = findServer(ServerHostname, nick) == '' ? false : true;//true - На канал вошел посторонний посетитель
        consoleLog('onIRCUserJoinedChannel(' + ServerHostname + ', ' + channelName + ', ' + userNick + ', ' + prefix + ')');

        //Add new user into IRC channel
        var isUserAdded = false;
        findIRCChannel(ServerHostname, channelName, function (elChannel, elIRCServer) {
            //этот callback вызывается для всех каналов, расположенных внутри пользователей
            if ((getParentIRCServer(elChannel).Nick == userNick) || anoterUser) {
                if (AddUser(IRCuser, prefix, elChannel)) {
                    isUserAdded = true;
                    AddMessageToChat(ServerHostname, channelName, nick, 'has joined to channel');
                }
            }
        });
        if (!isUserAdded) {
            //сюда иногда попадает после обновления веб страницы когда на канал добавляется новый пользователь
            consoleError('chat.client.onIRCUserJoinedChannel(' + ServerHostname + ', nick: ' + nick + ', channelName: ' + channelName +
                ') failed! New user is not added. Duplicate user was detected or list of users of IRC channel was not found or add channel first.');
            findIRCServer(ServerHostname, function (elIRCServer) {
                if (elIRCServer.querySelector("#chaturbateList").IRCParams.emptyList)
                    consoleError('chaturbateList is empty');
            });
        }

        //удалить посетителя с сайта https://chaturbate.com/ если он прекратил вещание
        findChaturbateList(ServerHostname, function (elChaturbateList) {
            if (elChaturbateList.IRCParams.copyUsers == true) return;
            var res = findServer(ServerHostname, nick, function (elIRCServer) { });
            if ((res != '')
                && (res != 'copyUsers')//Users list is not ready
                ) {//Этого пользователя нет в списке
                //скорее всего этот пользователь был в списке раньше, 
                // но потом исчез после обновления веб страницы.
                // Ичсез из списка скорее всего потому что он прекратил видеотрансляцию.
                //Надо этого пользователя отключить от IRC сервера и удалить с моего сервера
                chat.server.ircDisconnectUser(ServerHostname, nick);
//                chat.server.ircDisconnectUser({ URL: ServerHostname, Nick: nick });
                consoleLog('ircDisconnectUser(' + ServerHostname + ', ' + channelName + ', ' + userNick + ', ' + res + ')');
            }
        });

        if (anoterUser) return;//На канал вошел посторонний посетитель

        //изменить на 'Joined' статус посетителя, который вошел на канал
        findChannel(ServerHostname, nick, channelName, function (elChannel, elIRCServer) {
            if (elIRCServer.IRCServer.Nick == userNick) {
/*
                var status = '#status',
                    elStatus = elChannel.querySelector(status);
                if (elStatus == null) {//не могу вспомнить когда сюда попадает
                    elChannel.querySelector('.treeView').onclick();
                    elStatus = elChannel.querySelector(status);
                }
                elStatus.innerHTML = 'Joined';
*/
                elChannel.IRCChannel.setStatus(true, elChannel);
                if (elIRCServer.IRCServer.chaturbate == undefined)
                    chat.server.ircGetTopic(ServerHostname, userNick, channelName);
            } else {
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
                AddUser(IRCuser, prefix, elChannel, insertUser(elChannel.querySelectorAll('.user')));
            }
        });
    }
    //http://metanit.com/sharp/mvc5/16.2.php
    //Add new user into IRC channel
    //returns false if new user is not added. Duplicate user was detected or list of users of IRC channel was not found
    function AddUser(IRCuser, prefix, elChannel, elementBefore) {
        var elIRCServer = getParentIRCServerElement(elChannel),
            usersList = '#usersList',
            treeView = '.treeView',
            channelRoot = '#channelRoot',
            elUsersList = elIRCServer.querySelector(usersList);
        if (elIRCServer == null) {
            //testing:
            //press "Connect All chaturbate users to IRC" button.
            //update web page. Now you can see some connected to IRC server user.
            //Disconnect from IRC server one or more users if you see "Too many user connections" message after pressing of the Connect All to IRC button.
            //press Connect All to IRC button again.
            //            consoleError('elUsersList: ' + elUsersList);
            elIRCServer.querySelector(channelRoot).querySelector(treeView).onclick();
            elUsersList = elIRCServer.querySelector(usersList);
        }
        if (elUsersList == null) {//список посетителей не открыт
//            elUsersList = elIRCServer.querySelector(usersList);
            elUsersList = getUsersList(elChannel, elIRCServer);
            if (elUsersList == null) {
                //добавляется посетитель с сайта https://chaturbate.com/ У него нет списка посетителей. Поэтому его надо добавиь в спсок посетителей владельца канала
                elIRCServer = getParentIRCServerElement(elIRCServer.parentElement);//IRCServer владельца канала
                elUsersList = getUsersList(elChannel, elIRCServer);
            }
        }
/*
        if (elUsersList == null) {//у владельца канала не открыта ветка канала
            elIRCServer.querySelector('#channels').querySelectorAll(channelRoot).forEach(function (elChannelRoot) {
                if (elChannelRoot.IRCChannel.Name != elChannel.IRCChannel.Name)
                    return;
                elChannelRoot.querySelector(treeView).onclick();
                elUsersList = elIRCServer.querySelector(usersList);
            });
        }
*/
        if (elUsersList == null) {
            consoleError('elUsersList: ' + elUsersList);
            return false;
        }

        //find duplicate user
        for (var i = 0; i < elUsersList.childNodes.length; i++) {
            if (elUsersList.childNodes[i].userName == IRCuser.Nick) {
                //сюда попадает если к каналу присоединяется больше одного пользователя потому что для каждого старого посетителя канала вызывается свой onIRCUserJoinedChannel
                //consoleError('Duplicate user ' + IRCuser.Nick);
                return false;
            }
        }

        IRCuser.isChannelOperator = g_IRC.isChannelOperator;
        IRCuser.isVoice = g_IRC.isVoice;
        var userItem;
        userItem = { nickname: IRCuser.Nick, ServerHostname: elIRCServer.IRCServer.URL };
        userItem.IRCuser = IRCuser;
        if ((typeof prefix == 'undefined') || (prefix == null))
            prefix = '';
        userItem.prefix = prefix;
        var user = document.createElement("div");
        user.className = 'user';
        user.userName = userItem.nickname;
        g_user.nickname = elIRCServer.IRCServer.Nick;
        var elementUser = g_IRC.createUser(userItem);//, resize, null, parentElement);
        if (IRCuser.chaturbateUser) g_chaturbate.appendChaturbate(elementUser, IRCuser.chaturbateUser, '../SignalRChat/');
        delete IRCuser.chaturbateUser;
        user.appendChild(elementUser);
        if (elementBefore) elUsersList.insertBefore(user, elementBefore);
        else elUsersList.appendChild(user);
/*See IRCClient.UserJoinedChannel
        if (elIRCServer.IRCServer.chaturbate == undefined) {
            //VERSION
            var charCode = String.fromCharCode(1);
            project.sendMessage(userItem, charCode + 'VERSION' + charCode, elIRCServer);
        }
*/
        return true;
    }
    function findElUser(elChannel, elIRCServer, nick) {
        var arrayUsers = getChatUsers(elChannel, elIRCServer).querySelectorAll('.user');;
        for (var i = 0; i < arrayUsers.length; i++) {
            var elUser = arrayUsers[i];
            if (getUserElUser(elUser).nickname == nick)
                return elUser;
        }
        return null;
    }
    function parted(elChannel, elIRCServer) {
        elChannel.IRCChannel.setStatus(false, elChannel);
        elChannel.IRCChannel.isSetTopic = 0;
    }
    function IRCUserPartedChannel(ServerHostname, channelName, nick) {
        //consoleLog('IRCUserPartedChannel(' + ServerHostname + ', ' + channelName + ', ' + nick + ')');
        findIRCChannel(ServerHostname, channelName, function (elChannel, elIRCServer) {
            if (getParentIRCServer(elChannel).Nick == nick) {
                parted(elChannel, elIRCServer);
            }
            //текушего посетителя надо удалять из списка
            g_IRC.getElUser = function (userNick) {
                    
                return findElUser(elChannel, elIRCServer, nick);
            }
            g_IRC.userPartChannel = function (userNick) {
                var elUser = this.getElUser(userNick);
                if (elUser) {
                    elUser.parentElement.removeChild(elUser);
                    consoleLog('IRCUserPartedChannel(' + ServerHostname + ', ' + channelName + ', ' + nick + ')');
                    AddMessageToChat(ServerHostname, channelName, userNick, 'has parted from channel');
                }
                return elUser;
            }
            g_IRC.userPartChannel(nick);
        });
    }
    chat.client.onIRCUserQuit = function (ServerHostname, message) {
        consoleLog('onIRCUserQuit(' + ServerHostname + ', ' + message.User.Nick + ')');

        //эта функция не вызывается на сервере irc.freenode.net
        //Вместо нее вызывается chat.client.onIRCDisconnected

        //Это нужно когда я обновляю список посетителе с сайта https://chaturbate.com/
        //При удалении посетителей, которые прекратили вещание, от IRC сервера приходит команда QUIT :QUIT: User exited
        // но команды part не приходит
        // Проверку проходил на irc.webmaster.com сервере 
        removeUserFromAllChannels(ServerHostname, message.User.Nick);
    }
    chat.client.onIRCUserPartedChannel = function (ServerHostname, channelName, userNick) {
        IRCUserPartedChannel(ServerHostname, channelName, userNick);
    }
    chat.client.onNickChanged = function (ServerHostname, nick, newNick) {
        consoleLog('onNickChanged(' + ServerHostname + ', nick: ' + nick + ', newNick: ' + newNick);
        var res = findServer(ServerHostname, nick, function (elIRCServer) {
            elIRCServer.querySelector('#nick').value = newNick;
            elIRCServer.IRCServer.Nick = newNick;
        });
    }
    chat.client.onIRCChannelTopicReceived = function (ServerHostname, nick, channelName, topic) {
        consoleLog('onIRCChannelTopicReceived(' + ServerHostname + ', nick: ' + nick + ', channel: ' + channelName + ', ' + topic + ')');
        findChannel(ServerHostname, nick, channelName, function (elChannel, elIRCServer) {
            var elTopic = elChannel.querySelector('#topic');

            if (elTopic != null) elTopic.innerHTML = topic;//elTopic == null if:
            //check updateChaturbate - автоматически обновлять список посетителей с сайта https://chaturbate.com/
            //open irc.webmaster.com branch
            //press btnConnect button of the owner of the channel
            //onIRCChannelTopicReceived вызывается дважды когда первый посетитель с сайта https://chaturbate.com/ присоеденится к каналу
            //Для остальных посетителей проблем нет

            if ((elIRCServer.IRCServer.chaturbate == undefined) && (topic != elChannel.IRCChannel.Topic)) {
//                if (elChannel.IRCChannel.isSetTopic > 1)
                if ((elChannel.IRCChannel.MaxTopicLength != undefined) && (elChannel.IRCChannel.MaxTopicLength <= topic.length))
                {
                    var message = 'onIRCChannelTopicReceived(' + ServerHostname + ', nick: ' + nick + ', channelName: ' + channelName
                        + ') Channel\'s topic too long. Max topic length is ' + elChannel.IRCChannel.MaxTopicLength;
                    consoleError(message);
                    AddError(message, ServerHostname, nick);
                    return;
                }
//                $.connection.chatHub.server.ircSetTopic(ServerHostname, nick, channelName, elChannel.IRCChannel.Topic);
            }
        });
    }
    chat.client.onIRCChannelMode = function (ServerHostname, nick, message) {
        var channelName = message.Target;
        consoleLog('onIRCChannelMode(' + ServerHostname + ' ' + nick + ', ' + channelName + ')');
        findChannel(ServerHostname, nick, channelName, function (elChannel) {
            AddMessageToChat(ServerHostname
                , channelName, message.User.Nick, lang.hasSetChannelMode + message.Add + message.Mode + ' ' + message.Parameter);
        });
    }
    chat.client.onIRCChannelOperator = function (message) { g_IRC.onChannelOperator(message); }
    chat.client.onIRCVoice = function (message) { g_IRC.onVoice(message); }
    chat.client.onMaxNickLength = function (ServerHostname, nick, maxNickLength, newNick) {
        consoleLog(ServerHostname + ' ' + nick + '. MaxNickLength = ' + maxNickLength);
        var message = 'Max nick "' + nick + '" length is limited to ' + maxNickLength + ' "' + newNick + '"';
//        AddError(message, ServerHostname, nick);
        findServer(ServerHostname, nick, function (elIRCServer) {
            elIRCServer.IRCServer.MaxNickLength = maxNickLength;
            elIRCServer.IRCServer.Nick = newNick;
            elIRCServer.querySelector('#nick').value = newNick;
            elIRCServer.querySelector('#nickStatus').innerHTML = message;
        });
    }
    chat.client.onServerStatus = function (ServerHostname, message) {
        consoleLog(ServerHostname + '. ServerStatus: ' + message);
        findIRCServer(ServerHostname, function (elIRCServer) {
            elIRCServer.querySelector('#serverStatus').innerHTML = message;
        });
    }
    chat.client.onIRCWhoIsReceived = function (ServerHostname, serverNick, JSONWhoIsResponse, nick) {
        var WhoIsResponse = JSONWhoIsResponse;
        consoleLog('onIRCWhoIsReceived(' + ServerHostname + ' serverNick: ' + serverNick + ', nick: ' + nick
            + ', WhoIsResponse.User.Nick ' + WhoIsResponse.User.Nick + ')');
        var elIRCServer = findServerRoot(ServerHostname);
        if (elIRCServer == null) {
            consoleError('elIRCServer == null');
            return;
        }
/*
        if (WhoIsResponse.User.Nick == elIRCServer.IRCServer.Nick) {
            //Этот статус я вывожу что бы узнать что процедура соединения с IRC сервером полностью завершилась
            // и все команды сервера будут выполняться немедленно
            //Это позволяет не открывать окно Replies что бы узнать что процедура соединения с IRC сервером завершилась
            elIRCServer.querySelector('#status').innerHTML = 'My whoIs received';
        }
*/
        elIRCServer.querySelectorAll('.IRCWhois').forEach(function (elWhoisDlg) {
            if (typeof nick == 'undefined')
                nick = WhoIsResponse.User.Nick;
            if (nick != elWhoisDlg.nickname)
                return;
            g_IRC.whoIsDlg(WhoIsResponse, elWhoisDlg);
        });

/*        findServer тут не работает потому что элемент класса IRCServer находится в двух местах:
        Это может быть дочерний элемент от элемнта списка IRC серверов #IRCServersList
        или это может быть дочерний от элемента посетителя с сайта Chaturbate elChaturbate
        Если я хочу отобразить WhoIs для посетителя, который находится в списке посетиелей комнаты,
        то я не найду этого посетителя, потому что findServer укажет на элемент класса IRCServer который находится в списке посетителей сайта Chaturbate
        elIRCServer дочерний от элемента посетителя 
*/
        findServer(ServerHostname, serverNick, function (elIRCServer) {
            //consoleLog('onIRCWhoIsReceived2(' + ServerHostname + ' serverNick: ' + serverNick
            //    + ', WhoIsResponse.User.Nick ' + WhoIsResponse.User.Nick + ')'
            //    + ', elIRCServer.IRCServer.Nick ' + elIRCServer.IRCServer.Nick + ')');
            if (WhoIsResponse.User.Nick == elIRCServer.IRCServer.Nick) {
                //Этот статус я вывожу что бы узнать что процедура соединения с IRC сервером полностью завершилась
                // и все команды сервера будут выполняться немедленно
                //Это позволяет не открывать окно Replies что бы узнать что процедура соединения с IRC сервером завершилась
                elIRCServer.querySelector('#status').innerHTML = 'My whoIs received';
            }
        });
    }
    chat.client.onIRCChannelMessageRecieved = function (ServerHostname, channelName, nick, message) {
        AddMessageToChat(ServerHostname, channelName, nick, message);
    }
    chat.client.onIRCUserMessageRecieved = function (ServerHostname, receiver, sender, message) {
        consoleLog('chat.client.onIRCUserMessageRecieved(...)');
        project.ServerHostname = ServerHostname;
        if (!g_IRC.getCTCP(message, sender)) {
        }
        delete project.ServerHostname;
    }
    chat.client.onIRCReply = function (ServerHostname, nick, message) {
        findServer(ServerHostname, nick, function (elIRCServer) {
            project.elIRCServer = elIRCServer
            g_IRC.Reply(stringToSpecialEntities(message));
            delete project.elIRCServer;
        });
    }
    chat.client.onIRCReplyCTCP = function (ServerHostname, command, message, nick) {
        document.querySelector('#IRCServersList').querySelectorAll('.IRCServer').forEach(function (elIRCServer) {
            project.elIRCServer = elIRCServer
            g_IRC.ReplyCTCP(stringToSpecialEntities(command), stringToSpecialEntities(message),
                stringToSpecialEntities(nick));
            delete project.elIRCServer;
        });
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
    });
    $.connection.hub.reconnected(function () {
        consoleLog('SignalR reconnected: Raised when the underlying transport has reconnected.');
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
                    message = "Сonnecting...";
                    break;
                case 1://connected
                    message = "";
                    break;
                case 2://reconnecting
                    message = '<img src="../img/Wait.gif" style="width:20px; height:20px;" alt="wait" />  Reconnecting...';
                    break;
                case 4://disconnected
                    message = "Disconnected... <input type='button' value='Connect again' onclick='javascript: return location.reload()' />";
                    break;
                default:
                    ErrorMessage("Unknown SignalR state: " + state);
                    return;
            }
            MessageElement(message);
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
    // Start the connection.
    $.connection.hub.start().done(function () {
        var path = '../SignalRChat/Scripts/';
        loadScript(path + "IRC.js", function () {
            loadScript(path + "IRCChannel.js", function () {
                //если я буду загружать файл с языком внутри chat.client.onChaturbateUser(...), то почемуто функция,
                //которая должна вызываться после загрузки, вызывается еще до полной загрузки 
                loadScript('../SignalRChat/lang/IRC/' + getLanguageCode() + '.js', function () {
                    loadScript(path + 'IRC/Chaturbate/lang/' + getLanguageCode() + '.js', function () {
                        if (g_IRC.isReply != undefined)
                            consoleError('g_IRC.isReply = ' + g_IRC.isReply);
                        g_IRC.isReply = function (command) { return true; }

                        if (g_IRC.getIRCuser != undefined)
                            consoleError('g_IRC.getIRCuser = ' + g_IRC.getIRCuser);
                        g_IRC.getIRCuser = function (user) {
                            if (user.IRCuser != undefined)
                                return user.IRCuser;
                            consoleError('Cannot find IRCuser for ' + user.nickname);
                            return null;
                        }

                        var elIRCServers = document.getElementById("IRCServers");
                        elIRCServers.innerHTML = '';
                        elIRCServers.appendChild(myTreeView.createBranch({
                            name: "IRCServers",
                            params:
                            {
                                createBranch: function () {
                                    $.connection.chatHub.server.ircServers();
                                    var el = document.createElement("div");
                                    el.id = 'IRCServersList';
                                    el.innerHTML = getWaitIconBase() + ' IRS servers list...';
                                    return el;
                                }
                            }
                        }));
                        $.connection.chatHub.server.ircBotMessages();
                    });
                });
            });
        });
    });

    //replace AddMessageToChat in Default.js
    function AddMessageToChat(ServerHostname, channelName, nick, message) {
        consoleLog('Chat message: <' + nick + '> ' + message);
        var chat = '#chat',
            elMessage = document.createElement('div'),
            isDetected = false;
        message = '&lt;' + nick + '&gt; ' + message;
        findIRCChannel(ServerHostname, channelName, function (elChannel) {
            elMessage.innerHTML = '[' + new Date().toLocaleString("ru") + '] ' + message;
            var elChat = elChannel.querySelector(chat);
            if (elChat == null) {
                // это возвращает null если открыть и закрыть ветку chat 
                branchElement = elChannel.querySelector('.treeView').branchElement;
                if (branchElement != undefined) elChat = branchElement.querySelector(chat);//Это владелец канала. У остальных branchElement = undefined
                if (elChat == null) {
                    var elChatBranch = elChannel.querySelector('#chatBranch');
                    if (elChatBranch != null) elChat = myTreeView.getTreeBranch(elChatBranch, chat);
                    else return null;//чат есть только у владельца канала
                }
            }
            var elClone = elMessage.cloneNode(true);
            elChat.appendChild(elClone);
            isDetected = true;
        });
        if (!isDetected) consoleError('Channel ' + channelName + ' is not detected on ' + ServerHostname);
        return elMessage
    }
    function AddMessage(message, ServerHostname, nick, replies, date, backgroundColor) {
        consoleLog('AddMessage(' + ServerHostname + ', ' + (nick == undefined ? '' : nick) + ' message: ' + message + ')');
        var elMessage = document.createElement('div');
        if (backgroundColor != undefined)
            elMessage.style.backgroundColor = backgroundColor;
        if (replies == undefined) replies = '#replies';//'.messages';
        elMessage.innerHTML = '[' + (date == undefined ? new Date().toLocaleString("ru") : date) + '] ' + message;
        if (nick == undefined)
            return elMessage;
        var res = findServer(ServerHostname, nick, function (elIRCServer) {
            var elReplies = elIRCServer.querySelector(replies);
            if (elReplies == null) {
                // это возвращает null если открыть и закрыть ветку replies 
                elReplies = myTreeView.getTreeBranch(elIRCServer.querySelector('#repliesBranch'), replies);
            }
            var elClone = elMessage.cloneNode(true);
            elReplies.appendChild(elClone);
//            elClone.scrollIntoView();
        });
        if ((res != '')
            && (res != 'copyUsers')//Users list is not ready
            ) {
            //Пытаюсь передать сообщение message пользователю nick которого нет в списке пользователей IRC сервера с адресом ServerHostname
            // значит это посторонний пользователь
//            consoleError(res);
        }
        return elMessage;
    } 
    function getElMessagesList() {
        var elMessagesList = document.getElementById('messagesList');
        if (elMessagesList == null) {
            // это возвращает null если открыть и закрыть ветку messages 
            elMessagesList = myTreeView.getTreeBranch(document.getElementById('messages'), '#messagesList');
        }
        if ((elMessagesList.childNodes.length == 1) && (elMessagesList.childNodes[0].nodeName == "#text"))
            elMessagesList.innerHTML = '';
        return elMessagesList;
    }
    function BotMessage(message, ServerHostname, nick) {
        if (ServerHostname == '')
            consoleError('BotMessage(...) failed! ServerHostname is empty.');
        return '&lt;' + ServerHostname + '&gt;' + ' ' + (nick == undefined ? '' : nick) + '. ' + message.replace('<', '&lt;').replace('>', '&gt;');
    }
    function AddError(message, ServerHostname, nick, date, errorId, channelName) {
        message = getErrorTag(BotMessage(message, ServerHostname, nick));
        getElMessagesList().appendChild(AddMessage(message, ServerHostname, nick, undefined, date));
        if (nick != undefined) findServer(ServerHostname, nick, function (elIRCServer) {
            elIRCServer.querySelector('#status').innerHTML = message;
            if (channelName == undefined)
                return;//Not channel related error
            findChannelInServer(elIRCServer, channelName, function (elChannel, elIRCServer) {
                switch (errorId) {
                    case "473"://ERR_INVITEONLYCHAN "<channel> :Cannot join channel (+i)
                        elChannel.querySelector('#status').innerHTML = message;
                        break;
                    default: consoleError('AddError(...) failed! errorId = ' + errorId);
                }
            });
        });
    }
    function AddBotMessage(message, ServerHostname, nick, date, backgroundColor) {
        getElMessagesList().appendChild(AddMessage(BotMessage(message, ServerHostname, nick), ServerHostname, nick, undefined, date, backgroundColor));
    }
    function ChannelName(channelName) { return (channelName[0] == '#' ? '' : '#') + channelName; }
    //find IRCServer in IRCServersList element
    //Если елемент найден, то вызвать функцию callBack
    function findIRCServer(ServerHostname, callBack) {
        var elIRCServersList = document.getElementById('IRCServersList');
        if (elIRCServersList == null) {
            //сюда попадает если закрыть ветку со списком IRC серверов IRCServers
            //во время присоединения к IRC северу всех посетителей с сайта https://chaturbate.com/
            //т.е. нажата кнопка btnChaturbateConnect
            var elIRCServers = document.getElementById('IRCServers'),
                elTreeView = myTreeView.getElTreeView(elIRCServers);
            if (elTreeView == null)
                return;//список IRC серверов еще не готов. Это может произойти если запусить IRCBot из BotStarter и еще ни разу не открывалась веб страница IRCBot
            if (!myTreeView.isOpenedBranch(elIRCServers)) elTreeView.onclick();//The Chaturbate branch is not created
            elIRCServersList = myTreeView.getTreeBranch(elIRCServers);
        }
        var elList = elIRCServersList.childNodes;

        //find IRC server
        for (var i = 0; i < elList.length; i++) {
            var elItem = elList[i];
            if (elItem.tagName == "IMG") break;//Servers list is not ready after updating of the web page during connecting to IRC server of all users from Chaturbate site.
            var elIRCServer = elItem.querySelector('.treeView').branchElement;
            if ((elIRCServer == undefined)//branch is never was opened
                || (elIRCServer.IRCServer.URL != ServerHostname))
                continue;
            callBack(elIRCServer);
            break;
        }
    }
    //возвращает дочерний элемент от элемента #IRCServersList у которого IRCServer.URL == ServerHostname
    //Другими словами возвращает сервер из списка серверов IRCServers
    function findServerRoot(ServerHostname) {
        var IRCServersList = '#IRCServersList',
            treeView = '.treeView',
            elIRCServer = null;
        elIRCServersList = document.querySelector(IRCServersList);
        if (elIRCServersList == null) //IRCServers branch is closed
            elIRCServersList = document.querySelector('#IRCServers').querySelector(treeView).branchElement;
        if (elIRCServersList == null) return null;
        //        elIRCServersList.childNodes.forEach(function (elIRCServerRoot)
        for (var i = 0; i < elIRCServersList.childNodes.length; i++) {
            elIRCServerRoot = elIRCServersList.childNodes[i];
            if (elIRCServerRoot.nodeName == "#text") return;//web page was updated but IRCServersList is not ready
            var elIRCServerRootTreeView;
            try {
                elIRCServerRootTreeView = elIRCServerRoot.querySelector(treeView);
            } catch (e) {
                consoleError(e);
                continue;
            }
            if (elIRCServerRootTreeView == null) continue;//web page was updated
            var elIRCServerCur = elIRCServerRootTreeView.branchElement;
            if (elIRCServerCur == undefined) {//web page was updated but IRCServer branch is not opened
                continue;
            }
            if (elIRCServerCur.IRCServer.URL == ServerHostname) {
                elIRCServer = elIRCServerCur;
                break;
            }
        }
        return elIRCServer;
    }
    function findIRCChannelFromServer(channelRootList, channelName, callBack, elIRCServer) {
        //find channel
        for (var i = 0; i < channelRootList.length; i++) {
            var elChannelRoot = channelRootList[i];
            if (elChannelRoot.IRCChannel.Name != channelName) continue;
            callBack(elChannelRoot, elIRCServer);
        }
    }
    //найти канал на IRC сервере
    //Если канал найден, то вызвать функцию callBack
    function findIRCChannel(ServerHostname, channelName, callBack) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            channelName = channelName.replace('#', '');
            var channelRoot = '#channelRoot';

            //вызвать callBack для всех каналов, которые находятся в открытых ветках, включая и каналы владелца
            findIRCChannelFromServer(elIRCServer.querySelectorAll(channelRoot), channelName, callBack, elIRCServer);

            var elChannelRoot = elIRCServer.querySelector('#channels').querySelector(channelRoot);
            if (elChannelRoot) {
                if (!myTreeView.isOpenedBranch(elChannelRoot)) {
                    //Если ветка канала владельца закрыта
                    var elTreeView = elChannelRoot.querySelector('.treeView');
                    if (elTreeView.branchElement != undefined)
                        //ветка канала владельца никогда не открывалась (elTreeView.branchElement == undefined) или закрыта
                        findIRCChannelFromServer(elTreeView.branchElement.querySelectorAll(channelRoot),
                            channelName, callBack, elIRCServer);
                }
            } else
                //сюда иногда попадает после обновления веб страницы когда на канал добавляется новый пользователь
                consoleError('findIRCChannel(' + ServerHostname + ', ' + channelName + ') failed! Add channel first.');

            var elChaturbateRoot = elIRCServer.querySelector('#chaturbateRoot');
            if (!myTreeView.isOpenedBranch(elChaturbateRoot)) {
                //если ветка Chaturbate
                var elTreeView = elChaturbateRoot.querySelector('.treeView');
                if (elTreeView.branchElement != undefined)
                    //ветка Chaturbate никогда не открывалась (elTreeView.branchElement == undefined) или закрыта
                    // поэтому посетиели с сайта Chaturbate не попадают в список, который передается в передыдущем вызове findIRCChannelFromServer
                    findIRCChannelFromServer(elTreeView.branchElement.querySelectorAll(channelRoot),
                        channelName, callBack, elIRCServer);
            }
        });
    }
    //найти список посетителей с сайта https://chaturbate.com/
    //Если список найден, то вызвать функцию callBack
    function findChaturbateList(ServerHostname, callBack) {
        findIRCServer(ServerHostname, function (elIRCServer) {
            var chaturbateList = '#chaturbateList',
                elChaturbateList = elIRCServer.querySelector(chaturbateList);
            if (elChaturbateList == null) {
                var elTreeView = elIRCServer.querySelector("#chaturbateRoot").querySelector('.treeView'),
                    branchElement = elTreeView.branchElement;
                if (branchElement == undefined) {
                    elTreeView.onclick();//открывать ветку Chaturbate только когда она ни разу не была открыта и ветка не существует
                    elChaturbateList = elIRCServer.querySelector(chaturbateList);
                } else elChaturbateList = branchElement.querySelector(chaturbateList);
            }
            callBack(elChaturbateList);
        });
    }
    // найти елемент класса IRCServer
    //у которого есть объект типа IRCServer
    //и в этом объекте (elIRCServer.IRCServer.URL == ServerHostname) && (elIRCServer.IRCServer.Nick == nick)
    //Если елемент найдент, то вызвать функцию callBack
    //
    //Другими словами ищем пользователя nick, который находится в списке пользователей IRC сервера с адресом ServerHostname
    //если пользователь найден, вызываем callBack 
    //
    /// <param name="noOpenBranch">
    /// true - не открывать ветку IRCServer когда на веб странице создается список IRC серверов
    ///         т.е. когда кликнули на IRCServersList
    /// </param>
    //возвращает пустую строку если элемент найден или сообщение о том что элемент не найдед
    function findServer(ServerHostname, nick, callBack, noOpenBranch) {
        if (nick == undefined) return 'nick: ' + nick;//сюда попадает из chat.client.onChaturbateStatus когда не могу открыть сайт https://chaturbate.com/
        var detected = false,
            IRCServer = '.IRCServer',
            treeView = '.treeView',
            IRCServersList = '#IRCServersList',
            elIRCServersList = document.querySelector(IRCServersList),
            copyUsers = false;
        if (elIRCServersList == null) {//IRCServers branch is closed
//            elIRCServersList = document.querySelector('#IRCServers').querySelector(treeView).branchElement;
            var elIRCServersTreeView = document.querySelector('#IRCServers').querySelector(treeView);
            elIRCServersList = elIRCServersTreeView.branchElement;
            if (elIRCServersList == null) {//web page was updated
                elIRCServersTreeView.onclick();
                elIRCServersList = document.querySelector(IRCServersList);
                if (elIRCServersList == null) {
                    var message = 'elIRCServersList = ' + elIRCServersList;
                    consoleError(message);
                    return message;
                }
                return 'opening of IRCServersList';
            }
        }
        //этот сложный способ поиска elIRCServer нужен для того, что 
        // когда открыть и снова закрыть ветку IRC сервера, elIRCServer не дочерний от document
        //потому что из за особенностей дерева treeView он перемещается в elIRCServerRoot.querySelector('.treeView').branchElement
        elIRCServersList.childNodes.forEach(function (elIRCServerRoot) {
            if (elIRCServerRoot.nodeName == "#text") return;//web page was updated but IRCServersList is not ready
            var elIRCServerRootTreeView;
            try{
                elIRCServerRootTreeView = elIRCServerRoot.querySelector(treeView);
            } catch (e) {
                consoleError(e);
                return;
            }
            if (elIRCServerRootTreeView == null) return;//web page was updated
            var elIRCServer = elIRCServerRootTreeView.branchElement;
            if (elIRCServer == undefined) {//web page was updated but IRCServer branch is not opened
                if (!noOpenBranch && (elIRCServerRootTreeView.querySelector('.name').innerHTML == ServerHostname)) elIRCServerRootTreeView.onclick();
                return;
            }
            if (elIRCServer.IRCServer.URL != ServerHostname) return;
            if (elIRCServer.IRCServer.Nick != nick) {
                //когда соединение с IRC сервером происходит амвтоматически
                //(например если пользователь нажал кнопку "Connect All to IRC")
                //То ветка пользователя nick может быть не открыта и findServer не найдет пользователя
                //В этом случае надо найти пользователя с неоткрытой веткой и открыть ее
                findChaturbateList(ServerHostname, function (elChaturbateList) {
                    if (elChaturbateList.IRCParams == undefined) elChaturbateList.IRCParams = {};
                    if (elChaturbateList.IRCParams.copyUsers) {//web page was updated. Copying of the users is not completed
                        copyUsers = true;
                        return;
                    }
                    if (elChaturbateList.IRCParams.emptyList && !elChaturbateList.IRCParams.getList) {
                        //сюда попадает после обновлния веб страницы во время автоматического присоединения к IRC серверу всех посетителей с сайта Chaturbate
                        //список посетителей сайта еще не готов. Надо его получить
                        chat.server.chaturbateUsers(ServerHostname, true);
                        elChaturbateList.IRCParams.getList = true;//не хочу что бы сюда попадало несколько раз подряд пока список посетителей Chaturbate
                                                                    //еще не получен, хотя ничеого страшного не призойдет если вызовется несколько раз
                        return;
                    }
                    for (var i = 0; i < elChaturbateList.childNodes.length; i++) {
                        var elChaturbate = elChaturbateList.childNodes[i];
                        if (elChaturbate.tagName == "IMG")
                            break;//The Chaturbate branch is opening after updating of the web page during connecting to IRC server of all users from Chaturbate site and not ready. 
                        if (elChaturbate.user == undefined)
                            consoleError('elChaturbate.user: ' + elChaturbate.user);
                        var elIRCServer2 = elChaturbate.querySelector(IRCServer),
                            curNick = elIRCServer2 == null ?
                                g_chaturbate.href2Nick(elChaturbate.user.href)//ветка ▼IRC еще не была открыта
                                : elIRCServer2.IRCServer.Nick;//user.href и IRCServer.Nick могут не совпадать если изменился ник
                        //Эта строка не работает если изменился ник пользователя
                        //if (g_chaturbate.href2Nick(elChaturbate.user.href) == nick)
                        if (curNick == nick) {
                            //consoleLog('onIRCConnect. ' + nick + ' was detected');
                            var elIRCServer = elChaturbate.querySelector(IRCServer);
                            if (elIRCServer == null) {//ветка прльзователя с сайта chaturbate не открыта
                                if (!myTreeView.isOpenedBranch(elChaturbate)) elChaturbate.querySelector(treeView).onclick();//открыть ветку прльзователя с сайта chaturbate
                                var detailsBranch = '#detailsBranch',
                                    elDetailsBranch = elChaturbate.querySelector(detailsBranch);
                                if (!myTreeView.isOpenedBranch(elDetailsBranch)) elDetailsBranch.querySelector(treeView).onclick();//Открыть ветку деталей
                                var IRC = '#IRC',
                                    elIRC = elDetailsBranch.querySelector(IRC);
                                if (!myTreeView.isOpenedBranch(elIRC)) elIRC.querySelector(treeView).onclick();//Открыть ветку IRC
                                elIRCServer = elChaturbate.querySelector(IRCServer);
                            }
                            if (callBack != undefined) callBack(elIRCServer);
                            detected = true;
                            break;
                        }
                    };
                });
                return;
            }
            if (!detected) {//если не поставитьь эту проверку, то при присоединении к IRC серверу всех пользователей с сайта Chaturbate
                // (другими словами когда была нажата кнопка Connect All to IRC),
                // в окне id="replies" будут появляться две одинаковые строки подряд
                // потому что callBack будет вызываться дважды
                if (callBack != undefined) callBack(elIRCServer);
                detected = true;
            }
        });
        return detected ? '' : (copyUsers ? 'copyUsers' : 'Find ' + ServerHostname + ' nick: ' + nick + ' failed!');
    }
    //Calls the callBack function if channel was detected.
    //Returns true if channel was detected or channels list is not ready
    function findChannelInServer(elIRCServer, channelName, callBack) {
        if (typeof channelName == 'undefined') {
            consoleError('findChannelInServer(...) failed! channelName: ' + channelName);
            return false;
        }
        var channelsChildNodes = elIRCServer.querySelector('#channels').childNodes;
        if (channelsChildNodes.length == 0)
            return true;//channels list is not ready. Веб станица была обновлена но еще не успели добавиться каналы для данного пользователя
        for (i = 0; i < channelsChildNodes.length; i++){
            elChannel = channelsChildNodes[i];
            if ((channelName != null) && (ChannelName(elChannel.IRCChannel.Name) != ChannelName(channelName)))
                continue;
            callBack(elChannel, elIRCServer);
            return true;
        }
        return false;
    }
    function findChannel(ServerHostname, nick, channelName, callBack) {
        var detected = false;
        var res = findServer(ServerHostname, nick, function (elIRCServer) {
            detected = findChannelInServer(elIRCServer, channelName, callBack);
/*
            var channelsChildNodes = elIRCServer.querySelector('#channels').childNodes;
            if (channelsChildNodes.length == 0) detected = true;//Веб станица была обновлена но еще не успели добавиться каналы для данного пользователя
            channelsChildNodes.forEach(function (elChannel) {
                if ((channelName != null) && (ChannelName(elChannel.IRCChannel.Name) != ChannelName(channelName)))
                    return;
                callBack(elChannel, elIRCServer);
                detected = true;
            });
*/
        });
        if (res == 'copyUsers') return;//Users list from https://chaturbate.com/ is not ready
        if (!detected) AddError('Find ' + channelName + ' failed! ' + res, ServerHostname, nick);
    }
    chat.client.onChaturbateCopyUsersEnd = function (ServerHostname) {
        consoleLog('onChaturbateCopyUsersEnd(' + ServerHostname + ')');
        findIRCServer(ServerHostname, function (elIRCServer) {
            var IRCParams = elIRCServer.querySelector('#chaturbateList').IRCParams;
            if (IRCParams.copyUsers != true) consoleError('IRCParams.copyUsers = ' + IRCParams.copyUsers);
            IRCParams.copyUsers = false;
        });
    }
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
                    + '<input type="button" class="close" value="Close" >'
                + '</div>'
            ;
            elMessage.querySelector('.close').onclick = removeMessage;
        });
    }
    function displayMessage(callback) {
        var elMessage = document.createElement('div');
        elMessage.className = "center blok";
        elMessage.style.overflow = "auto";
        callback(elMessage);
        document.body.appendChild(elMessage);
    }
});
function getWaitIconBase(papams) {
    if (typeof papams == 'undefined')
        papams = '';
    return '<img src="../img/Wait.gif" style="width: 20px; height:20px"' + papams + '>';
}
document.getElementById('IRCServers').innerHTML = getWaitIconBase() + ' SignalR starting...';
var g_user = {};
var g_chatRoom = { isPrivate: function () { return false; } };
//returns an element with IRCServer member, that is parent of el element
function getParentIRCServerElement(el) {
    var parentElement = el;
    while (parentElement.IRCServer == undefined) {
        if (parentElement.parentElement == null) {
            //Элемент el находится в ветке, кторая закрыта
            //из за особенностей myTreeView я не могу получить родителя этой ветки
            //Но при закрытии ветки myTreeView запоминает родителя ветки в переменной rootElement
            parentElement = parentElement.rootElement;
            continue;
        }
        if (parentElement == null) {
            consoleError('getParentIRCServerElement failed!');
            return null;
        }
        parentElement = parentElement.parentElement;
/*
        if (parentElement == null)
            //я автоматически присоединяю к IRC серверу посетителей с сайта Chaturbate
            // и закрыл ветку Chaturbate.
            // В этом случае я не могу найти ParentIRCServerElement потому что ветка Chaturbate скрыта 
            // и содержится в branchElement, которая не имеет родитеьского элемента
            parentElement = parentElement.IRCDlg;//эта величина присваивается в function IRCDlg
        else parentElement = parentElement.parentElement;

        if (parentElement == null) consoleError('getParentIRCServerElement failed!');
*/
    }
    return parentElement;
}
function getParentIRCServer(el) { return getParentIRCServerElement(el).IRCServer; }
//Список функций, которые в проектах IRCBot и SignalRChat имеют разные коды
project = {
    whoIs: function (User) {
        consoleLog('whoIs ' + User.ServerHostname + ' ' + User.nickname);
        $.connection.chatHub.server.ircWhoIs(User.ServerHostname, User.nickname);
    },
    sendMessage: function (User, message, a) {
        var IRCServer = getParentIRCServer(a);
        $.connection.chatHub.server.sendMessage(IRCServer.URL, IRCServer.Nick, message, User.nickname);
    },

    //https://en.wikipedia.org/wiki/Client-to-client_protocol#VERSION
    CTCPcommand: function (User, a, command) {
        var IRCServer = getParentIRCServer(a);
        $.connection.chatHub.server.ctcpCommand(IRCServer.URL, User.IRCuser.Nick, command);
    },

    getElementMessages: function () {
        var messages = '#replies',//'.messages';
            elMessages = this.elIRCServer.querySelector(messages);
        if (elMessages == null) {
            // это возвращает null если открыть и закрыть ветку messages 
            elMessages = myTreeView.getTreeBranch(this.elIRCServer.querySelector('#repliesBranch'), messages);
        }
        return elMessages;
    },
    getElIRCServer: function () { return this.elIRCServer; },
    get: function (sender, command) { $.connection.chatHub.server.ircGet(this.ServerHostname, sender, command) },
    CTCPReply: function (ServerHostname, nick, command, reply) {
        //перенес это на сервер IRCClient.NoticeRecieved += (s, e) =>
        //что бы работало с закрытой IRCBot веб страницей
    }
}
function documentTitle() { document.title = 'IRC Bot'; }
function getErrorTag(message) { return '<FONT style="color: red;">' + message + '</FONT>' }
