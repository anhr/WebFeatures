using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
[assembly: OwinStartup(typeof(SignalRChat.Startup))]
namespace SignalRChat
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();

            //http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client#connectionlifetime
            //If you don't explicitly enable detailed error messages on the server, the exception object that SignalR returns
            //after an error contains minimal information about the error.
            //For example, if a call to newContosoChatMessage fails, the error message in the error object contains
            //"There was an error invoking Hub method 'contosoChatHub.newContosoChatMessage'."
            //Sending detailed error messages to clients in production is not recommended for security reasons,
            //but if you want to enable detailed error messages for troubleshooting purposes, use the following code on the server.
            var hubConfiguration = new HubConfiguration();
            hubConfiguration.EnableDetailedErrors = true;
            app.MapSignalR(hubConfiguration);
        }
    }
}