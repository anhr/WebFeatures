﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="SignalRChat.Default" Async="true" %>
<%
    //https://support.microsoft.com/ru-ru/kb/239875
    //http://www.w3schools.com/asp/coll_servervariables.asp
    if (Request.ServerVariables.Get("HTTPS") == "off")
    {
        string strQueryString = Request.ServerVariables.Get("QUERY_STRING");
        if (strQueryString != "")
            strQueryString = "?" + strQueryString;
        Response.Redirect("https://" + Request.ServerVariables.Get("SERVER_NAME") + Request.ServerVariables.Get("URL") + strQueryString);
    }
%>

<!DOCTYPE html>
<html>
<head>
<!-- Global site tag (gtag.js) - Google Analytics -->
    <!-- Если использовать этот код для локального хоста, то в статистику Google Analytics попадут все мои заходы на данную страницу во время отладки
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-22259075-3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-22259075-3');
</script>
-->
    <title>Chat</title>
    <meta name="author" content="Andrej Hristoliubov anhr@mail.ru">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <link rel="stylesheet" href="../MyIsapi/normal.css" type="text/css">
    <script type="text/javascript" src="/js/Common.js"></script>
    <script type="text/javascript" src="/js/resizer.js"></script>
    <script type="text/javascript" src="/js/myRequest.js"></script>
    <script type="text/javascript" src="/js/QueryString.js"></script><!-- http://unixpapa.com/js/querystring.html -->
    <link rel="stylesheet" href="../MyIsapi/gradient.css" type="text/css" />
    <script type="text/javascript" src="Scripts/Chat.js"></script>
    <link rel="stylesheet" href="../MyIsapi/style.css" type="text/css" /><!-- context menu -->
    
    <link rel="stylesheet" href="../MyIsapi/InputKeyFilter.css" type="text/css">
    <script type="text/javascript" src="/js/InputKeyFilter.js"></script>

    <link rel="stylesheet" href="../TreeElement/myTreeView.css" type="text/css">
    <script type="text/javascript" src="../TreeElement/myTreeView.js"></script>

    <!-- https://github.com/duckinator/innerText-polyfill for compatibility with Firefox-->
    <!--<script type="text/javascript" src="../innerText-polyfill/innertext.js"></script>-->

    <!--Script references. -->
    <!--for IE5-->
    <script type='text/javascript' src="Scripts/json2.js"></script>
    <!--Reference the jQuery library. -->
    <script type='text/javascript' src="Scripts/jquery-1.6.4.js"></script>
    <!--Reference the SignalR library. -->
    <script type='text/javascript' src="Scripts/jquery.signalR-2.0.0.js"></script>

    <!--Reference the autogenerated SignalR hub script. -->
    <script type='text/javascript' src="signalr/hubs"></script>
    <% if(!IsIRCServer()) { %>
    <!--ckeditor http://ckeditor.com/ -->
    <link rel="stylesheet" href="/ckeditor/contents.css" type="text/css" />
    <script src="../ckeditor/ckeditor.js"></script>
    <script src="../ckeditor/samples/js/sample.js"></script>
    <% } %>
    <!-- for edge http://stackoverflow.com/questions/36824585/does-rtcpeerconnection-work-in-microsoft-edge -->
<!--    <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script> -->

    <script src="/JS/WebRTC/DetectRTC.js"> </script><!--этот скрипт надо выполнить перед PeerConnection.js потому что там совпадают имена некоторые переменных: navigator.getUserMedia -->
    <style>
        .gradient_header
	        {/*http://htmlbook.ru/css3-na-primerakh/lineinyi-gradient     */
		        border-bottom: 2px solid #999999;
		        background: #cccccc; /* Для старых браузров */
		        background: -moz-linear-gradient(top, #cccccc, #FFFFFF); /* Firefox 3.6+ */
		        /* Chrome 1-9, Safari 4-5 */
		        background: -webkit-gradient(linear, left top, left bottom, 
					        color-stop(0%,#cccccc), color-stop(100%,#FFFFFF));
		        /* Chrome 10+, Safari 5.1+ */
		        background: -webkit-linear-gradient(top, #cccccc, #FFFFFF);
		        background: -o-linear-gradient(top, #cccccc, #FFFFFF); /* Opera 11.10+ */
		        background: -ms-linear-gradient(top, #cccccc, #FFFFFF); /* IE10 */
		        background: linear-gradient(top, #cccccc, #FFFFFF); /* CSS3 */ 
		        /*filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr='#cccccc', endColorStr='#FFFFFF', gradientType='0');*//*IE Error: I do not see borders in the table headers*/
		        padding: .3em;
		        -moz-border-radius: 5px;/* Firefox */
		        -webkit-border-radius: 5px;/* Safari 4 */
		        border-radius: 5px;/* IE 9, Safari 5, Chrome */
	        }
        .message {
            display: none;
        }

        /*http://starper55plys.ru/css/otdelnye-bloki/ */
        .blok_hide {
            margin: 0px;
            padding: 0px;
            /*border: 1px solid #999999;*/
        }

        .blok_top {
            margin: 1px 3px 3px 3px;
        }

        .blok_shadow {
            padding: 5px;
            background: #F0FCE8;
            border-radius: 4px;
            box-shadow: rgba(0,0,0,1.2) 0px 1px 3px;
        }

        .blok_bottom {
            margin: 1px 3px 3px 3px;
        }
        .float_hide {
            width: 0px;
        }
        .float_right {
            float: right;
	        padding-top:5px;
	        padding-bottom:5px;
            padding-left: 0px;
            padding-right: 0px;
            overflow:hidden;
            transition: width 0.5s;
        }
        .float_background:hover {
	        background: #cccccc;
	        background: -moz-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -webkit-gradient(linear, left top, left bottom, 
				        color-stop(0%,#cccccc), color-stop(100%,#FFFFFF));
	        background: -webkit-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -o-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -ms-linear-gradient(top, #cccccc, #FFFFFF);
	        background: linear-gradient(top, #cccccc, #FFFFFF);
	        -moz-border-radius: 5px;
	        -webkit-border-radius: 5px;
	        border-radius: 5px;
        }
        .sendButton {
            float: right;
	        padding:5px;
	        cursor: pointer;
        }
        .sendButton:hover {
	        background: #cccccc;
	        background: -moz-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -webkit-gradient(linear, left top, left bottom, 
				        color-stop(0%,#cccccc), color-stop(100%,#FFFFFF));
	        background: -webkit-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -o-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -ms-linear-gradient(top, #cccccc, #FFFFFF);
	        background: linear-gradient(top, #cccccc, #FFFFFF);
	        -moz-border-radius: 5px;
	        -webkit-border-radius: 5px;
	        border-radius: 5px;
        }
        .video {
            /*padding:5px;*/
            margin-top:5px;
            overflow:auto;
        }
        .help:hover { 
            background: initial;
        }
        .sendMenu { 
            float: right;
	        cursor: pointer;

            /*background: white;*/
            /*border: 1px solid black;*/

            width: 0px;
            height: 16px;
            margin-left: 0px;
            margin-right: 0px;
	        padding-top:5px;
	        padding-bottom:5px;
            padding-left: 0px;
            padding-right: 0px;
            -webkit-transition: width 2s, -webkit-transform 2s;
            transition: width 0.5s;
            overflow:hidden;
        }
        .sendMenuItem:hover {
            /*padding: 5px;*/
	        background: #cccccc;
	        background: -moz-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -webkit-gradient(linear, left top, left bottom, 
				        color-stop(0%,#cccccc), color-stop(100%,#FFFFFF));
	        background: -webkit-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -o-linear-gradient(top, #cccccc, #FFFFFF);
	        background: -ms-linear-gradient(top, #cccccc, #FFFFFF);
	        background: linear-gradient(top, #cccccc, #FFFFFF);
	        -moz-border-radius: 5px;
	        -webkit-border-radius: 5px;
	        border-radius: 5px;
        }
        /*
        .sendMenuhover { 
            width: 100px;
        }*/
    </style>

    <script type="text/javascript">
        var fatalError = false;
        var boBodyFocus = true;
        function onresize() {
		    if (fatalError)
		        return;
		    if(DetectRTC.browser.isIE && (DetectRTC.browser.version < 8)){
		        loadScript("lang/" + getLanguageCode() + ".js", function() { 
		            alert(lang.ieNotCompatible.replace('%s', DetectRTC.browser.version));//Your Internet Explorer browser version %s is too old and not compatible with our web page
		        });
		        fatalError = true;
		    }
		    var elementChat = document.getElementById("leftPanel");//messages");
		    var elementUsers = document.getElementById("users");
	        var usersWidthMin = document.body.clientWidth - 100;
	        if(elementUsers.clientWidth > usersWidthMin)
	            elementUsers.style.width = usersWidthMin + "px";
		    var styleLeftPanel = getStyle(elementChat);
		    var height =
                  document.body.clientHeight
                - document.getElementById("pageHeader").clientHeight
                - document.getElementById("titleBranch").clientHeight
                - getMargin(styleLeftPanel.marginBottom) - getMargin(styleLeftPanel.marginTop)
                - parseInt(styleLeftPanel.paddingBottom) - parseInt(styleLeftPanel.paddingTop)
                - 1;
		    if (height < 100)
		        height = 100;
		    document.getElementById("messagesContaner").style.height = (height - document.getElementById("send_hide").clientHeight) + 'px';
		    height += 'px'
		    elementUsers.style.height = height;
		    elementChat.style.height = height;
		    document.getElementById("resizerUsers").style.height = height;
		    var elTouch = document.getElementById("touch");
		    if (elTouch != null)
		        elTouch.style.height = height;
		    editorWidth();
		}

        function AddSmile(object, smile, title) {
            if(!object)
                return;
            if(!title)
                title = "";

            var image;
            switch(smile){
                case '😀':
                    image = "regular_smile.gif";
                    break;
                case '😕':
                    image = "sad_smile.gif";
                    break;
                case '😡':
                    image = "angry_smile.gif";
                    break;
                default:
                    consoleError("Add " + smile + " smile failed!");
                    object.innerHTML = title;
                    return;
            }

            object.innerHTML = '<img src="../../../ckeditor/plugins/smiley/images/' + image + '" alt="" title="' + title + '">';
        }
    </script>

</head>
<!--    onresize="javascript: onresize();" Do not works in IE6
    onclick="javascript: onclickBody(event);
    onbeforeunload="return onbeforeunload()"
    -->
<body "
    onresize="javascript: onresize();"
    style="margin: 0px; padding:0px;"
    class="gradient"
>
<!-- onload="javascript: init();" -->

    <!--script Test-->
    <div id='ScriptProblem' style='background: white; '><FONT style='color: red; background-color: white'>WARNING: Active Scripting in your internet browser is disabled. Refresh your Web page to find out the current status of your Web page or enable Active Scripting.</FONT></div>
    <script type='text/javascript'>scriptTest();</script>

    <div class="center message blok" style="height: 20%; overflow:auto;" id='Message'></div>
    <script type="text/javascript">
        var emailSubject = "Chat error";
    </script>

    <div id="openpage" class="center"><img src="../img/Wait.gif" alt="wait" /></div>

    <div id="chatbody" style="visibility:hidden;">
        <div id="pageHeader" style="overflow: auto;"><!--for firefox 41.0.1 --> 
            <h1 id="title" style="margin: 0px; padding: 5px; float:left;"></h1>
	        <ul onmouseover="javascript: openContextMenuUsers()" onmouseout="javascript: closeContextMenuUsers()" style="float:right; list-style:none; margin:-5px 0 0 5px; padding:0;">
		        <li>
                    <h1 class="menu" id="menuUsers"></h1>
                    <table id="contextMenuUsers" class="contextMenu closeContextMenu">
                        <% if(IsIRCServer()) { %>
		                <tr class="contextMenuItem" onclick="onclickIRCJoin2(document.getElementById('IRC'));closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">⎆</td><!--⨝-->
			                <td class="contextMenuItemRight" id="IRCJoinButton"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickIRCNick();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">📛</td>
			                <td class="contextMenuItemRight" id="IRCNickButton"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickNSRegistering();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">㎱</td><!--☂-->
			                <td class="contextMenuItemRight" id="NSCommandsButton"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="g_IRC.CS.onclick(event);closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">⚿</td>
			                <td class="contextMenuItemRight" id="CSAssistantButton"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="gotoChatPage();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">↯</td><!--⌁ uncompatible with LJ TV-->
			                <td class="contextMenuItemRight" id="IRCDisconnect"></td>
		                </tr>
                        <% } else {%>
		                <tr class="contextMenuItem" onclick="onclickCreateSessionCamera();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">📹</td>
			                <td class="contextMenuItemRight" id="broadcastVideoText"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickCreateSessionMicrophone();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">🎤</td>
			                <td class="contextMenuItemRight" id="broadcastMicrophoneText"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickSendFile();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">📁</td>
			                <td class="contextMenuItemRight" id="sendFileText"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickSendPicture();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">🖼</td><!--⌗-->
			                <td class="contextMenuItemRight" id="sendFilePictureText"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickSendVideo();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">📽</td><!--📼-->
			                <td class="contextMenuItemRight" id="sendFileVideoText"></td>
		                </tr>
		                <tr class="contextMenuItem" onclick="onclickSendAudio();closeContextMenuUsers()">
			                <td class="contextMenuItemLeft">📢</td><!--🖭✇-->
			                <td class="contextMenuItemRight" id="sendFileAudioText"></td>
		                </tr>
<!--не работает для IRC канала и привата 
		                <tr class="contextMenuItem" onclick="window.history.back()" style="border-top:black 1px solid">
			                <td class="contextMenuItemLeft">🚪</td>
			                <td class="contextMenuItemRight" id="sendExitText"></td>
		                </tr>
-->
                        <% } %>
                    </table>
		        </li>
	        </ul>
        </div>
        <div id="titleBranch"><div id="titleBranchRoom"></div><div id="titleBranchUser"></div></div>
        <div id="chatUsers" class="blok_hide2" style="width:100%; padding:0px; overflow:auto;">
            <div id="users" class="blok_top blok_shadow" style="width:15%; float: right; overflow:auto;">
                <div id="invitations" style="display:none">
                    <a href="#" onclick="javascript: return onclickInvitations()">
                        <h1>
                            <span id="branchInvitations">▶</span>
                            <span id="invitationsHeader"></span>
                            <span>: </span>
                            <span id="invitationsCount"></span>
                            <img id="blinkInvitations" src="../img/BlinkQuad.gif" style="width:12px; height:12px" alt="">
                        </h1>
                    </a>
                    <div id="informerInvitations" class="b-toggle" style="margin-top:5px;">
                        <div id="noInvitations"></div>
                    </div>
                </div>
                <% if(!IsIRCServer()) { %>
                <div id="microphones" style="display:none">
                    <a href="#" onclick="javascript: return onclickMicrophones()">
                        <h1>
                            <span id="branchMicrophones">▶</span>
                            <span id="microphoneHeader"></span>
                            <span>: </span>
                            <span id="microphonesCount"></span>
                        </h1>
                    </a>
                    <div id="informerMicrophones" class="b-toggle" style="margin-top:5px;">
                        <div id="noMicrophones"></div>
                    </div>
                </div>
                <% } %>
                <% if(IsIRCServer()) { %>
                <!--IRC-->
                <div id="IRC">
<!--
                    <div>
                        <% if(IsIRCChannelOrPrivate()) { %>
                        <span id="IRCConnectResponse"></span>
                        <% } %>
                    </div>
-->
                    <!--Nickserv Registering-->
                    <div id="NSRegistering" class="gradient_gray b-toggle">
                        <span id="NSCloseRegistering" onclick="javascript: onclickNSRegistering()" class="sendButton">X</span>
                        <a href="http://wiki.foonetic.net/wiki/Nickserv_Commands" target="_blank" class="sendButton">?</a>
                        <h3 id="NSCommands" align="center"></h3>
                        <hr>
                        <div id="NSNick"></div>
                        <div><label id="NSPassLabel" for="NSPass"></label><input type="password" id="NSPass" /></div>
                        <div align="center">
                            <input type="button" id="NSIdentify" onclick="javascript: g_IRC.onclickNSIdentify()" />
                            <input type="button" id="NSDrop" onclick="javascript: g_IRC.onclickNSDrop()" />
                        </div>
                        <hr>
                        <div align="center">
                            <input type="button" id="NSSendPass" onclick="javascript: g_IRC.onclickNSSendPass()" />
                        </div>
                        <hr>
                        <b id="NSRegisteringOptionsHeader"></b>
                        <div><label id="NSPassLabel2" for="NSPass2"></label><input type="password" id="NSPass2" /></div>
                        <div><label id="NSEmailLabel" for="NSEmail"></label><input type="email" id="NSEmail" /></div>
                        <div align="center"><input type="button" id="NSRegister" onclick="javascript: g_IRC.onclickNSRegister()" /></div>
                    </div>
                    <!--New Nick-->
                    <div id="IRCNick" class="gradient_gray b-toggle">
                        <span id="IRCCloseNick" onclick="javascript: onclickIRCNick()" class="sendButton">X</span>
                        <h3 id="IRCNickHeader" align="center"></h3>
                        <div><label id="IRCNewNickLabel" for="IRCNewNick"></label><input id="IRCNewNick" /></div>
                        <div align="center"><input type="button" id="IRCNewNickButton" onclick="javascript: g_IRC.onclickIRCNickChange()" /></div>
                    </div>
                </div>
                <% } %>
                <% if(!IsIRCChannelOrPrivate()) { %>
                <% if(IsIRCServer()) { %>
                <!--IRC Joined Channels-->
                <div id="IRCJoinedChannels"></div>
                <% } %>
                <!--rooms-->
                <div id="rooms" style="display:<% if(IsIRCServer()) { %>block<% } else {%>none<% } %>">
                    <a href="#" onclick="javascript: return onclickRooms()">
                        <h1 style="margin:0">
                            <span id="branchRooms">▶</span>
                            <span id="roomsHeader"></span>
                            <span>: </span>
                            <span id="roomsCount"></span>
                            <span id="roomsWait"></span>
                        </h1>
                    </a>
                    <div id="roomsListBranch" style="<% if(IsIRCServer()) { %>overflow:auto;display:none;margin-bottom:5px;background-color:white<% } else {%>margin-top:5px;display:none<% } %>">
                        <% if(IsIRCServer()) { %> 
                        <span id="clearRoomList" onclick="javascript: g_IRC.clearChannelsList()" class="sendButton">X</span>
                        <span id="updateRoomList" onclick="javascript: g_IRC.onListUpdate()" class="sendButton">⥀</span><!--🔃. 🗘 not compatible with Windows Server 2012-->
                        <table>
                            <!--не надо добавлять символы между <tbody><tr>-->
                            <tbody id="IRCChannelsListTbody"><tr id="IRCChannelsHeaderRow" style="font-weight:bold">
                                    <td class="col colHeader colName" onclick="javascript: g_IRC.onSortChannels('.colName');">
                                        <span class="Name"></span><span class="sort" style="float:right"></span>
                                    </td>
                                    <td class="col colHeader colUsers" onclick="javascript: g_IRC.onSortChannels('.colUsers', true);">
                                        <span id="IRCCLColumnUsers">👫</span><span class="sort"></span><!--🤵-->
                                    </td>
                                    <td class="col colTopic"><span id="IRCCLColumnTopic"></span></td></tr>
                            </tbody>
                        </table>
                        <% } else {%>
                        <div id="roomsList">
                        </div>
                        <% } %>
                    </div>
                </div>
                <% } %>

                <% if(!IsIRCServer()) { %>
                <h1>▼<span id="usersHeader"></span> <span id="usersCount"><img src="../img/Wait.gif" alt="wait" /></span></h1>
                <div id="chatusers"></div>
                <% } %>
            </div>

            <!-- resize the mesages and users elements http://jsfiddle.net/3jMQD/ 
                http://stackoverflow.com/questions/8960193/how-to-make-html-element-resizable-using-pure-javascript
            -->
            <div id="resizerUsers" style="width: 5px; float: right;"></div>
            <div id="leftPanel" class="blok_top blok_shadow" style="overflow:auto;position:relative">
                <div id="messagesContaner" style="overflow:auto">
                    <% if(!IsIRCServer()) { %>
                    <span onclick="javascript: onclickEraseMessages(event)" id="eraseMessages" class="sendButton">X</span>
                    <div id="messagesHeader" style="padding-top:10px"></div>
                    <% } %>
                    <div id="messages"></div>
                </div>
                <div id="send_hide" class="blok_hide" style="width:100%;overflow:auto;position:absolute;left:0;bottom:0;">
                    <% if(IsIRCServer()) { %>
                    <a href="https://tools.ietf.org/html/rfc1459" target="_blank" class="sendButton">?</a>
                    <div id="send" class="sendButton">📨</div>
                    <div style="overflow:auto; padding:4px;">
                        <input id="IRCSend" onkeydown="javascript: g_IRC.onIRCSend(event)" style="width:100%; float:left;" />
                    </div>
                    <% } else { %>
                    <div id="speechRecognitionSetup" class="gradient_gray" style="display:none;overflow:hidden;"></div><!--overflow:hidden нужно что бы кнопка « не сдвигалась после открытия этого окна когда птичка checkboxSR не поставлена-->
                    <div id="translatorSend" style="display:none;overflow:hidden;"></div>

                    <!--toolbar-->

                    <!--chevron-->
                    <!--<span onclick="javascript: toggleSendMenu(true)" onmouseleave="javascript: toggleSendMenu(false)">-->
                        <span id="chevronButton" class="sendButton" onclick="javascript: toggleSendMenu()">«</span>
                        <span id="sendMenu" class="sendMenu" style="background:white;">
                            <span id="translatorButton" class="sendMenuItem" onclick="javascript: onClickTranslatorButton()">A⇄🉐</span>
                            <span id="speechRecognitionSetupButton" class="sendMenuItem" onclick="javascript: onClickSpeechRecognitionSetup()">⚙🎤</span><!--🎙-->
                            <span id="toolbarButton" class="sendMenuItem" onclick="javascript: onClickToolbarButton()">△</span>
                            <span id="smilesButton" class="sendMenuItem" onclick="javascript: onClickSmilesButton()">:)</span>
                        </span>
                    <!--</span>-->

                    <!--translator-->
                    <span id="translatorMenu" class="sendMenu">
                        <select id="languageTo" onchange="javascript: translatorSend.translatorBase.onchangeLanguage(event)"
                            style="float:right;"></select>
                        <span id="translateUp" class="sendMenuItem" onclick="javascript: translatorSend.onclickTranslateUp(event)"
                            style="padding-left:5px;padding-right:5px">↑</span>
                    </span>

                    <!--Speech-->
                    <span><!--Этот тег нужен для того что бы правильно находился элемент speechRecognitionIn в speechRecognition.speechRecognitionIn-->
                        <span id="speechRecognitionButton" class="float_right float_background" style="width:0px"
                            onclick="javascript: speechRecognitionToggle(event)">🎤</span>
                        <span id="speechRecognitionIn" class="float_right float_hide" style="background:white; height:20px;" ></span>
                    </span>

                    <span id="send" class="sendButton">📨</span>
                    <div style="overflow:auto; padding:4px;">
                        <textarea id="editor" style="width:auto; float:left;"></textarea>
                    </div>
                    <% } %>
                </div>
            </div>
        </div>
    </div>
    <script type='text/javascript' src="Scripts/Default.js">
    </script>
</body>
</html>