/**
 * SignalRChat functions. Instead of IRC.js file
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
 *  2017-07-05, : 
 *       + init.
 *
 */


function SignalRChatTest() {
    if (document.querySelector('head').querySelector('#Scripts\\/IRC\\.js') == null)
        return;
    consoleError('SignalRChat.js is not compatible with IRCChat.js');
}
SignalRChatTest();
function SignalRChatInit() {
    
    document.getElementById("SignalRChatHeader").innerHTML = lang.signalRChatHeader;//Connect to our server. All visitors can begin a video conference and share files.

    document.getElementById("chatRoomPrompt").innerHTML = lang.chatRoomPrompt;//Type a chat room name
    document.getElementById("selectChatRoomPrompt").innerHTML = lang.selectChatRoomPrompt;//or select a room from the list
    document.getElementById("defaultChatRoom").value = lang.defaultString;//Default

    document.getElementById("geolocationPrompt").innerHTML = lang.geolocationPrompt;//Geolocation

    document.getElementById("additionallyHeader").innerHTML = lang.additionally;//Additionally

    document.getElementById("nicknamePrompt").innerHTML = lang.myNickname;//My nickname
    document.getElementById("firstNamePrompt").innerHTML = lang.firstName;//First Name
    document.getElementById("secondNamePrompt").innerHTML = lang.secondName;//Second Name
    document.getElementById("aboutMePrompt").innerHTML = lang.aboutMe;//About Me
    document.getElementById("locationPrompt").innerHTML = lang.myLocation;//My Location

    document.getElementById("genderPrompt").innerHTML = lang.i;//I
    document.getElementById("selectGender").innerHTML = lang.selectGender;//select gender
    document.getElementById("male").innerHTML = lang.male;//male
    document.getElementById("female").innerHTML = lang.female;//female
    document.getElementById("couple").innerHTML = lang.couple;//couple
    document.getElementById("another").innerHTML = lang.another;//another

    document.getElementById("submit").value = lang.submit;//Enter

    document.getElementById("birthdayPrompt").innerHTML = lang.birthdayPrompt;//Birthday
    document.getElementById("clearBirthday").value = lang.clear;//Clear

    //birthday
    var options = {
        formatMessage: lang.typeBirthday//'Please type your birthday %s'
        , dateLimitMessage: lang.birthdayLimit//'Please type your birthday between "%min" and "%max"'
    }
    try {//for compatibility with IE6
        var min = new Date(((new Date().getFullYear() - 100)
            + '-01-01T00:00:00Z')//for Safari
            .toString()).toISOString().match(/^(.*)T.*$/i)[1];//'1999-01-01'//100 years ago;
        options.min = min;
        var max = new Date(((new Date().getFullYear() - 7) + '-01-01T00:00:00Z').toString()).toISOString().match(/^(.*)T.*$/i)[1];//"2010-06-27" //7 years ago
        options.max = max;
    } catch (e) { }
    CreateDateFilter('birthday', options);
    CreateMaxLengthFilter('Nickname', {
        formatMessage: lang.lengthLimit//'Length limit to %s sumbols'
        , onerror: function (elementInput) {
            elementInput.focus();//except Firefox
        }
    });
    CreateMaxLengthFilter('firstName', {
        formatMessage: lang.lengthLimit//'Length limit to %s sumbols'
        , onerror: function (elementInput) {
            elementInput.focus();
        }
    });
    CreateMaxLengthFilter('secondName', {
        formatMessage: lang.lengthLimit//'Length limit to %s sumbols'
        , onerror: function (elementInput) {
            expandAdditionally();
            elementInput.focus();
        }
    });
    CreateMaxLengthFilter('chatRoom', {
        formatMessage: lang.lengthLimit//'Length limit to %s sumbols'
        , onerror: function (elementInput) {
            elementInput.focus();
        }
    });
    CreateMaxLengthFilter('location', {
        formatMessage: lang.lengthLimit//'Length limit to %s sumbols'
        , onerror: function (elementInput) {
            elementInput.focus();
        }
    });

    //http://unixpapa.com/js/querystring.html
    loadScript("/js/QueryString.js", function () {
        var q = new QueryString();
        g_user.browserID = q.value("browserID");
        if ((typeof g_user.browserID != 'undefined') && (g_user.browserID != "")) {
            document.getElementById("updateProfile").value = lang.updateProfile;//"Update Profile"
            document.getElementById('trChatRoom').style.borderTop = "1px solid black";
            $.connection.chatHub.server.getUser(g_user.browserID);
        } else {
            document.getElementById('trUpdateProfile').style.display = 'none';
            var userJSON = get_cookie("User");
            var user;
            if ((typeof userJSON != 'undefined') && (userJSON != '')) {
                try {
                    user = JSON.parse(userJSON);
                } catch (e) {
                    consoleError(e);
                }
            }

            //nickname
            var Nickname = q.value("Nickname");
            if (!Nickname) {
                if (typeof user != 'undefined')
                    Nickname = user.nickname;
            }
            if (Nickname)
                document.getElementById("Nickname").value = Nickname;

            if (typeof user != 'undefined') {
                setFields(user);
            }

            var chatRoom = document.getElementById("chatRoom");
            var chatRoomName = q.value("chatRoom");
            if (chatRoomName)
                chatRoom.value = chatRoomName;
            else getDefaultChatRoom();
            disable(false);
/*
            g_user.browserID = q.value("browserID");
            if ((typeof g_user.browserID != 'undefined') && (g_user.browserID != "")) {
                $.connection.chatHub.server.getUser(g_user.browserID);
            }
*/
            if (g_submit)
                enterToChat();
            $.connection.chatHub.server.getRooms();
        }
    });
}
var g_submit = false;
function onKeyupNickname(value) {
    consoleLog("onKeyupNickname(" + value + ")");
    g_user.nickname = value;
    $.connection.chatHub.server.validNickname(JSON.stringify(g_user), document.getElementById("chatRoom").value);
}
function onKeyupChatRoom(value) {
    consoleLog("onKeyupChatRoom(" + value + ")");
    if (g_user.id != "")
        g_user.nickname = "";
    $.connection.chatHub.server.validNickname(JSON.stringify(g_user), value);

    //find room in the rooms list
    if (value == "")
        return;
    value = value.toUpperCase();
    var itemRooms = document.getElementsByName("itemRoom");
    for (var i = 0; i < itemRooms.length; i++) {
        var charRoomName = getItemRoomName(itemRooms[i]).toUpperCase();
        //consoleLog("charRoomName = " + charRoomName);
        if (charRoomName.indexOf(value) == 0) {
            selectItemRoom(itemRooms[i]);
            itemRooms[i].scrollIntoView();
            break;
        }
    }
}
var g_clicked_itemRoom;
function onclickItemRoom(e) {
    if (!e) e = window.event;
    var itemRoom = e.target || e.srcElement;
    consoleLog("onclickItemRoom(" + itemRoom + ")");
    selectItemRoom(itemRoom);

    //change chatRoom input element
    var charRoomName = getItemRoomName(itemRoom);
    document.getElementById("chatRoom").value = charRoomName;
    $.connection.chatHub.server.validNickname(JSON.stringify(g_user), charRoomName);
}
function updateProfile() {
    //Nickname test
    var elementInput = document.getElementById("Nickname");
    var value = elementInput.value.replace(/^\s+/, "");
    if (value == "") {
        inputKeyFilter.TextAdd(lang.typeNickname//'Please type your nickname'
            , elementInput);
        elementInput.focus();
        return false;
    }
    if (!elementInput.validation())
        return false;
    g_user.nickname = value;

    //Gender
    var elementGender = document.getElementById("gender");
    if (elementGender.selectedIndex != -1)
        g_user.genderId = elementGender[elementGender.selectedIndex].value;

    //Birthday
    //                g_user.birthday = '';
    var elementBirthday = document.getElementById("birthday");
    if (elementBirthday.defaultValue != elementBirthday.value) {
        //for compatibility with IE6
        var arrayDate = elementBirthday.value.match(/^([\d]*)-([\d]*)-([\d]*)$/);
        if (!arrayDate || (arrayDate.length != 4)) {
            inputKeyFilter.TextAdd(lang.typeBirthday.replace('%s', elementBirthday.defaultValue)//'Please type your birthday %s'
                , elementBirthday);
            elementBirthday.focus();
            return false;
            /*
                                    consoleError('Invalid date: ' + target.value);
                                    return;
            */
        }
        /*not compatible with IE6
                if (isNaN(Date.parse(elementBirthday.value
            + 'T00:00:00Z'//for Safari
            ))) 
        */
        if (isNaN(new Date(
            arrayDate[1]//year
            , arrayDate[2]//month
            , arrayDate[3]//date
        ).valueOf())) {
            inputKeyFilter.TextAdd(lang.typeBirthday.replace('%s', elementBirthday.defaultValue)//'Please type your birthday %s'
                , elementBirthday);
            elementBirthday.focus();
            return false;
        }
        g_user.birthday = elementBirthday.value;
    } else delete g_user.birthday;

    //firstName
    var elementFirstName = document.getElementById("firstName");
    if (elementFirstName.value != '') {
        if (!elementFirstName.validation()) {
            expandAdditionally();
            return false;
        }
        g_user.firstName = elementFirstName.value;
    } else delete g_user.firstName;

    //secondName
    var elementSecondName = document.getElementById("secondName");
    if (elementSecondName.value != '') {
        if (!elementSecondName.validation()) {
            expandAdditionally();
            return false;
        }
        g_user.secondName = elementSecondName.value;
    } else delete g_user.secondName;

    //location
    var elementLocation = document.getElementById("location");
    if (elementLocation.value != '') {
        if (!elementLocation.validation()) {
            expandAdditionally();
            return false;
        }
        g_user.location = elementLocation.value;
    } else delete g_user.location;

    //geolocation
    if (geolocationState.boGeolocation && !geolocationState.ready) {
        expandAdditionally();
        inputKeyFilter.TextAdd(lang.geolocationNotReady//'Geolocation is not ready'
            , document.getElementById("mapContainer"));
        return false; 
    }

    //aboutMe
    var aboutMe = document.getElementById("aboutMe").value;
    if (aboutMe != '')
        g_user.aboutMe = aboutMe;
    else delete g_user.aboutMe;

    g_user.timezoneOffset = new Date().getTimezoneOffset();

    return true;
}
function onClickUpdateProfile() {
    consoleLog("onClickUpdateProfile()");

    if (!updateProfile())
        return false;
    var userJSON = JSON.stringify(g_user);
    SetCookie("User", userJSON);
    $.connection.chatHub.server.updateProfile(userJSON);
    return false;
} 
function onClickSubmit() {
    consoleLog("onClickSubmit() $.connection.hub.state = " + $.connection.hub.state);

    if (!updateProfile()) {
        consoleError('updateProfile failed!');
        return false;
    }

    //chatRoom test
    elementInput = document.getElementById("chatRoom");
    value = elementInput.value.replace(/^\s+/, "");
    if (value == "") {
        inputKeyFilter.TextAdd(lang.typeChatRoom, elementInput);//'Please type the name of the chat room'

        elementInput.focus();
        return false;
    }
    if (!elementInput.validation())
        return false;

    if ((typeof $ != 'undefined') && (typeof $.connection != 'undefined') && (typeof $.connection.hub != 'undefined')
        && ($.connection.hub.state == $.connection.connectionState.connected) && !enterToChat())
        return false;

    g_submit = true;
    disable(true);
    return false;
}
function enterToChat() {
    try {
        $.connection.chatHub.server.enterToChat(JSON.stringify(g_user), value);
    } catch (e) {
        consoleError(e.message);
        return false;
    }
    return true;
}
function setFields(user) {
    //gender
    var elementGender = document.getElementById("gender");
    for (var i = 0; i < elementGender.length; i++) {
        if (elementGender[i].value == user.genderId) {
            elementGender[i].selected = true;
            break;
        }
    }

    //birthday
    var elementBirthday = document.getElementById("birthday");
    //                    var birthday = window.get_cookie('Birthday', elementBirthday.defaultValue);
    var birthday = user.birthday;
    if ((typeof birthday != 'undefined') && (birthday != elementBirthday.defaultValue))
        elementBirthday.value = birthday;

    if (typeof user.firstName != 'undefined')
        document.getElementById("firstName").value = user.firstName;
    if (typeof user.secondName != 'undefined')
        document.getElementById("secondName").value = user.secondName;
    if (typeof user.aboutMe != 'undefined')
        document.getElementById("aboutMe").value = user.aboutMe;
    if (typeof user.location != 'undefined')
        document.getElementById("location").value = user.location;
}
function onclickAdditionally() {
    consoleLog("onclickAdditionally()");
    var tableAdditionally = 'tableAdditionally';
    if (!isBranchExpanded(tableAdditionally) && !geolocationState.boGeolocation) {
        //geolocation
        //http://webmap-blog.ru/obzors/ispolzuem-html5-geolocation-api
        //геолокацию надо загружать после загрузки Chat.js что бы g_user был определен
        if (navigator.geolocation) {
            document.getElementById('geolocation').style.display = 'block';
            if (get_cookie('geolocation', false) == 'true')
                onclickGeolocation();
        } else consoleError('geolocation does not supports');
    }
    return onbranch(tableAdditionally, 'branchAdditionally');
};
function expander(branchId, informerId, displayVisible) {
    //consoleLog("onclickSelectChatRoom()");
    if (typeof displayVisible == 'undefined')
        displayVisible = 'block';
    var branch = document.getElementById(branchId);
    var display, res;
    var informer = document.getElementById(informerId);
    if (branch.innerHTML == "▼") {
        display = "none";
        branch.innerHTML = "▶";
        res = false;
    } else {
        display = displayVisible;
        branch.innerHTML = "▼";
        res = true;
    }
    informer.style.display = display;
    return res;
};
function onclickSelectChatRoom() {
    consoleLog("onclickSelectChatRoom()");
    if(expander('branchSelectChatRoom', 'roomsList'))
        setTimeout(function () { document.getElementById('roomsList').scrollIntoView(); }, 0);
    return false;
};
function geolocation() {
    //consoleLog("geolocation()");
    var geolocationMessageDisplay;

    var elementLocation = document.getElementById('location');
    var geolocationMessage = document.getElementById('geolocationMessage');
    var clientWidth = elementLocation.clientWidth + 'px';
    var wait = document.getElementById('wait');

    //http://webmap-blog.ru/obzors/ispolzuem-html5-geolocation-api
    if (navigator.geolocation) {
        var mapContainer = document.getElementById("mapContainer");
        switch (mapContainer.childNodes.length) {
            case 0:
                break;
            case 1:
                mapContainer.removeChild(mapContainer.childNodes[0]);
                break;
            default: consoleError('mapContainer.childNodes.length = ' + mapContainer.childNodes.length);
        }
        consoleLog('geolocation');
        geolocationMessage.innerHTML = lang.noGeolocation;//Your browser does not support geolocation
        wait.style.display = 'block';
        navigator.geolocation.getCurrentPosition(function (position) {
            //consoleLog('navigator.geolocation.getCurrentPosition success');
            consoleLog('latitude = ' + position.coords.latitude + '. longitude = ' + position.coords.longitude + '. accuracy = ' + position.coords.accuracy + '. altitude = ' + position.coords.altitude + '. altitudeAccuracy = ' + position.coords.altitudeAccuracy + '. speed = ' + position.coords.speed + '. heading = ' + position.coords.heading);
            g_user.position = {
                coords: {
                    accuracy: position.coords.accuracy
                    , latitude: position.coords.latitude
                    , longitude: position.coords.longitude
                }
                , timestamp: new Date(position.timestamp).toISOString()
            }
            if (position.coords.altitude != null)
                g_user.position.coords.altitude = position.coords.altitude;
            if (position.coords.altitudeAccuracy != null)
                g_user.position.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
            if (position.coords.heading != null)
                g_user.position.coords.heading = position.coords.heading;
            if (position.coords.speed != null)
                g_user.position.coords.speed = position.coords.speed;

            var clientWidth = elementLocation.clientWidth + 'px';
            mapContainer.style.height = clientWidth;
            mapContainer.style.width = clientWidth;
            mapContainer.position = position;
            mapPosition(mapContainer);

            //get my address
            loadScript("/js/myRequest.js", function () {
                //https://developers.google.com/maps/documentation/geocoding/intro?hl=ru#ReverseGeocoding
                var response = JSON.parse(getSynchronousResponse('https://maps.googleapis.com/maps/api/geocode/json?latlng='
                    + position.coords.latitude + ',' + position.coords.longitude + '&key=AIzaSyDEYZcjIGeiMYqmr453X7Mfh-ogNx0j9uc'));
                if (response.status == 'OK') {
                    var detected = false;
                    for (var i = 0; i < response.results.length; i++) {
                        if (response.results[i].types[0] == 'locality') {
                            consoleLog('My address: ' + response.results[i].formatted_address);
                            elementLocation.value = response.results[i].formatted_address;
                            detected = true;
                            geolocationMessage.innerHTML = lang.geolocationWarning;//WARNING!!! All chat visitors will see your true location
                            wait.style.display = 'none';
                            break;
                        }
                    }
                    if (!detected) consoleError('get my address failed!');
                    //else setTimeout(function () { mapContainer.scrollIntoView(); }, 0);
                } else consoleError('response.status: ' + response.status + ' ' + response.error_message);
            });
            geolocationState.ready = true;
        }
        , function (err) {
            consoleError('geolocation.getCurrentPosition error: ' + err.code + ': ' + err.message);
            var message = '';
            switch (err.code) {
                case 0://UNKNOWN_ERROR 
                    break;
                case err.PERMISSION_DENIED:
                    if (window.location.protocol == "https:"){
                        //                                    message = lang.permissionDeniedUser;//'User denied Geolocation'
                        //onclickGeolocation();
                    }
                    else message = lang.permissionDenied;//'Permission to media devices is denied. Please use protocol for secure communication HTTPS for opening this web page.' 
                    break;
                case err.POSITION_UNAVAILABLE:
                    message = lang.positionUnavailable;//'position unavailable'
                    break;
                case err.TIMEOUT:
                    message = lang.positionTimeout;//'position timeout'
                    break;
                default: consoleError('err.code = ' + err.code);
            }
            //                        consoleError(err.code + ': ' + err.message + message);
            if (message.length != 0)
                message = ' ' + message;
            geolocationMessage.innerHTML = '<font style="color:red;">' + lang.geolocationFailed + ' ' + err.code + ': ' + err.message + message + '</font>'//geolocation failed!
        });
    } else concoleError('Geolocation API is not supported in your browser');
};
var geolocationState = {
    boGeolocation: false
    , ready: false
}
function onclickGeolocation() {
    consoleLog("onclickGeolocation()");
    var geolocationMessageDisplay;

    var elementLocation = document.getElementById('location');
    var geolocationMessage = document.getElementById('geolocationMessage');
    var clientWidth = elementLocation.clientWidth + 'px';
    geolocationMessage.style.width = clientWidth;

    var geolocationPrompt = document.getElementById("geolocationPrompt");
    if (expander('branchGeolocation', 'mapContainer')) {
        geolocationMessageDisplay = 'block';
        geolocation();
        geolocationState.boGeolocation = true;
        geolocationPrompt.innerHTML = lang.cancel;//Cancel
    } else {
        geolocationMessageDisplay = 'none';
        geolocationState.boGeolocation = false;
        delete g_user.position;
        document.getElementById('wait').style.display = geolocationMessageDisplay;
        geolocationPrompt.innerHTML = lang.geolocationPrompt;//Geolocation
    }
    SetCookie('geolocation', geolocationState.boGeolocation.toString());
    geolocationMessage.style.display = geolocationMessageDisplay;
    return false;
};
var g_cookieOwerflow = 0, g_aboutMeLength = 0;
function onkeyupAboutMe() {
    //consoleLog('onkeyupAboutMe()');
    if (g_cookieOwerflow == 0)
        return;
    updateProfile();
    var userJSON = JSON.stringify(g_user);
    var length = SetCookie("User", userJSON);
    var message = '';
    if (length != 0) {
        g_cookieOwerflow = userJSON.length - length;
        var elementAboutMe = document.getElementById('aboutMe');
        g_aboutMeLength = elementAboutMe.value.length;
        consoleError('User cookie owerflow: ' + g_cookieOwerflow);

        var sumbolsLength = g_cookieOwerflow + (document.getElementById('aboutMe').value.length - g_aboutMeLength);
        if (sumbolsLength > 0)
            message = '<font style="color:red;">' + lang.symbolsOwerflow + '</font>';//%s symbols owerflow
        else {
            sumbolsLength = -sumbolsLength;
            message = lang.symbolsLeft;//%s symbols left
        }
        message = message.replace('%s', sumbolsLength);
    }
    document.getElementById('cookieOwerflow').innerHTML = message;
}
function onclickClearBirthday() {
                    
    var elementBirthday = document.getElementById("birthday");
    elementBirthday.value = elementBirthday.defaultValue;
    if (typeof elementBirthday.ikf != 'undefined')
        elementBirthday.ikf.oldValue = elementBirthday.defaultValue;
} 
function getDefaultChatRoom() { return document.getElementById("chatRoom").value = "Chat"; }

//ATTENTION!!! Also see createElementRoom in G:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\SignalRChat\SignalR Getting Started Application\C#\SignalRChat\Default.aspx
function createElementRoom(room) {
    var objectRoom = createElRoomSignalR(room);
    objectRoom.elRoom.innerHTML = room.RoomName + objectRoom.elUsersCount;
    objectRoom.elRoom.className += " streamer";
    objectRoom.elRoom.onclick = onclickItemRoom;
    return objectRoom.elRoom;
}
function expandAdditionally() {
    if (!window.isBranchExpanded(document.getElementById('tableAdditionally')))
        onclickAdditionally();
}
