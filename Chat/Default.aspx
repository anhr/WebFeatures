<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WelcomeToChat.Default" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="author" content="Andrej Hristoliubov anhr@mail.ru">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <link rel="stylesheet" href="../MyIsapi/normal.css" type="text/css">
    <link rel="stylesheet" href="../MyIsapi/gradient.css" type="text/css">

    <script type="text/javascript" src="/js/Common.js"></script>

    <!--<link rel="stylesheet" href="../MyIsapi/InputKeyFilter.css" type="text/css">-->
    <link rel="stylesheet" href="/js/jquery/ui/1.11.4/jquery-ui.css">
    <link rel="stylesheet" href="/js/jquery/ui/1.11.4/style.css">

    <link rel="stylesheet" href="../Tabs/myTabs.css" type="text/css">
    <script type="text/javascript" src="../SignalRChat/Scripts/Chat.js"></script>
    <script type="text/javascript" src="../Tabs/myTabs.js"></script>

    <link rel="stylesheet" href="../MyIsapi/InputKeyFilter.css" type="text/css">
    <script type="text/javascript" src="/js/InputKeyFilter.js"></script>

    <style>
        .col1 {
            width: 50%; /* Ширина ячейки */
        }
        .col2 {
            width: 50%; /* Ширина ячейки */
        }
    </style>
</head>

<body class="gradient">

    <!--script Test-->
    <div id='ScriptProblem' style='background: white; '><FONT style='color: red; background-color: white'>WARNING: Active Scripting in your internet browser is disabled. Refresh your Web page to find out the current status of your Web page or enable Active Scripting.</FONT></div>
    <script type='text/javascript'>scriptTest();</script>

    <form id="form1" runat="server">
    <div class="transparent" id='Message'></div>
    <script type="text/javascript">var emailSubject = "Chat error";</script>
    <div id="openpage" class="center"><img src="../img/Wait.gif" alt="wait" /></div>
    <div id="center" align="center" style="visibility:hidden;">
        <h1 id="pageTitle" align="center"></h1>

        <!--tab http://www.elated.com/articles/javascript-tabs/-->
        <ul id="tabs">
        </ul>
        <script>
            loadScript("lang/" + getLanguageCode() + ".js", function () {
                <% if(IsEditProfile()) { %>
                document.title = lang.myProfile;//"My profile"
                <% } else { %>
                document.title = lang.welcomeToChat;//"Welcome to chat"
                <% } %>
                document.getElementById("pageTitle").innerHTML = document.title;

                loadScript("../SignalRChat/Scripts/json2.js", function () {//for IE5
                    loadScript("../SignalRChat/Scripts/jquery-1.6.4.js", function () {//Reference the jQuery library.
                        loadScript("../SignalRChat/Scripts/jquery.signalR-2.0.0.js", function () {//Reference the SignalR library.
                            loadScript("../SignalRChat/signalr/hubs", function () {
                                loadScript("/JS/jquery/ui/1.11.4/jquery-ui.js", function () {
                                    startHub();
                                });
                            });
                        });
                    });
                });

                disable(false);
            });
            function onConnectAgain() {
                //consoleLog("onConnectAgain()");
                location.reload();
            }
            function createTabs() {
                loadScript("/js/QueryString.js", function () {
                    var q = new QueryString(), tab = q.value('tab');
                    switch (tab) {
                        default: consoleError(tab); tab = undefined; break;
                        case undefined: 
                        case 'SignalR':
                        case 'IRC':
                            break;
                    }
                    myTabs.createTabs("tabs",
                    [
                        //{ tab: function () { return { href: "#bonalinkTab", name: lang.bonalinkChat, selected: true } } },//Bonalink
                        //SignalR Chat
                        {
                            //<li><a href="#bonalinkTab" id="IRCChat"></a></li>
                            tab: function () {
                                return {
                                    href: "#bonalinkTab", name: lang.bonalinkChat, selected: ((tab == undefined) || (tab == 'SignalR')) ? true : false
                                        , tabContent: function (elA) {//Bonalink
                                        //consoleLog('onfocus of ' + elA.innerText);
                                        return myTabs.createTabContent(elA, function () {
                                            var elTabContent = document.createElement('div');
                                            loadScript("/js/myRequest.js", function () {
                                                elTabContent.innerHTML = getSynchronousResponse('SignalRChat.html');
                                                loadScript("Scripts/SignalRChat.js", function () { SignalRChatInit(); });
                                            });
                                            elTabContent.innerHTML = getWaitIconBase();
                                            return elTabContent;
                                        })
                                    }
                                }
                            },
                            tabContent: function (tabContentId) { return null; }
                        },
                        //IRC
                        {
                            //<li><a href="#IRCTab" id="IRCChat"></a></li>
                            tab: function () {
                                return {
                                    href: "#IRCTab", name: lang.IRCChat, selected: (tab == 'IRC') ? true : false
                                        , tabContent: function (elA) {
                                        //consoleLog('onfocus of ' + elA.innerText);
                                        return myTabs.createTabContent(elA, function () {
                                            var elTabContent = document.createElement('div');
                                            loadScript("/js/myRequest.js", function () {
                                                elTabContent.innerHTML = getSynchronousResponse('IRC.html');
                                                loadScript("Scripts/IRC.js", function () { IRCInit(); });
                                            });
                                            elTabContent.innerHTML = getWaitIconBase();
                                            return elTabContent;
                                        })
                                    }
                                }
                            },//IRC
                            tabContent: function (tabContentId) { return null; }
                        }
                    ], tab == undefined ? true : false);
                });
            }
            function getWaitIconBase(papams) {
                if (typeof papams == 'undefined')
                    papams = '';
                return '<img src="../img/Wait.gif" style="width: 20px; height:20px"' + papams + '>';
            }
            function startHub() {
                //consoleLog('startHub');

                //<!--Add script to update the page and send messages.-->
                $(function () {
                    try {
                        // Declare a proxy to reference the hub.
                        var chat = $.connection.chatHub;

                        chat.client.onIRCUnhandledMessage = function (message) {
                            //for testing try connect to irc.gamesurge.net
                            consoleError(message);
                            g_IRC.MessageError3(getErrorTag(message));
                        }
                        chat.client.onIRCGroup = function (JSONIRCGroup) { onIRCGroup(JSONIRCGroup); }
                        chat.client.onIRCConnect = function (message) { g_IRC.onConnect(message); }
                        chat.client.onIRCNickInUse = function (message) { g_IRC.onNickInUse(message); }
                        chat.client.onIRCNickChanged = function (oldNick, newNick, Hostmask) { g_IRC.onNickChanged(oldNick, newNick, Hostmask); }
                        chat.client.onIRCDisconnected = function (message) { g_IRC.onDisconnected(message); }
                        chat.client.onIRCBotResponseReady = function () {
                            consoleLog('chat.client.onIRCBotResponseReady');
                            chat.server.getNextConnectionDelay(document.getElementById('IRCURL').value);
                        }
                        chat.client.onNextConnectionDelay = function (NextConnectionDelay) {
                            consoleLog('chat.client.onNextConnectionDelay(' + NextConnectionDelay + ')');
                            g_IRC.Reply(getWaitIconBase() + lang.tooManyConnections.replace('%s', NextConnectionDelay / 1000));//Too many connections from your host. Waiting about 3 seconds for connecting again
                            setTimeout(function () { g_IRC.Connect(); }, NextConnectionDelay);
                        }
                        chat.client.onIRCIsConnected = function (message) { g_IRC.onIsConnected(); }

                        //Не помню зачем это добавил
//                        chat.client.onIRCPing = function (key) { consoleLog('onIRCPing'); $.connection.chatHub.server.ircPong(key); }

                        chat.client.onIRCReply = function (message) { g_IRC.Reply(message); }

                        chat.client.onGUID = function (guid) { g_IRC.onGUID(guid); }
                        chat.client.onRemoveRoom = function (roomName) { g_onRemoveRoom(roomName); }
                        chat.client.onUpdateRoom = function (room, strRoomNamePrev) { g_onUpdateRoom(room, strRoomNamePrev); }
                        chat.client.onNicknameBusy = function () {
                            var message = lang.nicknameIsBusy//nickname is busy
                            consoleLog('chat.client.onNicknameBusy()');
                            var elementInput = document.getElementById("Nickname");
                            inputKeyFilter.TextAdd(message, elementInput, "downarrowdivred");
                            elementInput.focus();
                            g_submit = false;
                            disable(false);
                        }

                        chat.client.onDuplicateUserNameInRoom = function () {
                            var elementChatRoom = document.getElementById("chatRoom");
                            var message = lang.duplicateUsernameInRoom.replace("%s", elementChatRoom.value);//You are already in the "%s" room
                            consoleLog('chat.client.onDuplicateUserNameInRoom(). Room Name: ' + elementChatRoom.value);
                            inputKeyFilter.TextAdd(message, elementChatRoom, "downarrowdivred");
                            elementChatRoom.focus();
                            g_submit = false;
                            disable(false);
                        }

                        chat.client.onNicknameOK = function (userOK, roomName) {
                            consoleLog('chat.client.onNicknameOK(userOK, "' + roomName + '")');
                            if (!g_submit)
                                return;

                            g_user.browserID = userOK.browserID;
                            //g_user.sss = {aaa: '123', bbb: '456'}
                            var userJSON = JSON.stringify(g_user);
                            var user;
                            if (navigator.cookieEnabled)
                                user = '';
                            else user = "user=" + userJSON + '&';//Посетителя выводим в адресную строку только если не доступны куки. Это нужно для совместимости с анонимайзером http://cameleo.ru/
                            SetCookie("User", userJSON);
                            var length = SetCookie("User", userJSON, '; path=/');//Непонятно почему но если добавить '; path=/', то куки на странице SignalRChat читаются правильно а на странице Chat остаются старое значение. Поэтому добавил еще одну команду SetCookie в предыдущей строке
                            if (length != 0) {
                                g_cookieOwerflow = userJSON.length - length;
                                var elementAboutMe = document.getElementById('aboutMe');
                                expandAdditionally()
                                elementAboutMe.focus();
                                g_aboutMeLength = elementAboutMe.value.length;
                                consoleError('User cookie owerflow: ' + g_cookieOwerflow);
                                //В Safari иногда не записывается. Надо разбираться
                                //alert(lang.cookieOwerflow.replace('%s', g_cookieOwerflow));//Cookie owerflow about %s sumbols. Please decrease the "About Me" field.
                                //return;
                            }
                            window.location = getOrigin() + "/SignalRChat?" + user + 'chatRoom=' + encodeURIComponent(document.getElementById("chatRoom").value);
                        }
                        chat.client.onMaxNickLength = function (maxNickLength) {
                            consoleError('maxNickLength = ' + maxNickLength);
                            var message = lang.maxNickLength + maxNickLength;//'Max nick length is limited to '
//                            g_IRC.MessageError(message);
                            g_IRC.MessageError3(getErrorTag(message));
                            alert(message);
                            inputKeyFilter.TextAdd(message, document.getElementById('IRCNickname'), "downarrowdivred");
                        }
                        chat.client.onUser = function (user) {
                            consoleLog("chat.client.onUser(" + JSON.stringify(user) + ")");
                            if (user && user.browserID) {
                                document.getElementById("Nickname").value = user.nickname;
                                g_user.id = user.id;
                                setFields(user);
                                disable(false);
                                return;
                            }
                            if (typeof g_user.browserID == 'undefined')
                                return;
                            if (!document.getElementById('updateProfile'))
                                return;//сейчас уже мы создаем нового пользователя. Поэтому его пока нет в базе данных и nickname = null. Нет необгодимости переходитьв режим создания нового пользователя
                            g_user.browserID = undefined;
                            alert(lang.profileNotExist);//"Your profile does not exist. Please create a new profile.");
                            gotoChatPage();
                        }
                        chat.client.onMessageElement = function (message) {
                            MessageElement(message);
                        }
                        chat.client.onNickname = function (nickname) {
                            consoleLog("chat.client.onNickname(" + nickname + ")");
                            if (nickname) {
                                document.getElementById("Nickname").value = nickname;
                                disable(false);
                            } else {
                                if (typeof g_user.browserID != 'undefined') {
                                    if (!document.getElementById('updateProfile'))
                                        return;//сейчас уже мы создаем нового пользователя. Поэтому его пока нет в базе данных и nickname = null. Нет необгодимости переходитьв режим создания нового пользователя
                                    g_user.browserID = undefined;
                                    alert(lang.profileNotExist);//"Your profile does not exist. Please create a new profile.");
                                    gotoChatPage();
                                }
                            }
                        }

                        chat.client.onUpdatePrifileOK = function () {
                            consoleLog("onUpdatePrifileOK()");
                            inputKeyFilter.TextAdd(lang.updateProfileOK//The profile has been updated successfully
                                , document.getElementById("updateProfile"), "uparrowdivgreen");
                        }

                        chat.client.onError = function (error) { ErrorMessage('SignalR onError: ' + error)}
                        chat.client.onRooms = function (rooms) {
                            consoleLog('chat.client.onRooms');
                            var el = document.getElementById("roomsList");
                            el.innerHTML = '';
                            rooms.forEach(function (room) { el.appendChild(createElementRoom(room)); });
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
                            disable(true);
                        });
                        $.connection.hub.reconnected(function () {
                            consoleLog('SignalR reconnected: Raised when the underlying transport has reconnected.');
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
                                    case $.connection.connectionState.connecting://0://connecting
                                        message = (isRussian() ? "Соединение" : "Сonnecting") + "...";
                                        break;
                                    case $.connection.connectionState.connected://1://connected
                                        message = "";
                                        init();
                                        break;
                                    case $.connection.connectionState.reconnecting://2://reconnecting
                                        message = '<img src="../img/Wait.gif" style="width:20px; height:20px;" alt="wait" />  ' +
                                            (isRussian() ? "Восстановление соединения" : "Reconnecting") + "...";
                                        break;
                                    case $.connection.connectionState.disconnected://4://disconnected
                                        message = (isRussian() ? "Потеря соединения" : "Disconnected")
                                            + "... <input type='button' value='" + (isRussian() ? "Cоедениться снова" : "Connect again") + "' onclick='javascript: return onConnectAgain()' />";
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
                            consoleLog('SignalR disconnected: Raised when the connection has disconnected.');
                        });
                        $.connection.hub.error(function (error) {
                            consoleError('SignalR error: ' + error)
                        });

                        //To enable client-side logging on a connection,
                        //set the logging property on the connection object before you call the start method to establish the connection.
                        //$.connection.hub.logging = true;

                        // Start the connection.
                        $.connection.hub.start().done(function () {
                        });
                    } catch (e) {
                        ErrorMessage(e.message);
                    }
                });
            }
            function init() {
                consoleLog('init()');
                createTabs();
            }
            function disable(isDisable) {
                var visibilityCenter;
                var visibilityOpenpage;
                if (isDisable) {
                    visibilityCenter = "hidden";
                    visibilityOpenpage = "visible";
                } else {
                    visibilityCenter = "visible";
                    visibilityOpenpage = "hidden";
                }
                document.getElementById("center").style.visibility = visibilityCenter;
                document.getElementById("openpage").style.visibility = visibilityOpenpage;
            }
        </script>
        </div>
    </form>
</body>
</html>
