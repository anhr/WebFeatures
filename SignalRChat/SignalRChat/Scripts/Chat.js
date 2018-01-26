/**
 * Common Javascript code.
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
 *  2015-07-01, : 
 *       + init.
 *
 */
var g_user = {
    updateProfile: function(user){
        consoleLog("g_user.updateProfile(nickname: " + user.nickname + ", id: " + user.id + ")");
        for (var key in user) {
            //consoleLog(key + ': ' + user[key]);
            if ((key == 'id') || (user[key] == null))
                continue;
            this[key] = user[key];
        }
    }
    , nickname: ""
    , browserID: ""
}

var g_chatRoom = {
    RoomName: ""
    , PrivateID: ""
    , privateUserId: ""
    , privateRoomName: ""
    , getRoomName: function () {
        var chatRoom = this.RoomName;
/*не работает в приватной странице IRC. Сейчас private пищу перед названием страницы в documentTitlePrefix()
        if (this.isPrivate())
            chatRoom = chatRoom + " " + lang.strPrivate;//private
*/
        return chatRoom;
    }
    , isPrivate: function () { return (typeof g_chatRoom.PrivateID != 'undefined') && (g_chatRoom.PrivateID != ""); }
}

function gotoChatPage() {
    var location = "../chat";
    if (g_user.nickname || g_user.browserID || g_user.id || g_chatRoom.RoomName)
        location += "?user=" + JSON.stringify(g_user);;
    if (g_chatRoom.RoomName) {
        if (g_user.nickname)
            location += "&";
        location += 'chatRoom=' + encodeURIComponent(g_chatRoom.RoomName);
    }
    window.location = location;
}

function g_onRemoveRoom(roomName) {
    consoleLog("g_onRemoveRoom(" + roomName + ")");
    var roomsList = document.getElementById("roomsList");
    for (var i = 0; i < roomsList.childNodes.length; i++) {
        var elementRoomCur = roomsList.childNodes[i];
        if (elementRoomCur.tagName == "DIV") {
            var roomCurName = getItemRoomName(elementRoomCur);
            if (roomCurName == roomName) {
                roomsList.removeChild(elementRoomCur);
                break;
            }
        }
    }
}
function createElRoomSignalR(room) {
    var elementRoom = document.createElement((typeof room.tagName == 'undefined') ? 'div' : room.tagName);
    elementRoom.className = "room";
    elementRoom.name = "itemRoom";
    elementRoom.roomName = room.RoomName;
    elementRoom.style.overflow = "auto";
    var usersCount;
    if (room.RoomName != g_chatRoom.RoomName) {
        if (typeof room.usersCount != 'undefined')
            usersCount = room.usersCount;
        else if (typeof room.RoomNameCount != 'undefined')//лень переименовывать RoomNameCount в usersCount
            usersCount = room.RoomNameCount;
    }
    var elUsersCount;
    if (typeof usersCount == 'undefined')
        elUsersCount = '';
    else elUsersCount = ': <span class="usersCount">' + usersCount + '</span>';
    return {
        elRoom: elementRoom
        , elUsersCount: elUsersCount
    }
}
function g_onUpdateRoom(room, strRoomNamePrev) {
    consoleLog('g_onUpdateRoom(...). room.RoomName: "' + room.RoomName + '" room.PrivateID = ' + room.PrivateID);

    var elRoomsList = document.getElementById("roomsList");
    if (!elRoomsList) {
        consoleError("This is IRC page");
        return;
    }

    if (room.PrivateID != null) {
        consoleLog("I do not want to add a private room in to rooms list");
        return;
    }

    //find current and prevoious rooms
    var elementRoom;
    var elementRoomPrev;
    elRoomsList.querySelectorAll('.room').forEach(function (elementRoomCur) {
        var roomCurName = getItemRoomName(elementRoomCur);
        if (roomCurName == room.RoomName)
            elementRoom = elementRoomCur;
        else if (roomCurName == strRoomNamePrev)
            elementRoomPrev = elementRoomCur;
    });
    if (elementRoom) {
        if (elementRoom.roomName != g_chatRoom.RoomName) {
            var className = 'usersCount';
            var elUsersCount = elementRoom.querySelector('.' + className);
            if (!elUsersCount) {
                elUsersCount = document.createElement('span');
                elUsersCount.innerHTML = ': ';
                elementRoom.appendChild(elUsersCount);

                elUsersCount = document.createElement('span');
                elUsersCount.className = className;
                elementRoom.appendChild(elUsersCount);
            }
            elUsersCount.innerHTML = room.usersCount;
        }
    } else {
        elementRoom = createElementRoom(room);
    }
    var elUsersCount = elementRoom.querySelector('.usersCount');
    if (elUsersCount && room.usersCount)
        elUsersCount.innerHTML = room.usersCount;
    if (elementRoomPrev)
        roomsList.insertBefore(elementRoom, elementRoomPrev);
    else roomsList.appendChild(elementRoom);
}

function selectItemRoom(itemRoom) {
    if (g_clicked_itemRoom != null)
        g_clicked_itemRoom.className = g_clicked_itemRoom.className.replace("clicked_streamer", "streamer");
    g_clicked_itemRoom = itemRoom;
    itemRoom.className = itemRoom.className.replace("streamer", "clicked_streamer");
}

function getItemRoomName(itemRoom) {
    return itemRoom.roomName;
/*
    var roomName = "";
    if (typeof itemRoom.childNodes[0].data == 'undefined')
        roomName = itemRoom.childNodes[1].innerHTML;
    else roomName = itemRoom.childNodes[0].data;//name fo current room
    if ((typeof roomName == 'undefined') || (roomName == ""))
        consoleError("getItemRoomName(itemRoom) faled! roomName is empty");
    return roomName;
*/
}

function getOrigin() {
    var origin = null;
    if (typeof window.location.origin != 'undefined')
        origin = window.location.origin;//for Edge
    else if ((typeof window.location.protocol != 'undefined') && (typeof window.location.hostname != 'undefined'))
        origin = window.location.protocol + "//" + window.location.hostname;//for IE 11
    if ((typeof origin == 'undefined') || (origin == null)) {
        ErrorMessage("getOrigin() failed! origin = " + origin);
        return "";
    }
    return origin;
}

function mapPosition(mapContainer) {
    var position = mapContainer.position;
/*отказался от google map потому что если окрыть чат из интнернета https://109.226.225.189/chat/ (не из локальной сети)  то требунтся ключь
    Google Maps API error: MissingKeyMapError https://developers.google.com/maps/documentation/javascript/error-messages#missing-key-map-error

    У меня уже есть ключи https://console.developers.google.com/apis/credentials?pli=1&project=api-project-950410576399
    
    После добавления ключа &key=AIzaSyDQFUsuKswj5mRw7YNZlnwpxQ3gCHU2JBU 
    получаю новую ошибку 
    Google Maps API error: ApiNotActivatedMapError https://developers.google.com/maps/documentation/javascript/error-messages#api-not-activated-map-error
    Этот ключь надо активировать нажав кнопку "АКТИВИРОВАТЬ БЕСПЛАТНЫЙ ПРОБНЫЙ ПЕРИОД" на странице 
    https://console.developers.google.com/apis/credentials?pli=1&project=api-project-950410576399
    я не активировал потому что думаю потом придется покупать
    
    //google map
    //http://webmap-blog.ru/examples/html5-geolocation-api/html5-geoloc-gmap.html
    loadScript("https://maps.google.com/maps/api/js?sensor=false&key=AIzaSyDEYZcjIGeiMYqmr453X7Mfh-ogNx0j9uc", function () {
        var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //https://developers.google.com/maps/documentation/javascript/controls?hl=ru
        var mapOptions = {
            zoom: 10,
            center: coords,
            mapTypeControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            mapTypeControl: false
        };

        map = new google.maps.Map(mapContainer, mapOptions);
        mapContainer.map = map;
        var marker = new google.maps.Marker({
            position: coords,
            map: map,
            title: lang.currentLocation//"My current location!"
        });

        // Add the circle.
        if (position.coords.accuracy && (position.coords.accuracy > 50)) {
            var cityCircle = new google.maps.Circle({
                strokeColor: '#0000FF',
                strokeOpacity: 0.35,
                strokeWeight: 1,
                fillColor: '#0000FF',
                fillOpacity: 0.1,
                map: map,
                center: coords,
                radius: position.coords.accuracy
            });
        }
    });
*/

    //yandex map
    //http://webmap-blog.ru/examples/html5-geolocation-api/html5-geoloc-ymap.html

    //https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/load-docpage/
    var language = isRussian() ? 'ru-RU' : 'en_US';

        loadScript("https://api-maps.yandex.ru/2.0/?load=package.full&lang=" + language, function () {//onload
            try{
                ymaps.ready(init);

                function init() {

                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;

                    var myMap = new ymaps.Map(mapContainer, {
                        center: [latitude, longitude],
                        zoom: 10
                    });

                    mapContainer.map = myMap;
            
                    //https://tech.yandex.ru/maps/doc/jsapi/2.0/dg/concepts/controls-docpage/
                    myMap.controls
                        .add('smallZoomControl')//zoomControl
                    //.add('typeSelector')
                    //.add('mapTools')
                    ;
            
                    //https://tech.yandex.ru/maps/doc/jsapi/1.x/ref/reference/placemark-docpage/
                    var myPlacemark = new ymaps.Placemark([latitude, longitude], {
                        // Содержимое хинта.
                        hintContent: lang.currentLocation//'My current location!'
                    }, {
                        preset: "twirl#redIcon"
                    });
                    //            myPlacemark.name = "Название";
                    //            myPlacemark.description = "Описание";

                    // Добавляем метку в коллекцию
                    myMap.geoObjects.add(myPlacemark);

                    if (position.coords.accuracy && (position.coords.accuracy > 50)) {
                        //https://tech.yandex.ru/maps/jsbox/2.1/circle
                        // Создаем круг.
                        var myCircle = new ymaps.Circle([
                            // Координаты центра круга.
                            [latitude, longitude],
                            // Радиус круга в метрах.
                            position.coords.accuracy
                        ], {
                            // Описываем свойства круга.
                            // Содержимое балуна.
                            //balloonContent: "Радиус круга - 10 км",
                            // Содержимое хинта.
                            hintContent: lang.circleHint.replace('%s', position.coords.accuracy)//The visitor can be anywhere in this circle with radius %s meters
                        }, {
                            // Задаем опции круга.
                            // Включаем возможность перетаскивания круга.
                            //draggable: true,
                            // Цвет заливки.
                            // Последний байт (77) определяет прозрачность.
                            // Прозрачность заливки также можно задать используя опцию "fillOpacity".
                            fillColor: "#0000FF",//"#DB709377"
                            fillOpacity: 0.1,
                            // Цвет обводки.
                            strokeColor: "#0000FF",
                            // Прозрачность обводки.
                            strokeOpacity: 0.35,
                            // Ширина обводки в пикселях.
                            strokeWidth: 1
                        });

                        // Добавляем круг на карту.
                        myMap.geoObjects.add(myCircle);
                    }
                }
            } catch (e) {
                consoleError(e.message);
                alert(lang.loadMapFailed + ' ' + e.message);//Load map failed!
                expandAdditionally();
            }
        }
        , function () {//onerror
            consoleError('loadScript: "' + this.src + '" failed');
            alert(lang.loadMapFailed);//Load map failed!
            expandAdditionally();
        });
}
function getWaitIconBase(papams) {
    if (typeof papams == 'undefined')
        papams = '';
    return '<img src="../img/Wait.gif" style="width: 20px; height:20px"' + papams + '>';
}
function getErrorTag(message) { return '<FONT style="color: red;">' + message + '</FONT>' }
