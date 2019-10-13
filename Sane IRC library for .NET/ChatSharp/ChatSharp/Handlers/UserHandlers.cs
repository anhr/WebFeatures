using System;
using System.Linq;

namespace ChatSharp.Handlers
{
    internal static class UserHandlers
    {
        public static void HandleWhoIsRegNick(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.RegNick = true;
        }

        public static void HandleWhoIsNickTrace(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.NickTraces.Add(message.Parameters[2], message.Parameters[3]);
        }

        public static void HandleWhoIsUser(IrcClient client, IrcMessage message)
        {
            if (message.Parameters != null && message.Parameters.Length >= 6)
            {
                var whois = PeekWhoIsOperation(client, message);
                if (whois == null)
                    return;
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

        private static WhoIs PeekWhoIsOperation(IrcClient client, IrcMessage message)
        {
            RequestOperation requestOperation = client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]);
            if (requestOperation == null)
                return null;
            return (WhoIs)requestOperation.State;
        }

        public static void HandleWhoIsLoggedInAs(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.LoggedInAs = message.Parameters[2];
        }

        public static void HandleWhoIsLocation(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.Location = message.Parameters[3];
        }

        /// <summary>
        /// RPL_WHOISACTUALLY &lt;source&gt; 338 &lt;target&gt; &lt;nick&gt; &lt;user&gt;@&lt;host&gt; &lt;ip&gt; :Actual user@host, Actual IP
        /// </summary>
        public static void HandleWhoIsActually(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            int index = 2;
            foreach (var item in
                new System.Text.RegularExpressions.Regex("(.*), (.*)").Split(message.Parameters[message.Parameters.Count() - 1]))
            {
                if (item == "")
                    continue;
                if(whois.Actually == null)
                    whois.Actually = new System.Collections.Generic.Dictionary<string, string>();
                whois.Actually.Add(item, message.Parameters[index]);
                index++;
            }
        }

        public static void HandleWhoIsServer(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.Server = message.Parameters[2];
            whois.ServerInfo = message.Parameters[3];
        }

        public static void HandleWhoIsOperator(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.IrcOp = true;
        }

        public static void HandleWhoIsIdle(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            whois.SecondsIdle = int.Parse(message.Parameters[2]);
        }

        public static void HandleWhoIsChannels(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            var channels = message.Parameters[2].Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < channels.Length; i++)
                if (!channels[i].StartsWith("#"))
                    channels[i] = channels[i].Substring(1);
            whois.Channels = whois.Channels.Concat(channels).ToArray();
        }

        public static void HandleWhoIsOther(IrcClient client, IrcMessage message)
        {
            var whois = PeekWhoIsOperation(client, message);
            if (whois == null)
                return;
            if (whois.Other == null)
                whois.Other = new System.Collections.Generic.List<string>();
            whois.Other.Add(message.Parameters[2]);
        }

        public static void HandleWhoIsEnd(IrcClient client, IrcMessage message)
        {
            var request = client.RequestManager.DequeueOperation("WHOIS " + message.Parameters[1]);
            if (request == null)
                return;
            var whois = (WhoIs)request.State;
            if (!client.Users.Contains(whois.User.Nick))
                client.Users.Add(whois.User);
            if (request.Callback != null)
                request.Callback(request);
            client.OnWhoIsReceived(new Events.WhoIsReceivedEventArgs(whois));
            if (!string.IsNullOrEmpty(client.User.NSPassword))
                client.NSIdentify(client.User.NSPassword);
        }
    }
}
