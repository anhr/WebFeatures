using System;

namespace SignalRChat
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {

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
            foreach(var result in SignalRChat.ChatHub.IRCClients)
            {
                System.Diagnostics.Trace.WriteLine("Application_End");
                ChatSharp.IrcClient ircClient = result.Value;
                ircClient.Quit();
//                ircClient.Disconnect();
            }
        }
    }
}