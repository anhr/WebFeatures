using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using ChatSharp;

namespace IRCClient
{
    class Program
    {
        static void Main(string[] args)
        {
            //https://github.com/SirCmpwn/ChatSharp
            var client = new IrcClient("irc.freenode.net", new IrcUser("ChatSharp", "ChatSharp"));
//            var client = new IrcClient("localhost", new IrcUser("ChatSharp", "ChatSharp"));
            Console.WriteLine("IRC client. " + client.ServerAddress); 
            client.ConnectionComplete += (s, e) => {
                Console.WriteLine("ConnectionComplete.");
                client.JoinChannel("#botwar");
            };
            client.UserJoinedChannel += (s, e) => {
                Console.WriteLine("The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel.");
            };
            client.NetworkError += (s, e) => Console.WriteLine("NetworkError: " + new Win32Exception((int)e.SocketError).Message);
            client.Error += (s, e) => Console.WriteLine("Error: " + e.Error);

            client.ChannelMessageRecieved += (s, e) =>
            {
                var channel = client.Channels[e.PrivateMessage.Source];

                if (e.PrivateMessage.Message == ".list")
                    channel.SendMessage(string.Join(", ", channel.Users.Select(u => u.Nick)));
                else if (e.PrivateMessage.Message.StartsWith(".ban "))
                {
                    if (!channel.UsersByMode['@'].Contains(client.User))
                    {
                        channel.SendMessage("I'm not an op here!");
                        return;
                    }
                    var target = e.PrivateMessage.Message.Substring(5);
                    client.WhoIs(target, whois => channel.ChangeMode("+b *!*@" + whois.User.Hostname));
                }
            };

            client.ConnectAsync();

            while (true) ; // Waste CPU cycles
        }
    }
}
