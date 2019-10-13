/**
 * EventLog
 * Windows Event Viewer API
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
 *  2018-09-08, :  
 *       + init.
 *
 */

var myEventLog = {
    //Вывести на веб страницу все события из Windows Event Viewer
    onclickEventLog: function () {
        consoleLog('myEventLog.onclickEventLog()');
        $.connection.chatHub.server.eventLog();

        //init
        this.elEventLog = document.querySelector('#eventLog');

        this.elEventLogList = this.elEventLog.querySelector('#list');
        this.elEventLogList.innerHTML = '';

        this.elEventLogWait = this.elEventLog.querySelector('#wait');
        this.elEventLogWait.innerHTML = getWaitIconBase();
    },
    //Вывести на веб страницу событиe из Windows Event Viewer
    onEventLogEntry: function (eventLogEntry) {
        var el = document.createElement('div'),
            text = eventLogEntry.TimeWritten + ' ' + eventLogEntry.Description.replace('<', '&lt;').replace('>', '&gt;');
        this.elEventLogWait.innerHTML = '';

        switch (eventLogEntry.EntryType) {
            case 1://error
                el.innerHTML = '<font style="COLOR: red;">Error: ' + text + '</font>';
                break;
            case 2://Warning версию IRC клиента я вывожу сюда что бы выделить ее цветом из общего списка
                //потому что лог засоряется спамом, который постоянно выводится в каналы разных IRC серверов
                //и маскирует реальных посетителей, которые вошли на мой канал.
                //Спам не возвращет версию IRC клиента. Если я цветом выделю версию, то легко можно будет отличить реального посетителя от спама
                el.innerHTML = '<font style="background-color:yellow;">Warning: ' + text + '</font>';
                break;
            case 4://information
                el.innerHTML = text;
                break;
            default: consoleError('eventLogEntry.EntryType = ' + eventLogEntry.EntryType);
        }
        this.elEventLogList.appendChild(el);
        //        consoleLog('chat.client.onEventLogEntry');
    },
    //Удалить все записи из Windows Event Viewer
    onclickDelete: function () {
        $.connection.chatHub.server.eventLogDelete();
    },
}
