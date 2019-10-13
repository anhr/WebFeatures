using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace IRCBot
{
    public partial class Default : System.Web.UI.Page
    {
        /// <summary>
        /// Отключить от IRC сервера посетителя с сайта Chaturbate у которго наименьшее количество зрителей на сайте Chaturbate
        /// </summary>
        /// <param name="MyIRCClients">Список посетителей, подключенных к IRC серверу</param>
        /// <param name="reason">Причина отключения от IRC сервера</param>
        /// <returns>посетитель с сайта Chaturbate, который был отключен от IRC сервера или null если ни одного посетителя не было отключено</returns>
        private IRCBot.MyIrcClient QuitChaturbate(IRCBot.MyIRCClients MyIRCClients, string reason)
        {
            IRCBot.MyIrcClient IrcClientKick = null;//этого посетителя с сайта https://chaturbate.com/ надо отключить от IRC сервера
                                                    //что бы освободить место для постороннего посетителя, который хочет присоединиться к IRC серверу, 
                                                    //но не может потому что IRC сервер наложил ограничение на чисто посетителей с одного хоста и выдал ошибку 
                                                    //Too many connections

            foreach (IRCBot.MyIrcClient IrcClient in MyIRCClients)
            {
                if (
                    (IrcClient.chaturbateUser != null)
                && (IrcClient.isConnected())
                && ((IrcClientKick == null) || (IrcClientKick.chaturbateUser.cams.viewers > IrcClient.chaturbateUser.cams.viewers))
                )
                    IrcClientKick = IrcClient;
            }
            if (IrcClientKick != null)
            {
                IrcClientKick.QuitReason(reason);
                System.Diagnostics.Trace.WriteLine("IRCBot quit of " + IrcClientKick.User.Nick);
            }
            return IrcClientKick;
        }
/*
        private string getStatusTag(string status) { return "<status>" + status + "</status>"; }
        private string getConnectionsTag(uint connections) { return "<connections>" + connections + "</connections>"; }
        public string getConnectionTicksTag(long connectionTicks) { return "<connectionTicks>" + connectionTicks + "</connectionTicks>"; }
*/
        /// <summary>
        /// получить список посетителей канала с сайта https://chaturbate.com/
        /// or Receive a request from Chat application
        /// </summary>
        /// <returns>true: web page is response to the request</returns>
        public bool IsIRCServer() {

            //получить список посетителей канала с сайта https://chaturbate.com/
            string IRCServer = Request.Params["IRCServer"];
            bool res = IRCServer == null ? false : true;
            if (res)
            {
//                System.Collections.Generic.List<ChaturbateUser> chaturbateUsers = new System.Collections.Generic.List<ChaturbateUser>();
                System.Collections.Generic.List<IRCBot.Chaturbate.user> chaturbateUsers = new System.Collections.Generic.List<IRCBot.Chaturbate.user>();
                if (IRCBot.ChatHub.IRCClients.ContainsKey(IRCServer))
                {
                    MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[IRCServer];
                    string strChannel = Request.Params["Channel"];
                    if (!String.IsNullOrEmpty(strChannel))
                    {
                        foreach(var myIRCClientPair in myIRCClients)
                        {
                            MyIrcClient myIRCClient = myIRCClientPair;//.Value;
                            if ((myIRCClient.chaturbateUser == null) || !myIRCClient.Channels.Contains(strChannel))
                                continue;
                            IRCBot.Chaturbate.user chaturbateUser = myIRCClient.chaturbateUser.Clone();
                            chaturbateUser.href = "/" + myIRCClient.User.Nick + "/";
                            chaturbateUsers.Add(chaturbateUser);
                        }
                    }
                }
                Response.Write(new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(chaturbateUsers));
                return res;
            }

            //Receive a request from Chat or BotStarter applications
            string request = Request.Params["request"];
            if (!string.IsNullOrEmpty(request))
            {
                string response = MyCommon.NextConnectionLimit.strReady;// "Ready";
                if(request == MyCommon.BotStart.strStart)//"start"
                {//request from BotStarter application
                    response = IRCBot.ChatHub.IRCClients.Start();
                    Response.Write(response);
                    System.Diagnostics.Trace.WriteLine("BotStarter request: \"" + request + "\"");// response: \"" + response + "\"");//слишком длинный response
                    return true;
                }
                res = request == null ? false : true;

                //get IRC server
                string ServerHostname = Request.Params["ServerHostname"];
                if (string.IsNullOrEmpty(ServerHostname))
                {
                    response = "Unknown ServerHostname: " + ServerHostname;
                    Response.Write(MyCommon.Query.getStatusTag(response));
                    System.Diagnostics.Trace.Fail("IRCBot request: \"" + request + "\" response: \"" + response + "\"");
                    return true;
                }
                if (!IRCBot.ChatHub.IRCClients.ContainsKey(ServerHostname))
                {
                    response = MyCommon.NextConnectionLimit.strServerNotFound;// "Server is not found";
                    Response.Write(MyCommon.Query.getStatusTag(response));
                    return true;//Invalid ServerHostname or element id=IRCServersList is empty - ветка со спискои IRC серверов еще не открыта
                }
                IRCBot.MyIRCClients MyIRCClients = IRCBot.ChatHub.IRCClients[ServerHostname];

                switch (request)
                {
                    //returns count of connections to IRC server and max connections if available
                    case MyCommon.NextConnectionLimit.strConnections:
                        {
//                            response = "Ready";
                            try
                            {
                                string strOtherAppMaxConnections = Request.Params[MyCommon.NextConnectionLimit.strMaxConnections];
                                short? otherAppMaxConnections =
                                    strOtherAppMaxConnections == null ? null : (short?)System.Int16.Parse(strOtherAppMaxConnections);
                                if ((otherAppMaxConnections != null) && (MyIRCClients.MaxConnections > otherAppMaxConnections))
                                    //Приложенние SignalRChat установило MaxConnections для данного IRC сервера потому что поучило сообшение сервера типа "too many connections" 
                                    MyIRCClients.MaxConnections = otherAppMaxConnections;
                                if ((Int32.Parse(Request.Params[MyCommon.NextConnectionLimit.strConnections]) + MyIRCClients.Count()) >= MyIRCClients.MaxConnections)
                                {//Количество присоединенных к IRC серверу посетителей превысило максимально допустимое
                                 //Попробовать удалить одного из посетителей с сайта chaturbate
                                    IRCBot.MyIrcClient IrcClientKick = this.QuitChaturbate(MyIRCClients

//                                        , "Too many connections"
//эту причину отключения от IRC сервера делать нельзя
//потому что в IRCClient.Disconnected += (s, e) =>
//переменная MyIRCClients.IRCServer.MaxConnections уменьшается на 1 и становится неверной

                                        , "Release connection for another user"
                                        );
                                    if (IrcClientKick == null)
                                        response = MyCommon.NextConnectionLimit.strNoUsersFromChaturbateSite;// "No users from chaturbate site";
                                }
                            }
                            catch (FormatException e)
                            {
                                Console.WriteLine(e.Message);
                            }
                            Response.Write(MyCommon.Query.getStatusTag(response) +
                                MyCommon.NextConnectionLimit.getConnectionsTag(MyIRCClients.connections()) +
                                MyCommon.NextConnectionLimit.getMaxConnectionsTag(MyIRCClients.MaxConnections));
//                            System.Diagnostics.Trace.WriteLine("IRCBot request: \"" + request + "\" response: \"" + response + "\" quit of " + IrcClientKick.User.Nick);
                            break;
                        }
                    //User can not connect to IRC server from Chat application because he received the "Too many connections" error message.
                    //Trying disconnect from IRC server a user from site for freeing of connection for current user
                    //Returns to the Chat application the "Ready" response if connection was freed successfully
                    case MyCommon.NextConnectionLimit.strTooManyConnections:// "Too many connections":
                        {
                            res = true;
                            IRCBot.MyIrcClient IrcClientKick = this.QuitChaturbate(MyIRCClients, request);
                            string kickNick = "";
                            if (IrcClientKick == null)
                                response = MyCommon.NextConnectionLimit.strNoUsersFromChaturbateSite;// "No users from chaturbate site";
                            else kickNick = IrcClientKick.User.Nick;
                            Response.Write(MyCommon.Query.getStatusTag(response) +
                                MyCommon.NextConnectionLimit.getConnectionsTag(MyIRCClients.connections()));
                            System.Diagnostics.Trace.WriteLine("IRCBot request: \"" + request + "\" response: \"" + response + "\" quit of " + kickNick);
                            break;
                        }
                    //New user was joined to channel in the SignalRChat application. Probably this user from chaturbate site.
                    // Returns content of chaturbate of the user if user from chaturbate site.
                    case "chaturbate":
                        res = true;
                        string nick = Request.Params["nick"];
                        if(nick == null)
                        {
                            response = "Invalid nick: " + nick;
                            Response.Write(response);
                            System.Diagnostics.Trace.Fail("IRCBot request: \"" + request + "\" response: \"" + response + "\"");
                            return true;
                        }
                        foreach (IRCBot.MyIrcClient IrcClient in MyIRCClients)
                        {
                            if ((IrcClient.chaturbateUser == null) || (IrcClient.User.Nick != nick))
                                continue;
                            Response.Write(new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(IrcClient.chaturbateUser));
//                            Response.Write(IrcClient.chaturbate);
                            break;
                        }
                        break;
                    case MyCommon.NextConnectionLimit.strConnectionTicks:// "connectionTicks":
                        Response.Write(MyCommon.Query.getStatusTag(response) + 
                            MyCommon.NextConnectionLimit.getConnectionTicksTag(MyIRCClients.ConnectionTicks));
                        break;
                    default:
                        Response.Write(MyCommon.Query.getStatusTag("Invalid request: " + request));
                        break;
                }
            }
            return res;
        }
        protected void Page_Load(object sender, EventArgs e)
        {

        }
    }
}