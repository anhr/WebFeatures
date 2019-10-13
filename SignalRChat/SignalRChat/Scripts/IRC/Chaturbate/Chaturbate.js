/**
 * IRC users from https://chaturbate.com/ site
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
 *  2018-01-9, :  
 *       + init.
 *
 */

var g_chaturbate = {
    genderImg: function (gender) {
        switch (gender) {
            case "feamale": return '👩';
            case "male": return '👨';
            case "pair": return '🚻';
            case "trans": break; '⚥';
            default: consoleError('gender: ' + gender);
        }
        return '';
    },
    genderName: function (gender) {
        switch (gender) {
            case "feamale": return lang.IRC.Chaturbate.gender.feamale;
            case "male": return lang.IRC.Chaturbate.gender.male;
            case "pair": return lang.IRC.Chaturbate.gender.pair;
            case "trans": break; lang.IRC.Chaturbate.gender.trans;
            default: consoleError('gender: ' + gender);
        }
        return '';
    },
    details: function (el, user, size) {

        //Если просто приравнивать без проверки то непонятно по какой причине не могу получить количество прсоединенных к IRC серверу посетителей с сайта https://chaturbate.com/
        // connectionsLocal в function displayConnections
        // и поэтому в логах вижу ошибку 'connectionsLocal ' + connectionsLocal + ' != connections ' + connections
        // потому что elUser.user.connected = false - откуда это берется непонятно
        // Так же для одного посетителя непонятно почему появляется несколько вложенных элементов с пареметром el.user
        if (el.user == undefined) el.user = user;
        el.user.cams = user.cams;

        //for debugging
        var elViewers = el.querySelector('#viewers');
        if (elViewers != null)
            elViewers.innerHTML = user.cams.viewers;

        var elImg = el.querySelector('#img');
        if (elImg == null)
            return;//ветка с деталями пользователя еще не открыта 

        elImg.src = user.img;
        elImg.title = lang.IRC.Chaturbate.imgTitle;//"click to play video",
        elImg.style.width = size == undefined ? '100%' : size.width + 'px';
        el.querySelector('#subject').innerHTML = user.subject;
        el.querySelector('#location').innerHTML = lang.IRC.Chaturbate.location + ': ' + user.location;//Location
        el.querySelector('#cams').innerHTML = '📹 ' + user.cams.mins + ' ' + lang.IRC.Chaturbate.mins//mins
            + '., ' + user.cams.viewers + ' ' + lang.IRC.Chaturbate.viewers;//viewers
    },
    userDlg: function (el, user, size) {

        //video play/stop
        var elStop = el.querySelector('#stop'),
            elXmovie = el.querySelector('object#xmovie'),
            elImg = el.querySelector('#img');
        elImg.onclick = function (event) {
            consoleLog('#img onclick');
            elXmovie.style.display = 'block';
            elImg.style.display = 'none';
            elStop.style.display = 'block';
        }
        elStop.onclick = function (event) {
            consoleLog('#pause onclick');
            elXmovie.style.display = 'none';
            elImg.style.display = 'block';
            elStop.style.display = 'none';
        }

        //video
        if (size == undefined)
            size = {
                //                video: { width: 0, height: 0 },
                //                img: { width: 0 },
            }
        if (size.video == undefined) size.video = { width: 400, height: 300 };
        /*
        //это ограничение накладыватся сайтом https://chaturbate.com/
        if (size.video.width < 400) size.video.width = 400;
        if (size.video.height < 300) size.video.height = 300;
        */
        elXmovie.style.width = size.video.width == undefined ? '100%' : size.video.width + 'px';
        elXmovie.style.height = size.video.height + 'px';
        var elParamFlashVars = elXmovie.querySelector('param[name="FlashVars"]');
        var nick = this.href2Nick(user.href);
        var value = elParamFlashVars.value.replace('pid=', 'pid=' + nick);
        value = value.replace('nick', nick);
        value = value.replace('language=', 'language=/xml/' + getLanguageCode() + '/viewer.xml');
        elParamFlashVars.value = value;

        g_chaturbate.details(el, user, size.img);

        el.querySelector('#detailsBranch').appendChild(myTreeView.createBranch({
            name: lang.IRC.Chaturbate.details,//Details
            params: {
                animate: true,
                createBranch: function () { return el.querySelector('#details'); }
            }
        }));

        /*
                var expanded = 'expanded',
                    elDetails = el.parentElement.querySelector('#details');
                el.parentElement.onmouseover = function () { if (!elDetails.classList.contains(expanded)) elDetails.classList.toggle(expanded); }
                el.parentElement.onmouseout = function () { if (elDetails.classList.contains(expanded)) elDetails.classList.toggle(expanded); }
        */
    },
    href2Nick: function (href) { return href.split('/').join(''); },

    //append into elIRCuser a chaturbateUser properties - посетитель elIRCuser из сайта chaturbate. На веб странице ему надо добавить дополнительные элементы 
    appendChaturbate: function (elIRCuser, chaturbateUser, path) {
        if (path == undefined) path = '';
        user = getUserElUser(elIRCuser);
        user.chaturbate = chaturbateUser;
        elIRCuser.querySelector('.treeView').params.branch.tree.unshift({
            file: path + 'Scripts/IRC/Chaturbate/ChaturbateUser.html',
            callback: function (el) {
                g_chaturbate.userDlg(el, chaturbateUser, {
                    video: {
                        //width: el.clientWidth,
                        height: parseInt((el.clientWidth / 4) * 3)
                    },
                    //img: { width: el.clientWidth },
                });
                                                
                //передвинуть все следующие элементы в дочение чтобы их было не видно до тех пор пока пользователь
                //  не наведет мышку на картинку 
                elDetails = el.parentElement.querySelector('#details');
                while (el.nextElementSibling) elDetails.appendChild(el.nextElementSibling);
            },
        });

        //параметры chaturbate надо вставить перед елементом .name что бы правильно сортитоались посетители канала
        var chaturbatePrefix = 'chaturbatePrefix';
        if (elIRCuser.querySelector('#' + chaturbatePrefix) != null) return;
        var el = document.createElement('span');
        el.id = chaturbatePrefix;
        el.innerHTML =
            '<span title="' + g_chaturbate.genderName(chaturbateUser.gender) + '">'
                + g_chaturbate.genderImg(chaturbateUser.gender) + '</span>' +
            ' <span title="' + lang.IRC.Chaturbate.age + '">' + chaturbateUser.age + ' </span>';
        elIRCuser.querySelector('.treeView').insertBefore(el, elIRCuser.querySelector('.name'));

/*неправильно сортируются потому что элемент .name насинается с картинки gender потом возраст
        elIRCuser.querySelector('.name').querySelector('span').innerHTML =
            '<span title="' + g_chaturbate.genderName(chaturbateUser.gender) + '">'
                + g_chaturbate.genderImg(chaturbateUser.gender) + '</span>' +
            ' <span title="' + lang.IRC.Chaturbate.age + '">' + chaturbateUser.age + '</span>' +
            ' ' + user.IRCuser.Nick;
*/
    },

    //Query to IRCBot appliacion for responceing list of chaturbate users from site or one user from chaturbate site
    //userNick: 
    //  nick of the one user from chaturbate siteundefine
    //  undefined if you want a list of chaturbate users
    chaturbateResponse: function (url, userNick)
    {
        var request = new myRequest();
        request.url = url;
        request.XMLHttpRequestStart(function () {//onreadystatechange
            request.ProcessReqChange(function (myRequest) {//processStatus200
                if (myRequest.processStatus200Error()) return;
                if (myRequest.req.responseText == '') return;//current user is not from chaturbate site
                loadScript('Scripts/IRC/Chaturbate/lang/' + getLanguageCode() + '.js', function () {
                    var chaturbateObject = JSON.parse(myRequest.req.responseText);
                    function appendChaturbate(chaturbateUser) {
                        var nick = userNick == undefined ? g_chaturbate.href2Nick(chaturbateUser.href) : userNick,
                            IRCusers = document.getElementById('users').querySelectorAll('.IRCuser');
                        for (var i = 0; i < IRCusers.length; i++) {
                            var elIRCuser = IRCusers[i],
                                user = getUserElUser(elIRCuser);
                            if (user.nickname == nick) {
                                g_chaturbate.appendChaturbate(elIRCuser, chaturbateUser);
                                break;
                            }
                        }
                    }
                    if (Array.isArray(chaturbateObject)) chaturbateObject.forEach(function (chaturbateUser) { appendChaturbate(chaturbateUser); });
                    else appendChaturbate(chaturbateObject);
                });
            });
        });
    },
}
