/**
 * IRC ChanServ functions. https://en.wikipedia.org/wiki/IRC_services#ChanServ
 * http://wiki.foonetic.net/wiki/ChanServ_Commands
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
 *  2017-12-22, :  
 *       + init.
 *
 */

//replace of IRC.CS from IRC.js
g_IRC.CS = {
    getElCS: function (event) { return getElementFromEvent(event).parentElement; },
    onclick: function (event) {
        consoleLog('IRC.CS.onclick2');
        var elCS = this.getElCS(event);
        if (!elCS.classList.contains('CSAssistant'))
            elCS = document.getElementById('CSAssistant');//event from menuUsers
        onbranchelement(elCS);
        if (elCS.classList.contains('expanded'))
            g_IRC.CS.enumJoinedChannels(elCS.querySelector(".CSChannel"));
    },
    getPass: function (elCS) {
        var elPass = elCS.querySelector('.CSPass');
        var pass = elPass.value;
        if (pass == '') {
            inputKeyFilter.TextAdd(lang.typePassword//'Type password please'
                , elPass, "downarrowdivred");
            elPass.focus();
        }
        return pass;
    },
    getDescription: function (elCS, noFilter) {
        var elDescription = elCS.querySelector('.CSRegisterDescription');
        var description = elDescription.value;
        if (!noFilter && description == '') {
            inputKeyFilter.TextAdd(lang.IRC.CS.typeDescription//'Type description'
                , elDescription, "downarrowdivred");
            elDescription.focus();
        }
        return description;
    },
    getChannel: function (elCS) {
        var elChannel = elCS.querySelector('.CSChannel'),
            channel = elChannel.value;
        if (channel == '') {
            inputKeyFilter.TextAdd(lang.typeChannelName//'Type channel name please'//lang.IRC.CS.selectChannel//Select joined channel
                , elChannel, "downarrowdivred");
//            elChannel.focus();
            return null;
        }
        return channel;
/*
        if (elChannel.selectedIndex == -1) {
            inputKeyFilter.TextAdd(lang.IRC.CS.selectChannel//Select joined channel
                , elChannel, "downarrowdivred");
//            elChannel.focus();
            return null;
        }
        return elChannel[elChannel.selectedIndex].value;
*/
    },
    onclickRegister: function (event) {
        consoleLog('IRC.CS.onclickRegister()');
        var elCS = this.getElCS(event);

        var channel = this.getChannel(elCS);
        if(channel == null) return;

        var pass = '', description = '', register, params = '';
        if (this.arCommandParams) {
            register = this.arCommandParams.register;
            if (register != undefined) {
                if (register.unknownParams == undefined) {
                    for (i = 0; i < register.length; i++) {
                        switch (register[i]) {
                            case "password"://irc.dal.net
                                pass = this.getPass(elCS);
                                if (pass == '') return;

                                var elCSPass2 = elCS.querySelector('.CSPass2');
                                var pass2 = elCSPass2.value;
                                if (pass2 == '') {
                                    inputKeyFilter.TextAdd(lang.typePassword//'Type password please'
                                        , elCSPass2, "downarrowdivred");
                                    elCSPass2.focus();
                                    return;
                                }
                                if (pass2 != pass) {
                                    alert(lang.passNotMatch);//Your new password entries did not match.
                                    elCSPass2.focus();
                                    return;
                                }
                                break;
                            case "description"://irc.dal.net
                                description = this.getDescription(elCS);
                                if (description == '') return;
                                break;
                        }
                    }

                    //http://wiki.foonetic.net/wiki/ChanServ_Commands#Registering_a_Channel
                    params = this.commandParams(register, elCS);
                } else {
                    var registerParams = elCS.querySelector('.CSRegisterParams').value;
                    params = ' ' + channel + (registerParams == '' ? '' : ' ' + registerParams);
                }
            }
        }
        if (params == '') params = ' ' + channel + (pass == '' ? '' : ' ' + pass) + (description == '' ? '' : ' ' + description);
        this.command("REGISTER" + params);
    },
    onclickDrop: function (event) {
        consoleLog('IRC.CS.onclickDrop()');
        var elCS = this.getElCS(event);

        var params = '', unregister, command = "DROP";
        if (this.arCommandParams) {
            unregister = this.arCommandParams.unregister;
            if (unregister != undefined) {
                for (i = 0; i < unregister.length; i++) {
                    switch (unregister[i]) {
                        case "#channel"://irc.gamesurge.net
                            var channel = this.getChannel(elCS);
                            if (channel == null) return;
                            break;
                    }
                }
                params = this.commandParams(unregister, elCS);
                command = 'UNREGISTER';
            }
            var drop = this.arCommandParams.drop;
            if (drop != undefined) {
                if (unregister != undefined) consoleError('unregister: ' + unregister);
                for (i = 0; i < drop.length; i++) {
                    switch (drop[i]) {
                        case "channel"://irc.2600.net
                            var channel = this.getChannel(elCS);
                            if (channel == null) return;
                            break;
                    }
                }
                params = this.commandParams(drop, elCS);
            }
        }
        if (params == '') {
            var channel = this.getChannel(elCS);
            if (channel == null) return;
            params = ' ' + channel;
        }
        this.command(command + params);
    },
/*
    enumJoinedChannels: function (elSelectChannel) {
        elSelectChannel.options.length = 0;

        var elIRCJoinedChannels = document.getElementById('IRCJoinedChannels'),
            IRCChannels = IRCJoinedChannels.querySelectorAll('.IRCRoom'),
            firstOption = true;
        IRCChannels.forEach(function (elIRCChannel) {
            var channel = elIRCChannel.querySelector('.treeView').params.channel;
            elSelectChannel.options[elSelectChannel.options.length] = new Option(channel);
            if (firstOption) {
                elSelectChannel.nextElementSibling.value = channel;
                firstOption = false;
            }
        });
    },
*/
    enumJoinedChannels: function (elSelectChannel) {
        elSelectChannel = elSelectChannel.nextElementSibling;
        elSelectChannel.innerHTML = '';

        var elIRCJoinedChannels = document.getElementById('IRCJoinedChannels').value,
            IRCChannels = IRCJoinedChannels.querySelectorAll('.IRCRoom');
        IRCChannels.forEach(function (elIRCChannel) {
            var option = document.createElement('option');
            option.value = elIRCChannel.querySelector('.treeView').params.channel;
            elSelectChannel.appendChild(option);
        });
    },
    onfocusChannel: function (event) {
        consoleLog('onfocusChannel()');
        var elSelectChannel = getElementFromEvent(event);
        this.enumJoinedChannels(elSelectChannel);
/*
        if (elSelectChannel.nextElementSibling.options.length == 0) {
            elSelectChannel.blur();
            alert(lang.IRC.CS.joinChannel);//First join a channel
        }
*/
    },
    onchangeChannel: function (event) {
        consoleLog('onchangeChannel()');
        var elCSChannel = getElementFromEvent(event);
        elCSChannel.nextElementSibling.value = elCSChannel.value;
    },
    command: function (command) { g_IRC.Command('ChanServ ' + command); },
    init: function () {
        var elCS = document.createElement('div');
        elCS.id = 'CSAssistant';
        elCS.className = 'CSAssistant gradient_gray b-toggle expanded';
        //<div id="NSRegistering" class="gradient_gray b-toggle">
        elCS.innerHTML = getSynchronousResponse('Scripts/IRC/CS/CS.html');
        loadScript("Scripts/IRC/CS/lang/" + getLanguageCode() + ".js", function () {
            g_IRC.CS.enumJoinedChannels(elCS.querySelector(".CSChannel"));
            elCS.querySelector(".CSClose").title = lang.close;//Close
            elCS.querySelector(".CSHeader").innerHTML = '⚿ ' + lang.IRC.CSAssistant;//'ChanServ Assistant'
            elCS.querySelector(".CSDescription").innerHTML = lang.IRC.CS.description;//'When you register a channel with ChanServ, you don't need to worry about takeovers, or bots to keep a list of Ops. ChanServ does all of this and more. The founder is the person who does the registering.'
            elCS.querySelector(".IRCChannelNameLabel").innerHTML = lang.channelName + ': ';//Channel Name//lang.IRC.CS.joinedChannel + ': ';//Joined channel
            elCS.querySelector(".CSPassLabel").innerHTML = lang.IRC.CS.password + ': ';//'Make up a password to register with. The password is used so that only the founder can completely control the channel.'
            elCS.querySelector(".CSRegister").value = lang.NSRegister;//'Register'

            var elCSDrop = elCS.querySelector(".CSDrop");
            elCSDrop.value = lang.IRC.CS.drop;//'Drop'
            elCSDrop.title = lang.IRC.CS.dropTitle;//'This command is used when you no longer want ChanServ to manage a channel.'

            elCS.querySelector(".CSPassLabel2").innerHTML = lang.passwordRe + ': ';//'Retype Password'
            elCS.querySelector(".CSRegisterDescriptionLabel").innerHTML = lang.IRC.CS.registerDescription + ': ';//'Description. The description is only used when a user asks ChanServ for information on a channel.'
            document.getElementById("IRC").appendChild(elCS); 
            if (elCS.IRC == undefined) elCS.IRC = {};
            if (elCS.IRC.cs == undefined) {
                g_IRC.help = 'cs';
                elCS.IRC.cs = {};
                g_IRC.CS.command('help REGISTER');
                g_IRC.CS.command('help UNREGISTER');
                g_IRC.CS.command('help DROP');
//                g_IRC.CS.command('help ATTACH');do not support in irc.webmaster.com
            }
            elCS.scrollIntoView();
        });
    },
    syntax: function (syntax) {
        if (this.arCommandParams == undefined) this.arCommandParams = {};
        if (!g_IRC.syntax(syntax, this.arCommandParams))
            return;
        var arCSAssistants = document.querySelectorAll('.CSAssistant');
        if (this.arCommandParams.register) {
            var arCommandParams = this.arCommandParams;//, unknownParam = false;
            if (arCSAssistants.length > 1) consoleError('arCSAssistants.length = ' + arCSAssistants.length);
            for (i = 0; i < arCSAssistants.length; i++) {
                var elCS = arCSAssistants[i];
                this.arCommandParams.register.forEach(function (param) {
                    if ((typeof param == "object") && (param.name == "optional")) {//Optional parameters. Connect to irc.gamesurge.net for testing
                        param.forEach(function (item) {
                            switch (item) {
                                case "force"://irc.gamesurge.net
                                    elCS.querySelector(".CSRegisterDescriptionLabel").innerHTML = lang.IRC.CS.force + ': ';//Force. It will allow a do-not-register channel to be registered anyway.
                                case "description"://irc.2600.net
                                    elCS.querySelector('.CSRegisterDescriptionBlock').style.display = "block";
                                    break;
                            }
                        });
                    } else {
                        switch (param) {
                            case "password"://irc.dal.net
                                elCS.querySelector('.CSPassBlock').style.display = "block";
                                break;
                            case "description"://irc.dal.net
                                elCS.querySelector('.CSRegisterDescriptionBlock').style.display = "block";
                                break;
                            case "channel"://irc.dal.net
                            case "#channel"://irc.freenode.net
                            case "room"://irc.webmaster.com
                            case " ": break;
                            default://irc.data.lt параметры на литовском языке
                                consoleError('param: ' + param);
//                                unknownParam = true;
//                                g_IRC.Reply(getErrorTag(lang.IRC.CS.unknownParam + ': ' + param));//'Unknown param'
                                if (arCommandParams.register.unknownParams == undefined)
                                    arCommandParams.register.unknownParams = '';
                                arCommandParams.register.unknownParams += ' ' + param;
                        }
                    }
                });
            }
            if (arCommandParams.register.unknownParams) {
                elCS.querySelector('.CSRegisterParamsBlock').style.display = "block";
                elCS.querySelector('.CSRegisterParamsLabel').innerHTML =
                    lang.IRC.CS.unknownParamsLabel.replace('%p', arCommandParams.register.unknownParams).replace('%c', g_IRC.mircToHtml(syntax)) + ': ';//Unknown params "%p" has been detected in the "%c" command. Please type params manually
/*
                elCS.querySelector('.CSPassBlock').style.display = "block";
                elCS.querySelector('.CSRegisterDescriptionBlock').style.display = "block";
*/
            }
        }
        if (this.arCommandParams.unregister) {
            arCSAssistants.forEach(function (elCS) {
                var elCSDrop = elCS.querySelector('.CSDrop');
                if (elCSDrop.value != lang.IRC.unregister)
                    elCSDrop.value = lang.IRC.unregister;//Unregister
            });
        }
    },
    commandParams: function (array, elCS) {
        if (array == undefined) {
            consoleError('array: ' + array);
            return '';
        }
        var command = '';
        for (i = 0; i < array.length; i++) {
            switch (array[i]) {
                case "channel"://irc.dal.net
                case "#channel"://irc.freenode.net
                case "room"://irc.webmaster.com
                    var channel = this.getChannel(elCS);
                    if (channel == null) return '';
                    command += ' ' + channel;
                    break;
                case "password"://irc.dal.net
                    var pass = this.getPass(elCS);
                    if (pass == '') return '';
                    command += ' ' + pass;
                    break;
                case "description"://irc.dal.net
                    var description = this.getDescription(elCS);
                    if (description == '') return;
                    command += ' ' + description;
                    break;
                case " ": break;//irc.swiftirc.net
                default:
                    if (typeof array[i] == "object") {
                        //Optional parameters
                        //Open irc.gamesurge.net for testing
                        array[i].forEach(function (item) {
                            switch (item) {
                                case "user|*account"://irc.gamesurge.net
                                    command += ' ' + g_user.nickname;
                                    break;
                                case "force"://irc.gamesurge.net
                                case "description"://irc.2600.net
                                    var description = g_IRC.CS.getDescription(elCS, true);
                                    if (description != '')
                                        command += ' ' + description;
                                    break;
                            }
                        });
                        break;
                    }
                    consoleError('array[i] = ' + array[i]); return '';
            }
        }
        return command;
    },
}
g_IRC.CS.init();