using System;
namespace MyCommon
{
    /// <summary>
    /// Этот код общий для приложений SignalRChat, IRCBot и BotStarter.
    /// </summary>
    public class Query
    {
        /// <summary>
        /// тэг перевода строки и возврата каретки
        /// </summary>
        public const string tagNL = "NL";
        /// <summary>
        /// get tag
        /// </summary>
        /// <param name="name">tag name</param>
        /// <param name="tag">tag body</param>
        /// <returns>tag's text</returns>
        protected static string getTag(string name, string tag, bool boNextLine = true)
        { return (boNextLine ? MyCommon.Query.getTag(MyCommon.Query.tagNL, "\r\n", false) : "") + "<" + name + ">" + tag + "</" + name + ">"; }
        /// <summary>
        /// Название тега статуса приложения, которому был сделан запрос из другого приложения
        /// </summary>
        public const string tagStatus = "status";
        /// <summary>
        /// Получить тег статуса приложения, которому был сделан запрос из другого приложения
        /// </summary>
        /// <param name="status">статус приложения</param>
        /// <returns>Status tag text</returns>
        public static string getStatusTag(string status) { return Query.getTag(Query.tagStatus, status); }
    }
}
