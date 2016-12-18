//delete_cookie("browserID");
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
    , query: function () {
        var queryString = new QueryString();
        var browserID = queryString.value('browserID');
        if (typeof browserID != 'undefined') {
            this.browserID = browserID;
            return;
        }
        var JSONuser;
        if (navigator.cookieEnabled)
            JSONuser = get_cookie("User");
        else JSONuser = queryString.value('user');
        if (typeof JSONuser == 'undefined') {
            consoleError('g_user.query() failed!');
/*
            var browserID = queryString.value('browserID');
            if (typeof browserID == 'undefined') {
                consoleError('g_user.query() failed!');
                return;
            }
            this.browserID = browserID;
*/
            return;
        }
        this.updateProfile(JSON.parse(JSONuser));
    }
    , nickname: ""
    , browserID: ""
}

var g_chatRoom = {
    RoomName: ""
    , PrivateID: ""
    , privateUserId: ""
    , privateRoomName: ""
}

function gotoChatPage() {
    var location = "../chat";
    if (g_user.nickname || g_user.browserID || g_user.id || g_chatRoom.RoomName)
        location += "?user=" + JSON.stringify(g_user);;
/*
    if (g_user.browserID)
        location += "browserID=" + g_user.browserID;
    else if (g_user.id)
        location += "userId=" + g_user.id;
    else if (g_user.nickname)
        location += "Nickname=" + encodeURIComponent(g_user.nickname);
*/
    if (g_chatRoom.RoomName) {
        if (g_user.nickname)
            location += "&";
        location += 'chatRoom=' + encodeURIComponent(g_chatRoom.RoomName);
    }
    window.location = location;
    //            window.location = "../chat?Nickname=" + encodeURIComponent(g_user.nickname) + '&chatRoom=' + encodeURIComponent(g_chatRoom);
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

function g_onUpdateRoom(room, strRoomNamePrev) {
    consoleLog('g_onUpdateRoom(...). room.RoomName: "' + room.RoomName + '" room.PrivateID = ' + room.PrivateID);

    if (room.PrivateID != null) {
        consoleLog("I do not want to add a private room in to rooms list");
        return;
    }

    //find current and prevoious rooms
    var elementRoom;
    var elementRoomPrev;
    var roomsList = document.getElementById("roomsList");
    for (var i = 0; i < roomsList.childNodes.length; i++) {
        var elementRoomCur = roomsList.childNodes[i];
        if (elementRoomCur.tagName == "DIV") {
            var roomCurName = getItemRoomName(elementRoomCur);
            if (roomCurName == room.RoomName)
                elementRoom = elementRoomCur;
            else if (roomCurName == strRoomNamePrev)
                elementRoomPrev = elementRoomCur;
        }
    }
/*
    if ((strRoomNamePrev != "") && (elementRoomPrev == null))
        consoleError('g_onUpdateRoom(room, "' + strRoomNamePrev + '") failed! elementRoomPrev == null');
*/
    if (elementRoom) {
        var index = 1;//index of count of users in the room
        if (elementRoom.childNodes[1].className == "pointer")
            index = 2;
        elementRoom.childNodes[index].innerHTML = room.usersCount;
    } else {
        //<div name="itemRoom" class="streamer" style="overflow:auto;" onclick="javascript: onclickItemRoom(this)">Chat<span style="float: right">1</span></div>
        //also see asp:ListView in SignalRChat\Default.aspx and Chat\Default.aspx
        elementRoom = document.createElement('div');
        elementRoom.name = "itemRoom";
        elementRoom.style.overflow = "auto";
        elementRoom.innerHTML = room.RoomName + '<span style="float: right">' + room.usersCount + '</span>';
        createElementRoom(elementRoom, room);
    }
    if (elementRoomPrev)
        roomsList.insertBefore(elementRoom, elementRoomPrev);
    else roomsList.appendChild(elementRoom);
}

function selectItemRoom(itemRoom) {
    if (g_clicked_itemRoom != null)
        g_clicked_itemRoom.className = 'streamer';
    g_clicked_itemRoom = itemRoom;
    itemRoom.className = "clicked_streamer";
}

function getItemRoomName(itemRoom) {
    var roomName = "";
    if (typeof itemRoom.childNodes[0].data == 'undefined')
        roomName = itemRoom.childNodes[1].innerHTML;
    else roomName = itemRoom.childNodes[0].data;//name fo current room
    if ((typeof roomName == 'undefined') || (roomName == ""))
        consoleError("getItemRoomName(itemRoom) faled! roomName is empty");
    return roomName;
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