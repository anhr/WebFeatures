using System;
using System.Linq;

namespace ChatSharp.Handlers
{
    internal static class UserHandlers
    {
        public static void HandleWhoIsUser(IrcClient client, IrcMessage message)
        {
            if (message.Parameters != null && message.Parameters.Length >= 6)
            {
                var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
                whois.User.Nick = message.Parameters[1];
                whois.User.User = message.Parameters[2];
                whois.User.Hostname = message.Parameters[3];
                whois.User.RealName = message.Parameters[5];
                if (client.Users.Contains(whois.User.Nick))
                {
                    var user = client.Users[whois.User.Nick];
                    user.User = whois.User.User;
                    user.Hostname = whois.User.Hostname;
                    user.RealName = whois.User.RealName;
                    whois.User = user;
                }
            }
        }

        public static void HandleWhoIsLoggedInAs(IrcClient client, IrcMessage message)
        {
            var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
            whois.LoggedInAs = message.Parameters[2];
        }

        public static void HandleWhoIsServer(IrcClient client, IrcMessage message)
        {
            var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
            whois.Server = message.Parameters[2];
            whois.ServerInfo = message.Parameters[3];
        }

        public static void HandleWhoIsOperator(IrcClient client, IrcMessage message)
        {
            var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
            whois.IrcOp = true;
        }

        public static void HandleWhoIsIdle(IrcClient client, IrcMessage message)
        {
            var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
            whois.SecondsIdle = int.Parse(message.Parameters[2]);
        }

        public static void HandleWhoIsChannels(IrcClient client, IrcMessage message)
        {
            var whois = (WhoIs)client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]).State;
            var channels = message.Parameters[2].Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < channels.Length; i++)
                if (!channels[i].StartsWith("#"))
                    channels[i] = channels[i].Substring(1);
            whois.Channels = whois.Channels.Concat(channels).ToArray();
        }

        public static void HandleWhoIsEnd(IrcClient client, IrcMessage message)
        {
            var request = client.RequestManager.DequeueOperation("WHOIS " + message.Parameters[1]);
            var whois = (WhoIs)request.State;
            if (!client.Users.Contains(whois.User.Nick))
                client.Users.Add(whois.User);
            if (request.Callback != null)
                request.Callback(request);
            client.OnWhoIsReceived(new Events.WhoIsReceivedEventArgs(whois));
        }
    }
}
