/**
 * Contains the dictionary of language entries.
 */
lang.IRC = 'IRC';
    lang.IRCPortError = 'Invalid IRC server port';
lang.IRCConnectFailed = 'IRC server error:';
lang.IRCCommands = 'IRC commands';
lang.IRCCommand = 'Type an IRC command';
lang.IRCDisconnect = 'Disconnect from IRC server';
lang.IRCChannels = 'Joined Channels';
lang.IRCChannelsTitle = 'List of channels you have joined';
lang.IRCChannelOwner = 'If you is channel owner or joining to a new channel, you can';
 lang.IRCChannelKey = 'Channel key';
lang.IRCСhannelKeyTitle = 'Set a channel key for your channel, and only those people who have the key will be able to join the channel';
 lang.IRCUser = 'User';
lang.IRCNickTraces = 'Nick traces';
lang.IRCquit = 'has quit IRC';
lang.IRCInvalidServerId = 'Invalid IRCServer ';
//lang.IRCJoinedBefore = 'Вы присоединились к этому каналу раньше';
lang.IRCsendCommand = 'Send the command to the server';
lang.IRCtypeCommand = 'Type a command first';
lang.IRCChannelOperator = 'Channel operator';
lang.IRCOp = 'Is operator.';
lang.IRCRegNick = 'Registered nickname.';
lang.IRCOpTitle = 'User is a network operator.';
lang.IRCSecondsIdle = 'Seconds Idle';
lang.IRCSecondsIdleTitle = 'Seconds since this user last interacted with IRC';
lang.NSLoggedInAs = 'Account';
lang.NSLoggedInAsTitle = 'The nickserv account this user is logged into';
 lang.NSRegistering = 'Registering';
lang.NSRegisteringTitle = 'Registering your nickname in Nickserv.';
lang.NSEmail = 'An email containing an authentication code will be sent to the specified email address';
lang.NSRegister = 'Register';
lang.NSDrop = 'Drop Nickname';
lang.NSIdentify = 'Identify';
lang.NSIdentifyTitle = 'In order to use a registered nickname, and before you can perform any ChanServ functions, you will be required to identify yourself with NickServ.';
lang.NSSendPass = 'Password Recovery';
lang.NSSendPassTitle = 'If you forgot your password you may use this button to have a key sent to the email address corresponding to the specified nickname, that can be used to set a new password.';
lang.IRC = {
    openChaanelPage: 'Open %s chaanel page',
    unregister: 'Unregister',
    map: 'Map',
    NSCommands: 'Nickserv Assistant',
    CSAssistant: 'ChanServ Assistant',
    mode: 'Modes',
    modes: {
        i: "Makes you so called 'invisible'. A confusing term to mean that you're just hidden from /WHO and /NAMES if queried by someone outside the channel. Normally set by default through set::modes-on-connect (and otherwise by the users' IRC client).",
        r: 'Indicates this is a "registered nick".',
        x: 'Gives you a hidden / cloaked hostname.',
    }
};