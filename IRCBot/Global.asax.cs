using System;
/*
Создать Global.asax :
http://net-informations.com/faq/asp/globalasax.htm
Уточнение:
Add New Item
    Web
        Global Application Class
*/
namespace IRCBot
{
    public class Global : System.Web.HttpApplication
    {

        /// <summary>
        /// Called when the first resource (such as a page) in an ASP.NET application is requested. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        /// <remarks>
        /// The Application_Start method is called only one time during the life cycle of an application. 
        /// You can use this method to perform startup tasks such as loading data into the cache and initializing static values.
        /// https://msdn.microsoft.com/en-us/library/ms178473.aspx
        /// </remarks>
        protected void Application_Start(object sender, EventArgs e)
        {
            //не могу сюда попасть в отладчике. Видимо он подключается после вызова этой функции
            //https://stackoverflow.com/questions/641148/application-start-not-firing
            MyCommon.NextConnectionLimit.application = "SignalRChat";
            MyCommon.Logger.Source = "IRCBot";
            MyCommon.Logger.LogInformation("Application_Start");
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {
/*
// Find the log associated with this source.    
string logName = System.Diagnostics.EventLog.LogNameFromSourceName(MyCommon.Logger.Source, ".");
*/
            /*
            foreach (var myIrcClientsPair in ChatHub.IRCClients)
            {
                IRCBot.MyIRCClients myIRCClients = myIrcClientsPair.Value;
                myIRCClients.LogInformation();
                foreach (IRCBot.MyIrcClient myIrcClient in myIRCClients)
                {
                    MyCommon.Logger.LogInformation(myIrcClient.ServerHostname + " " + myIrcClient.User.Nick +
                        (myIrcClient.isConnected() ? " Connected" : " Disconnected"));
                }
            }
            */
            MyCommon.Logger.LogInformation("Application_End");
        }
    }
}