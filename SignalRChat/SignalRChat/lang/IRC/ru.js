/**
 * Contains the dictionary of language entries.
 */
lang.IRC = 'IRC';
lang.IRCPortError = 'Недопустимый порт сервера IRC';
lang.IRCConnectFailed = 'Ошибка IRC сервера:';
lang.IRCCommands = 'IRC команды';
lang.IRCCommand = 'Введите команду IRC';
lang.IRCDisconnect = 'Отключиться от IRC сервера';
lang.IRCChannels = 'Присоединенные каналы';
lang.IRCChannelsTitle = 'Список каналов, к которым пользователь присоединился';
lang.IRCChannelOwner = 'Если вы являетесь владельцем канала или создаете новый канал, вы можете';
lang.IRCChannelKey = 'Ключ канала';
lang.IRCСhannelKeyTitle = 'Установить ключ для своего канала, и только те люди, у которых есть этот ключ, смогут присоединиться к каналу';
lang.IRCUser = 'Пользователь';
lang.IRCNickTraces = 'Трассировка';
lang.IRCquit = 'покинул IRC';
lang.IRCInvalidServerId = 'Неизвестный IRCServer ';
lang.IRCJoinedBefore = 'Вы присоединились к этому каналу раньше';
lang.IRCsendCommand = 'Отправьте команду на сервер'//'Send the command to the server';
lang.IRCtypeCommand = 'Введите команду';
lang.IRCChannelOperator = 'Оператор канала';
lang.IRCOp = 'Оператор сети.';
lang.IRCRegNick = 'Зарегистрированный псевдоним.';
lang.IRCOpTitle = 'Этот пользователь оператор сети.';
lang.IRCSecondsIdle = 'Время простоя';
lang.IRCSecondsIdleTitle = 'Время, когда этот пользователь в последний раз взаимодействовал с IRC сервером';
lang.NSLoggedInAs = 'Учетная запись';
lang.NSLoggedInAsTitle = 'Учетная запись nickserv, в который зарегистрирован этот пользователь';
lang.NSRegistering = 'Регистрация';
lang.NSRegisteringTitle = 'Регистрация Вашего ника в Nickserv.';
lang.NSEmail = 'На указанный адрес электронной почты будет отправлено письмо, содержащее код аутентификации';
lang.NSRegister = 'Регистрация';
lang.NSDrop = 'Отменить регистрацию';
lang.NSIdentify = 'Идентифицировать';
lang.NSIdentifyTitle = 'Чтобы использовать зарегистрированный псевдоним и прежде чем вы сможете выполнять любые функции ChanServ, вам необходимо будет идентифицировать себя с NickServ.';
lang.NSSendPass = 'Восстановление пароля';
lang.NSSendPassTitle = 'Если вы забыли свой пароль, вы можете использовать эту кнопку для отправки ключа на адрес электронной почты, соответствующий указанному псевдониму, который можно использовать для установки нового пароля.';
lang.IRC = {
    openChaanelPage: 'Открыть страницу %s канала',
    unregister: 'Отменить регистрацию',
    map: 'Карта',
    NSCommands: 'Помощник Nickserv',
    CSAssistant: 'Помощник ChanServ',
    mode: 'Режимы',
    modes: {
        i: "Делает вас так называемым «невидимым». Сбивающий с толку термин означает, что вы просто скрыты от / WHO и / NAMES, если его спрашивает кто-то за пределами канала. Обычно устанавливается по умолчанию с помощью set :: modes-on-connect (и, иначе, IRC-клиента пользователей).",
        r: 'Указывает, что это «зарегистрированный ник».',
        x: 'Дает вам скрытое / замаскированное имя хоста.',
    }
};