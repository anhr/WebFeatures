using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace SignalRChat
{
    public partial class Default : System.Web.UI.Page
    {
/*
        public static string getStatusTag(string status) { return "<status>" + status + "</status>"; }
        public static string getConnectionsTag(uint connections) { return "<connections>" + connections + "</connections>"; }
        public static string getConnectionTicksTag(long connectionTicks) { return "<connectionTicks>" + connectionTicks + "</connectionTicks>"; }
*/
        /// <summary>
        /// Ответить на запрос из приложения IRCBot
        /// </summary>
        /// <param name="request">Request.Params["request"]</param>
        public static void myResponce(System.Web.HttpRequest Request, System.Web.HttpResponse Response)
        {
            string request = Request.Params["request"];
            string response = MyCommon.NextConnectionLimit.strReady;// "Ready";
            //get IRC server
            string ServerHostname = Request.Params["ServerHostname"];
            if (string.IsNullOrEmpty(ServerHostname))
            {
                response = "Unknown ServerHostname: " + ServerHostname;
                Response.Write(MyCommon.Query.getStatusTag(response));
                System.Diagnostics.Trace.Fail("IRCBot request: \"" + request + "\" response: \"" + response + "\"");
                return;
            }
            SignalRChat.ChatHub.MyIRCClients myIRCClients = SignalRChat.ChatHub.IRCServers[ServerHostname];
            switch (request)
            {
                //returns count of connections to IRC server
                case MyCommon.NextConnectionLimit.strConnections:
                    if (myIRCClients == null)
                        response = MyCommon.NextConnectionLimit.strServerNotFound;
/*
                    else
                    {
                        string strOtherAppMaxConnections = Request.Params[MyCommon.NextConnectionLimit.strMaxConnections];
                        short? otherAppMaxConnections =
                            strOtherAppMaxConnections == null ? null : (short?)System.Int16.Parse(strOtherAppMaxConnections);
                        if ((otherAppMaxConnections != null) && (MyIRCClients.MaxConnections > otherAppMaxConnections))
                            //Приложенние SignalRChat установило MaxConnections для данного IRC сервера потому что поучило сообшение сервера типа "too many connections" 
                            myIRCClients.MaxConnections = otherAppMaxConnections;
                    }
*/
                    Response.Write(MyCommon.Query.getStatusTag(response)
                        + (
                            myIRCClients == null ? ""
                            :
                            MyCommon.NextConnectionLimit.getConnectionsTag((uint)(myIRCClients.Count))
                            + MyCommon.NextConnectionLimit.getMaxConnectionsTag(myIRCClients.MaxConnections)
                           )
                        );
                    break;
                case MyCommon.NextConnectionLimit.strConnectionTicks:// "connectionTicks":
                    Response.Write(MyCommon.Query.getStatusTag(response)
                        + MyCommon.NextConnectionLimit.getConnectionTicksTag(myIRCClients == null ? 0 : myIRCClients.connectionTicks));
                    break;
                //User can not connect to IRC server from IRCBot application because he received the "Too many connections" error message.
                //Returns to IRCBot application the "Ready" response and connections count of SignalRChat application
                case MyCommon.NextConnectionLimit.strTooManyConnections:// "Too many connections":
                    int count = myIRCClients == null ? 0 : myIRCClients.Count;
                    Response.Write(MyCommon.Query.getStatusTag(response) + MyCommon.NextConnectionLimit.getConnectionsTag((uint)count));
                    System.Diagnostics.Trace.WriteLine("IRCBot request: \"" + request + "\" response: \"" + response + "\" connections = " + count);
                    break;
                default:
                    Response.Write(MyCommon.Query.getStatusTag("Invalid request: " + request));
                    break;
            }
        }
        public bool IsIRCChannelOrPrivate()
        { return false; }
        public bool IsIRCServer() { return Request.Params["IRCServer"] == null ? false : true; }
        public bool IsSignalRChat() { return Request.Params["chatRoom"] == null ? false : true; }
        protected void Page_Load(object sender, EventArgs e)
        {
            //http://www.interestprograms.ru/sources/aspnet/program-code-webforms
            var paramChatRoom = Request.Params["chatRoom"];
            string strWhere = "";
            if (paramChatRoom != null)
            {
                strWhere = " where RoomName != '" + paramChatRoom + "'";
            }

            //< !--https://msdn.microsoft.com/en-us/library/system.web.ui.webcontrols.basedataboundcontrol.datasource(v=vs.100).aspx -->
            // This example uses Microsoft SQL Server and connects
            // to the Northwind sample database. The data source needs
            // to be bound to the GridView control only when the 
            // page is first loaded. Thereafter, the values are
            // stored in view state.                      
            if (!IsPostBack)
            {
//                SqlDataSourceRooms.SelectCommand = "select RoomName, RoomNameCount from dbo.ViewRoomLists" + strWhere + " order by RoomNameCount desc, RoomName";
            }

        }
    }
}
