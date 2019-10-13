namespace MyCommon
{
    /// <summary>
    /// Этот код общий для обоих приложений IRCBot и BotStarter.
    /// </summary>
    public class BotStart : MyCommon.Query
    {
        /// <summary>
        /// request from BotStarter to start of IRCBot
        /// </summary>
        public const string strStart = "start";
        /// <summary>
        /// Response from IRCBot. IRCBot только что запустился и список IRC серверов еще не получен. 
        /// </summary>
        /// <remarks>
        /// Получаем список IRC серверов.
        /// Переодически вызываем эту функцию из BotStarter
        ///     Если список IRC серверов еще не получен, то снова возвращаем статус "get IRC servers"
        ///     Если список IRC серверов уже получен, то возвращаем статус "IRC servers". Далее смотри статус "IRC servers"
        /// </remarks>
        public const string strGetIRCservers = "get IRC servers";
        /// <summary>
        /// Response from IRCBot. Возвращает в BotStarter список доступных IRC серверов и их состояние.
        /// </summary>
        /// <remarks>
        ///    Если к IRC серверу подключен владелец канала и переодически подключаются и отключаются посетители Chaturbate, то ничего не делается.
        ///    Иначе подключается владелец канала или очередной посетитель Chaturbate. Восстанавливается переодическое обновление списка Chaturbate
        /// </remarks>
        public const string strIRCservers = "IRC servers";
        public const string strError = "ERROR";
        public static string getErrorTag(string strError) { return MyCommon.Query.getTag(BotStart.strError, strError, false); }
        /// <summary>
        /// User tag name
        /// </summary>
        public const string tagUser = "User";
        /// <summary>
        /// Response from IRCBot. Get User's tag
        /// </summary>
        /// <param name="strUser"></param>
        /// <returns>User tag</returns>
        public static string getUserTag(string strUser) { return MyCommon.Query.getTag(BotStart.tagUser, strUser, false); }
        /// <summary>
        /// IRCServer tag name
        /// </summary>
        public const string tagIRCserver = "IRCServer";
        /// <summary>
        /// Response from IRCBot. Get IRCServer tag
        /// </summary>
        /// <param name="strIRCServer"></param>
        /// <returns>IRCServer tag</returns>
        /// <remarks>
        /// тег, который описывает состояние IRC сервера и нахотится в списке доступных IRC серверов
        /// </remarks>
        public static string getIRCServerTag(string strIRCServer) { return MyCommon.Query.getTag(BotStart.tagIRCserver, strIRCServer); }
        /// <summary>
        /// URL tag name
        /// </summary>
        public const string tagURL = "URL";
        /// <summary>
        /// Response from IRCBot. Get URL tag
        /// </summary>
        /// <param name="URL"></param>
        /// <returns>URL tag</returns>
        public static string getURLTag(string URL) { return MyCommon.Query.getTag(BotStart.tagURL, URL, false); }
        /// <summary>
        /// IRCClient tag name
        /// </summary>
        public const string tagIRCClient = "IRCClient";
        /// <summary>
        /// Response from IRCBot. Get IRCClient tag
        /// </summary>
        /// <param name="IRCClient"></param>
        /// <returns>URL tag</returns>
        public static string getIRCClientTag(string IRCClient) { return MyCommon.Query.getTag(BotStart.tagIRCClient, IRCClient); }
    }
}
