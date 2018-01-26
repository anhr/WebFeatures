/**
 * IRC server https://en.wikipedia.org/wiki/Internet_Relay_Chat
 * Common functions for SignalR  and IRC server
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
 *  2017-4-7, : 
 *       + init.
 *
 */

function SignalRorIRCServerInit() {
    //Invitations
    var invitationsHeader = document.getElementById("invitationsHeader");
    invitationsHeader.title = lang.queriesTitle;//The list of queries to you from visitors of the chat
    invitationsHeader.innerHTML = lang.queries;//Queries
    document.getElementById("noInvitations").innerHTML = lang.noInvitations;//"No invitations"
}
SignalRorIRCServerInit();
function invitationsCount() {
    var invitationsCount = document.getElementById('informerInvitations').querySelectorAll(".invitation").length + document.getElementsByName("waitPermission").length;
    document.getElementById("invitationsCount").innerHTML = invitationsCount;
    return invitationsCount;
}
function removeInvitations() {
    if (invitationsCount() == 0) {
        document.getElementById("invitations").style.display = "none";
    }
}
