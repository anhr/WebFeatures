using System;
using System.ComponentModel;
using System.Data.SqlClient;
using System.Linq;
using System.Timers;
using ChatSharp;
using Microsoft.Win32;
using Utility.ModifyRegistry;

namespace IRCClient
{
    class Program
    {
        private class MyIrcClient: IrcClient
        {
            public MyIrcClient(string serverAddress, IrcUser user, bool useSSL = false)
                :base(serverAddress, user, useSSL)
            { }
            public new void JoinChannel(string channel)
            {
                try
                {
                    if (base.User.Channels.Contains(channel))
                    {
                        ConsoleError(channel + " channel already exists in this collection.");
                        JoinChannelNext();
                        return;
                    }
                    ConsoleWriteLine("JoinChannel(" + channel + ") Joined count=" + base.User.Channels.Count() + " channelId=" + Program.DBIRCServer.ChannelId + " of " + base.Channels.Count());
                    base.JoinChannel(channel);
                    Program.timer.Start();
                }
                catch (InvalidOperationException exception)
                {
                    ConsoleError(exception.ToString());
                }
            }

            public new void WhoIs(string nick, Action<WhoIs> callback)
            {
                ConsoleError("Use WhoIs(string nick, Action<WhoIs> callback)");
            }
            public new void WhoIs(ChatSharp.IrcUser user, Action<WhoIs> callback)
            {
                ConsoleError("Use WhoIs(ChatSharp.IrcUser user, Action<WhoIs> callback)");
            }
            public void WhoIs(ChatSharp.IrcUser user, Action<WhoIs> callback, int i, string channelName, int usersCount)
            {
                ConsoleLine("whois: userIndex = " + i + " of " + (usersCount - 1) + " " + channelName + ". " + user.Nick);
                try
                {
                    if(user.WhoIs != null)
                    {
                        ConsoleError("user.WhoIs != null, nick: " + user.Nick);
                        Program.WhoIsNext();
                        return;
                    }
                    base.WhoIs(user, callback);
                }
                catch (Exception e)
                {
                    ConsoleError(e.ToString());
                    Program.WhoIsNext();
                }
            }
        }
        private static MyIrcClient m_client;
        private static IrcChannel m_channel;
        //        private static ChannelCollection m_channelCollection;
        /// <summary>
        /// The users count for all channels. It is sum # visible parameter  of all of the IRC server's reply 322 RPL_LIST "channel # visible :topic". See rfc1459#section-6.2  Command responses.
        /// </summary>
        private static uint m_usersCount = 0;
        //private static uint m_usersCountNames = 0;
//        private static int m_channelIndex = 0;
        //private static int m_userIndex = 0;
        private static ModifyRegistry m_myRegistry = new ModifyRegistry(Registry.CurrentUser, "AH");
        //private static string m_registryChannelIndex = "channel Index";

        /// <summary>
        /// Ожидаем ответа на JOIN message.
        /// Запускается когда отправляется JOIN message.
        /// Останавливается при получении JOIN reply. Смотри m_client.UserJoinedChannel
        /// </summary>
        private static Timer timer = new Timer(30000);
        /// <summary>
        /// Некоторые IRC серверы никак не отвечают на JOIN message после входа в определенное количество каналов.
        /// Для того что бы была возможность снова присоединяться к новым каналам приходится переподключаться к IRC серверу.
        /// Но в таком случае я могу не дождаться ответа на приватное сообщение "Hello " + Nick. Смотри SendPrivateMessage
        /// Поэтому, перед переподключением к IRC серверу я жду 10 минут - (Program.timerElapsedCount > 20) в Program.timer.Elapsed
        /// Увеличивается на единицу всякий раз когда вызыывеатся Program.timer.Elapsed.
        /// Обнуляется когда пользователь вошел в канал т.е. при каждом получении JOIN reply. Смотри m_client.UserJoinedChannel
        /// Также обнуляется когда комуто из пользователей было отправлено приватное сообщение "Hello " + Nick. Смотри SendPrivateMessage
        /// Такмим образом я не переподключаюсь к серверу 10 минут если было отправлено приватное сообщение "Hello " + Nick
        /// </summary>
        private static uint timerElapsedCount = 0;
        /// <summary>
        /// Ожидаем ответа на PRIVMSG [UserNick] Hello [UserNick]. Смотри Program.SendPrivateMessage(...)
        /// Запускается когда отправляется PRIVMSG [UserNick] Hello [UserNick].
        /// Останавливается при получении JOIN reply. Смотри m_client.UserJoinedChannel
        /// </summary>
        //private static Timer timerPrivmsg = new Timer(2* 60 * 1000);

        //private static string MyChannel = "#MyChannel";//"\u001b$BElJ}CFKk<B67\u001b(B";
        static void ConsoleError(string strError)
        {
            ConsoleWriteLine("Error: " + strError, ConsoleColor.Red);
        }
        static void ConsoleLine(string str)
        {
            Console.CursorLeft = 0;
            Console.Write(new string(' ', Console.WindowWidth - 1));
            Console.CursorLeft = 0;
            if (str.Length >= Console.WindowWidth)
                str = str.Substring(0, Console.WindowWidth - 1);
            Console.Write(str);
        }
        static void ConsoleWriteLine(string str, ConsoleColor consoleColor = ConsoleColor.Gray)
        {
//            System.Diagnostics.Trace.WriteLine("Console.CursorTop: " + Console.CursorTop);
            if ((Console.CursorLeft != 0) && (Console.CursorTop < Console.BufferHeight))
            {
                Console.CursorLeft = 0;

                //Error: System.ArgumentOutOfRangeException: The value must be greater than or equal to zero and less than the console's buffer size in that dimension.
                //Parameter name: top
                //Actual value was 300.

                //Console.CursorTop++;
            }
            Console.ForegroundColor = consoleColor;
            Console.WriteLine(str);
            Console.ResetColor();
        }
        static void SendMessage(string message)
        {
            try
            {
                ConsoleWriteLine("channel: " + m_channel.Name + " Message: " + message);
                m_client.SendMessage(message, m_channel.Name);
            }
            catch (InvalidOperationException exception)
            {
                ConsoleError(exception.ToString());
            }
            catch (Exception exception)
            {
                ConsoleError(exception.ToString());
            }
        }
        private static void JoinChannel(string channelName)
        {
            m_client.JoinChannel(channelName);
        }
        private static void PartChannel(int index)
        {
            if (Program.m_client.User.Channels.Count() <= index)
                return;
            string channelName = Program.m_client.User.Channels[index].Name;
            if (!Program.m_client.Channels.Contains(channelName))
            {
                ConsoleError("The \"" + channelName + "\" client is not present in channel.");
                //Здесь надо выбрать какой то другой канал для выхода
                return;
            }
            Program.m_client.PartChannel(channelName);
        }
        private static void JoinChannelNext()
        {
            if ((Program.joinedChannelsLimit != 0) && (Program.m_client.User.Channels.Count() >= Program.joinedChannelsLimit))
            {
                Program.PartChannel(0);
                return;
            }
            Program.DBIRCServer.ChannelId++;

            if (m_client.Channels.Count() > Program.DBIRCServer.ChannelId)
            {
                IrcChannel channel = m_client.Channels[(int)Program.DBIRCServer.ChannelId];
                if (channel.Name == "*")
                {
                    JoinChannelNext();
                    return;
                }
                Program.JoinChannel(channel.Name);
            }
            else
            {
                Program.DBIRCServer.ChannelId = 0;
                ConsoleWriteLine("End of channels");
                Program.timerQuitWaitPrivmsgCount = 0;
                Program.timerQuitWaitPrivmsg.Start();
                ConsoleLine("Waiting of private message " + (Program.timerQuitWaitPrivmsgCountMax - Program.timerQuitWaitPrivmsgCount) + " minutes");
                //m_client.Quit("End of channels");
            }
            try
            {
                Program.db.SaveChanges();
            }
            catch (System.Data.Entity.Validation.DbEntityValidationException e)
            {
                ConsoleError(e.ToString());
                Program.db = new ChatContainer();
                ConsoleError("Reconnect to " + Program.m_client.ServerAddress + " server");
                Program.ConnectToIRCServerTimer();
            }
        }
        private static string m_registryIRCServerIndex = "IRC Server index";
        private static int m_IRCServerIndex = 1;
        private static bool m_boDisconnected = false;
        /// <summary>
        /// Соединение со следующим IRC сервером делаю с задержкой, что бы сработали все возможные сообщения об ошибках, которые возникают после отсоединеия от предыдрущего соединения
        /// </summary>
        private static Timer timerConnectToIRCServer = new Timer(1000);
        /// <summary>
        /// Перед тем как отсоедениться от сервера подождем приватных сообщений пользователей 10 минут
        /// </summary>
        private static Timer timerQuitWaitPrivmsg = new Timer(60* 1000);
        /// <summary>
        /// Во время ожидания приватных сообщений пользователей выводим сообщение на консоль каждую минуту
        /// </summary>
        private static uint timerQuitWaitPrivmsgCount = 0;
        private const uint timerQuitWaitPrivmsgCountMax = 10;
        static void ConnectToIRCServer()
        {
            Program.timerConnectToIRCServer.Start();
        }
        /// <summary>
        /// задержка отсоединения от IRC сервера. Некоторые сервера никак не отвечают на команду QUIT а просто отключаются 
        /// Сервер
        /// IRC client. "uk.quakenet.org:6667"  Group: "Quakenet" Name: "Random UK" m_IRCServerIndex = 36
        /// выдвет эту ошибку если не делать эту задержку:
        /// Error: Network: An established connection was aborted by the software in your host machine
        /// </summary>
        private static Timer timerQuit = new Timer(1000);
        static void QuitTimer()
        {
            Program.timerQuit.Start();
            //m_client.Quit();
        }
        private static IRCClient.ChatContainer db;
        private static IRCClient.DBIRCServer DBIRCServer;
        private static IRCClient.DBIRCChat DBIRCChat;
        static IRCClient.DBIRCUser DBAddUser(string Nick)
        {
            var DBIRCUser = Program.db.DBIRCUsers
                .Where(u => u.Nick == Nick && u.DBIRCServersId == Program.DBIRCServer.Id)
                .FirstOrDefault();
            if (DBIRCUser == null)
            {
                Program.db.DBIRCUsers.Add(new IRCClient.DBIRCUser()
                {
                    Nick = Nick,
                    DBIRCServersId = Program.DBIRCServer.Id
                });
                Program.db.SaveChanges();
            }

            DBIRCUser = Program.db.DBIRCUsers
                .Where(u => u.Nick == Nick && u.DBIRCServersId == Program.DBIRCServer.Id)
                .FirstOrDefault();
            if (DBIRCUser == null)
                ConsoleError("DBIRCUser = " + DBIRCUser);
            return DBIRCUser;
        }
        static IRCClient.DBIRCChat DBAddChat(string Name)
        {
            var DBIRCChat = Program.db.DBIRCChats
                .Where(u => u.Name == Name && u.DBIRCServersId == Program.DBIRCServer.Id)
                .FirstOrDefault();
            if (DBIRCChat == null)
            {
                Program.db.DBIRCChats.Add(new IRCClient.DBIRCChat()
                {
                    Name = Name,
                    DBIRCServersId = Program.DBIRCServer.Id
                });
                Program.db.SaveChanges();
                DBIRCChat = Program.db.DBIRCChats
                    .Where(u => u.Name == Name && u.DBIRCServersId == Program.DBIRCServer.Id)
                    .FirstOrDefault();
            }
            if (DBIRCChat == null)
                ConsoleError("DBIRCChat = " + DBIRCChat);
            return DBIRCChat;
        }
        static void SendPrivateMessage(string Nick)
        {
            if(Nick == null)
            {
                ConsoleError("SendPrivateMessage(null)");
                return;
            }
            string strError = "";
            try
            {
                var DBIRCUser = Program.DBAddUser(Program.m_client.User.Nick);
                if (DBIRCUser == null)
                    return;

                var DBIRCUserReceiver = Program.DBAddUser(Nick);
                if (DBIRCUserReceiver == null)
                {
                    ConsoleError("DBIRCUserReceiver == null");
                    return;
                }

                var DBIRCChat = Program.DBAddChat(Nick);
                if (DBIRCChat == null)
                    return;

                var DBIRCMessage = Program.db.DBIRCMessages
                    .Where(u => (u.DBIRCChatsId == DBIRCChat.Id) && (u.DBIRCUsersId == DBIRCUser.Id));

                var DBIRCMessageReceiver = Program.db.DBIRCMessages
                    .Where(u => (u.DBIRCChatsId == DBIRCChat.Id) && (u.DBIRCUsersId == DBIRCUserReceiver.Id));

                string message;
                switch (DBIRCMessage.Count())
                {
                    case 0:
                        message = "Hello " + Nick;
//                        Program.timerPrivmsg.Start();
                        Program.timerElapsedCount = 0;
                        break;
                    case 1:
                        if (DBIRCMessageReceiver.Count() == 0)
                            return;
                        message = "Please visit to video chat https://bonalink.hopto.org/Chat/";
                        break;
                    default:
                        return;
                }
                Program.db.DBIRCMessages.Add(new IRCClient.DBIRCMessage()
                {
                    Message = message,
                    DBIRCChatsId = DBIRCChat.Id,
                    DBIRCUsersId = DBIRCUser.Id,
                    Date = DateTime.Now
                });
                Program.db.SaveChanges();
                m_client.SendMessage(message, Nick);
                ConsoleWriteLine("");
                ConsoleWriteLine("SendMessage('" + message + "', '" + Nick + "');", ConsoleColor.Green);
            }
/*
            catch (SqlException ex)
            {
                strError = ex.ToString();
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                strError = ex.ToString();
            }
*/
            catch (Exception ex)
            {
                strError = ex.ToString();
            }
            if (strError != "")
            {
                ConsoleError(strError);
            }
        }
        static void UserMessageRecieved(ChatSharp.PrivateMessage privateMessage)
        {
            string strError = "";
            try
            {
                var DBIRCUser = Program.DBAddUser(privateMessage.Source);
                if (DBIRCUser == null)
                    return;

                var DBIRCChat = Program.DBAddChat(privateMessage.Source);
                if (DBIRCChat == null)
                    return;

                Program.db.DBIRCMessages.Add(new IRCClient.DBIRCMessage()
                {
                    Message = privateMessage.Message,
                    DBIRCChatsId = DBIRCChat.Id,
                    DBIRCUsersId = DBIRCUser.Id,
                    Date = DateTime.Now
                });
                Program.db.SaveChanges();
            }
            catch (Exception ex)
            {
                strError = ex.ToString();
            }
            if (strError != "")
            {
                ConsoleError(strError);
            }
        }

        private static int joinedChannelsLimit = 0;
        private static void WhoIsNext()
        {
            for (int i = 0; i < Program.m_channel.Users.Count(); i++)
            {
                var user = Program.m_channel.Users[i];
                if (user.WhoIs == null)
                {
                    ConsoleLine("whois: userIndex = " + i + " of " + (Program.m_channel.Users.Count() - 1) + " " + Program.m_channel.Name + ". " + user.Nick);
                    Program.m_client.WhoIs(user, Program.WhoIs, i, Program.m_channel.Name, Program.m_channel.Users.Count());
                    return;
                }
            }
            Console.WriteLine("");
            Program.JoinChannelNext();
        }
        private static void WhoIs(ChatSharp.WhoIs whois)
        {
            //            ConsoleLine("whois: m_userIndex = " + Program.m_userIndex + " of " + (Program.m_channel.Users.Count() - 1) + ". " + whois.User.Nick);
            if (whois.IrcOp)
            {
                ConsoleWriteLine("");
                ConsoleWriteLine(whois.User.Nick + " is IRC operator");
            }
            else if(whois.error != null)
            {
                ConsoleWriteLine("");
                ConsoleWriteLine("whois.error: " + whois.error);
            }
            else Program.SendPrivateMessage(whois.User.Nick);
            Program.WhoIsNext();
        }
        /*
                private static void WhoIsEnd(ChatSharp.WhoIs whois)
                {
                    ConsoleLine("whois end: m_userIndex = " + Program.m_userIndex + " of " + (Program.m_channel.Users.Count() - 1) + ". " + whois.User.Nick);
                    if (whois.IrcOp)
                        ConsoleWriteLine(whois.User.Nick + " is IRC operator");
                    Console.WriteLine("");
                    Program.JoinChannelNext();
                }
        */
        /// <summary>
        /// Если компьютер соединен с локальной сетью по WiFi то возникают сбои соединения.
        /// В этом случае по выбору пользователя можно прпобовать снова соединиться с текущим IRC сервером: Connect.Reconnect
        /// или перейти на следующий IRC сервер: Connect.Next
        /// </summary>
        private enum Connect { Reconnect, Next, Default };
        private static Connect connect = Program.Connect.Default;
        private static void ReadKey()
        {
            if (Program.connect != Connect.Default)
                return;
            while (true)
            {
                Console.Write(
                        "Reconnect to " + m_client.ServerAddress + " server - R\r\n"
                    + "Conect to next IRS server - N\r\n"
                    + "Please select: ");
                ConsoleKeyInfo consoleKeyInfo = Console.ReadKey();
                ConsoleWriteLine("");
                switch (consoleKeyInfo.Key)
                {
                    case ConsoleKey.R:
                        Program.connect = Connect.Reconnect;
                        break;
                    case ConsoleKey.N:
                        Program.connect = Connect.Next;
                        break;
                    default:
                        continue;
                }
                break;
            }
            Program.m_client.Quit("Message error.");
//            Program.QuitTimer();
        }
        static void ConnectToIRCServerNext()
        {
            Program.m_IRCServerIndex++;
            Program.ConnectToIRCServerTimer();
        }
        static void ConnectToIRCServerTimer()
        {
            string strError = "";
            try
            {
                if (db == null)
                {
                    ConsoleError("db == null");
                    return;
                }
                //m_IRCServerIndex++;
                Program.m_myRegistry.WriteDWord(Program.m_registryIRCServerIndex, (uint)Program.m_IRCServerIndex);
                    
                if (m_IRCServerIndex < 1)
                    m_IRCServerIndex = 1;

                Program.DBIRCServer = Program.db.DBIRCServers
                    .Where(u => u.Id == m_IRCServerIndex)
                    .FirstOrDefault();
                if (Program.DBIRCServer == null)
                {
                    ConsoleWriteLine("End of IRC Servers.");
                    return;
                }
                Program.m_client = new MyIrcClient(Program.DBIRCServer.URL + (Program.DBIRCServer.Port == null ? "" : ":" + Program.DBIRCServer.Port)//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//Program.DBIRCServer.URL + (Program.DBIRCServer.Port == null ? "" : ":" + Program.DBIRCServer.Port)
                    , new IrcUser("bonalink2", "bonalink"));
                //    , new IrcUser("ChatSharp", "ChatSharp"));
                //    , new IrcUser("pc2014", "pc2014"));
                Program.m_client.Settings.GenerateRandomNickIfRefused = false;
                Program.joinedChannelsLimit = 0;

                //https://github.com/SirCmpwn/ChatSharp
                ConsoleWriteLine("IRC client. \"" + m_client.ServerAddress + "\"  Group: \"" + Program.DBIRCServer.GroupName + "\" Name: \"" + Program.DBIRCServer.Name + "\" m_IRCServerIndex = " + m_IRCServerIndex);
                m_client.ConnectionComplete += (s, e) =>
                {
                    ConsoleWriteLine("ConnectionComplete.");
                        
                    //список каналов (чатов)
                    string channels = null;// "#botwarmy";
                    string server = null;//"irc.webmaster.com"
                    ConsoleWriteLine("m_client.List(...," + channels + ", " + server + ")");
                    m_client.List(list =>
                        {//Called when a IRC server's 323 RPL_LISTEND ":End of /LIST" response to a LIST message.
                            ConsoleWriteLine("");
                            ConsoleWriteLine("ListEnd: " + list.Message.Parameters[1]);
                            if (list.Channels.Count() == 0)
                            {
                                ConsoleError("m_client.ChannelsList.Count() = " + list.Channels.Count());
                                return;
                            }
                            if (Program.DBIRCServer.ChannelId == null)
                                Program.DBIRCServer.ChannelId = 0;
                            if (Program.DBIRCServer.ChannelId >= list.Channels.Count())
                            {
                                ConsoleError("channelIndex = " + Program.DBIRCServer.ChannelId + " >= list.Channels.Count() = " + list.Channels.Count());
                                Program.DBIRCServer.ChannelId = list.Channels.Count() - 1;
                            }
                            Program.JoinChannel(list.Channels[(int)Program.DBIRCServer.ChannelId].Name);
                            //Program.JoinChannel(Program.MyChannel);
                        }
                        , channels
                        , server
                    );
                }; 
                m_client.NickInUse += (s, e) =>
                {
                    ConsoleError("Nick " + e.InvalidNick + " in use");
                };
                m_client.ListStart += (s, e) =>
                {//Called when a IRC server's 321 RPL_LISTSTART "Channel :Users  Name" response to a LIST message.
                    ConsoleWriteLine("ListStart: " + e.Message.Parameters[1] + " :" + e.Message.Parameters[2]);
                };
                m_client.ListReply += (s, e) =>
                {//Called when a IRC server's 322 RPL_LIST "channel # visible :topic" response to a LIST message.
                    m_usersCount += e.ListState.Channel.UsersCount;
                    ConsoleLine("ListReply: channels = " + m_client.Channels.Count() + " users = " + m_usersCount + " " + e.ListState.Channel.Name);
                };
                m_client.ListError += (s, e) =>
                {
                    ConsoleError("ListError: " + e.Error);
                    Program.ReadKey();
                };
                m_client.UserJoinedChannel += (s, e) =>
                {
                    //m_userIndex = 0;
                    ConsoleWriteLine("The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel. Joined to " + m_client.User.Channels.Count() + " channels");
                    if (e.User.Nick == Program.m_client.User.Nick)
                    {
                        Program.timerElapsedCount = 0;
                        Program.timer.Stop();
                    }
                    //else ConsoleWriteLine("Do not stop timer");

                    try
                    {
                        Program.DBIRCChat = Program.db.DBIRCChats
                            .Where(u => u.Name == e.Channel.Name && u.DBIRCServersId == Program.DBIRCServer.Id)
                            .FirstOrDefault();
                        if (DBIRCChat == null)
                        {
                            Program.db.DBIRCChats.Add(new IRCClient.DBIRCChat()
                            {
                                Name = e.Channel.Name,
                                DBIRCServersId = Program.DBIRCServer.Id
                            });
                            Program.db.SaveChanges();
                        }
                    }
                    catch (SqlException ex)
                    {
                        strError = ex.ToString();
                    }
                    catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
                    {
                        strError = ex.ToString();
                    }
                    catch (Exception ex)
                    {
                        strError = ex.ToString();
                    }
                    if (strError != "")
                    {
                        ConsoleError(strError);
                        Program.db = new ChatContainer();
                        Program.ConnectToIRCServerTimer();
                        return;
                    }

                    m_channel = e.Channel;
                };
                m_client.UserPartedChannel += (s, e) =>
                {
                    ConsoleWriteLine("The " + e.User.Nick + " user has parted the " + e.Channel.Name + " channel.");
                    if(e.User.Nick == Program.m_client.User.Nick)
                        JoinChannelNext();
                };
                m_client.NetworkError += (s, e) =>
                {
                    if (m_boDisconnected)
                    {
                        //m_boDisconnected = false;
                        return;
                    }
                    ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
                        
                    switch (e.SocketError)
                    {
                        /*
                        case System.Net.Sockets.SocketError.TimedOut:
                            ConsoleWriteLine("Connect to internet failed!");
                            //m_client.Disconnect();
                            break;
                        */
                        //case System.Net.Sockets.SocketError.ConnectionAborted://Close listening in the Port Sniffer app
                        case System.Net.Sockets.SocketError.TimedOut:
                        case System.Net.Sockets.SocketError.HostNotFound:
                        case System.Net.Sockets.SocketError.ConnectionRefused://IRC client. "irc.icq.com:6667"  Group: "IrCQNet" Name: "Random" m_IRCServerIndex = 108
                        case System.Net.Sockets.SocketError.ConnectionAborted://Выскакивает в забаненном сервере если предыдущий сервер был тоже забанен.
                                                                                //Для теститровпния присоединялся по очереди к забаненым:
                                                                                //irc.au.dal.net возвращает ERR_YOUREBANNEDCREEP 465 * :A-banned: [AKILL ID:1487486418K-a] [exp/fldhst] Exploited host, go to http://kline.dal.net/exploits/akills.htm (2017/02/19 03.02) 
                                                                                //irc.eu.dal.net происходит исключение System.IO.IOException с System.Net.Sockets.SocketError.ConnectionAborted
                            ConnectToIRCServer();
                            break;
                    }
                }; 
                m_client.MessageError += (s, e) =>
                {//сюда попадает когда компьютер подключен к локальной сети по WiFi
                    ConsoleError("MessageError: " + e.Error.ToString());
                    Program.ReadKey();
                };
                m_client.Error += (s, e) =>
                {
                    string message = e.Error.Message + ((e.Error.InnerException == null) ? "" : " " + e.Error.InnerException.Message);
                    /*
                    foreach(var InnerException in e.Error.InnerExceptions)
                    {
                        message += InnerException.Message;
                    }
                    */
                    ConsoleError(message);

                    //IRC client. "irc.teksavvy.ca:6667"  Group: "EFnet" Name: "CA, ON," m_IRCServerIndex = 13
                    if (e.Error.HResult == -2147024809)//(VSConstants.E_INVALIDARG https://msdn.microsoft.com/en-us/library/microsoft.visualstudio.vsconstants.e_invalidarg.aspx?f=255&MSPPError=-2147217396)
                        ConnectToIRCServer();
                };
                m_client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
                m_client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);
                m_client.ErrorReply += (s, e) =>
                {
                    switch (e.Message.Command)
                    {
                        case "405"://ERR_TOOMANYCHANNELS "<channel name> :You have joined too many \ channels"
                            Program.joinedChannelsLimit = Program.m_client.User.Channels.Count();
                            ConsoleWriteLine(e.Message.RawMessage + ". Program.joinedChannelsLimit = " + Program.joinedChannelsLimit);
                            JoinChannelNext();
                            return;
                        case "401"://ERR_NOSUCHNICK "<nickname> :No such nick/channel"
                        case "465"://ERR_YOUREBANNEDCREEP ":You are banned from this server"
                            ConsoleWriteLine(e.Message.RawMessage);
                            //Program.ConnectToIRCServer();
                            return;
                        case "404"://ERR_CANNOTSENDTOCHAN "<channel name> :Cannot send to channel"
                        case "471"://ERR_CHANNELISFULL "<channel> :Cannot join channel (+l)"
                        case "473"://ERR_INVITEONLYCHAN "<channel> :Cannot join channel (+i)"
                        case "474":////ERR_BANNEDFROMCHAN "<channel> :Cannot join channel (+b)"
                        case "475"://ERR_BADCHANNELKEY "<channel> :Cannot join channel (+k)"
                        case "477"://"<channel> :Cannot join channel (+r) - you need to be identified with services"
                        case "479"://"<channel> :Illegal channel name
                        case "538"://"<channel1> is linked to <channel2> but <channel2> is not accepting links from <channel1>." reply from irc.swiftirc.net IRC server
                            ConsoleWriteLine(e.Message.RawMessage);
                            JoinChannelNext();
                            return;
                    }
                    ConsoleError(e.Message.RawMessage);
                };

                m_client.UserKicked += (s, e) =>
                {
                    ConsoleWriteLine("UserKicked: Channel: " + e.Channel.Name + ". Kicker: " + e.Kicker.Nick + ". Reason: " + e.Reason);
                    JoinChannelNext();
                };

                m_client.ChannelMessageRecieved += (s, e) =>
                {
                    ConsoleWriteLine(
                            "Channel: " + e.PrivateMessage.Source
                        + " User: " + e.PrivateMessage.User.Nick
                        + " MessageRecieved: " + e.IrcMessage.Command + " " + e.PrivateMessage.Message);
                    if (!m_client.Channels.Contains(e.PrivateMessage.Source))
                    {//Сюда попадает когда приватное сообщение приходит от пользователя из канала, которого нет в списке каналов
                        //для проверки зайти на irc.us.dal.net:6667
                        //ConsoleError("The " + e.PrivateMessage.Source + " key was not present in the dictionary.");
                        return;
                    }
                    var channel = m_client.Channels[e.PrivateMessage.Source];

                    if (e.PrivateMessage.Message == ".list")
                        channel.SendMessage(string.Join(", ", channel.Users.Select(u => u.Nick)));
                    else if (e.PrivateMessage.Message.StartsWith(".ban "))
                    {
                        if (!channel.UsersByMode['@'].Contains(m_client.User))
                        {
                            channel.SendMessage("I'm not an op here!");
                            return;
                        }
                        var target = e.PrivateMessage.Message.Substring(5);
                        m_client.WhoIs(target, whois => channel.ChangeMode("+b *!*@" + whois.User.Hostname));
                    }
                };

                m_client.ChannelListRecieved += (s, e) =>
                {
                    ConsoleWriteLine("ChannelListRecieved: channel: " + e.Channel.Name + " channel.Users.Count = " + e.Channel.Users.Count());
                    //Program.JoinChannelNext();
                    //return;
                    if (m_client.Channels.Count() == 0)
                    {
                        ConsoleError("m_client.Channels.Count() = " + m_client.Channels.Count());
                        return;
                    }
                    //ConsoleWriteLine("Users count: " + e.Channel.Users.Count());
                    for(int i = 0; i < e.Channel.Users.Count(); i++)
                    {
                        var u = e.Channel.Users[i];
                        ConsoleLine("Nick: " + u.Nick);// + " mode: " + user.ChannelModes[channel]);
                        if (m_client.User.Nick == u.Nick)
                            continue;
                        if (u.Mode != null)
                            ConsoleWriteLine("user.Mode: " + u.Mode);
/*По скорости ничего не выиграл
                        if(i == e.Channel.Users.Count() - 1)
                            Program.m_client.WhoIs(u.Nick, Program.WhoIsEnd);
                        else
                            Program.m_client.WhoIs(u.Nick, Program.WhoIs);
                        boWhoIs = true;
*/
                    }
                    Console.WriteLine("");

                    foreach (var user in e.Channel.Users)
                    {
                        if (user.WhoIs != null)
                            continue;
                        /*
                        string myNick = "pc2014";
                        if (user.Nick != myNick)
                            continue;
                        */
//                            ConsoleWriteLine("whois: userIndex = " + 1 + " of " + (e.Channel.Users.Count() - 1) + " " + e.Channel.Name + ". " + user.Nick);
//ChatSharp.IrcUser user2 = new ChatSharp.IrcUser("lkjhlkjhlkjh");

                        Program.m_client.WhoIs(user, Program.WhoIs, 1, e.Channel.Name, e.Channel.Users.Count());
                        return;
                    }
                    Program.JoinChannelNext();
                }; 
                m_client.UserMessageRecieved += (s, e) =>
                {
                    ConsoleWriteLine("");
                    ConsoleWriteLine("UserMessageRecieved: " + e.PrivateMessage.Source + " :" + e.PrivateMessage.Message, ConsoleColor.Green);
                    Program.UserMessageRecieved(e.PrivateMessage);
                    if (e.PrivateMessage.Message == "\u0001VERSION\u0001")
                        return;
                    Program.SendPrivateMessage(e.PrivateMessage.Source);
                };

                m_client.Disconnected += (s, e) =>
                {
                    if (m_boDisconnected)
                        return;
                    m_boDisconnected = true;
                    ConsoleWriteLine("Disconnected. " + (e.Message == null ? "" : ". " + e.Message.Parameters[0]));
                    ConsoleWriteLine("");
                    ConnectToIRCServer();
                };

                m_boDisconnected = false;
//System.Diagnostics.Trace.WriteLine("m_client.ConnectAsync() " + Program.m_client.ServerAddress);
                m_client.ConnectAsync(); 
            }
            catch (SqlException ex)
            {
                strError = ex.ToString();
            }
            catch (Exception e)
            {
                strError = e.ToString();
            }
            if (strError != "")
            {
                ConsoleError(strError);
            }
        }
        static void Main(string[] args)
        {
            db = new ChatContainer();
            
            Program.timer.Elapsed += (sender, e) =>
            {
                //Не получен ответ JOIN
                //For testing connect to "irc.azzurra.org:6667"  Group: "Azzurra" Name: "Random" m_IRCServerIndex = 60
                Program.timerElapsedCount++;
                const uint timerElapsedCountMax = 3;
                Program.ConsoleWriteLine("Join channel timeout " + Program.timerElapsedCount + " of " + timerElapsedCountMax);
                Program.timer.Stop();
                if((Program.timerElapsedCount > timerElapsedCountMax))// && (!Program.timerPrivmsg.Enabled))
                {
                    ConsoleError("Reconnect to " + Program.m_client.ServerAddress + " server");
                    //Program.ConnectToIRCServerTimer();
                    Program.connect = Connect.Reconnect;
                    Program.m_client.Quit("Join channel timeout.");
                    return;
                }
                Program.JoinChannelNext();

                //Работает, но при отключении от сервера я не смогу получать приватные ответы отдельных пользвателей на мое приветствие
                //На сервере irc.dal.net как только появится это таймаут, то невозможно войти ни в один канал - опять возникает тайм аут
                //Поэтому отключаюсь от сервера
//                m_client.Quit("Join to channel timeout");
                // и подключаюсь к нему снова
//                m_IRCServerIndex--;
//                m_channelIndex++;
                // а индекс канала не обнуляю что бы продолжить с текущего канала
//                Program.boJoinToChannelTimeout = true;

            };

            Program.timerConnectToIRCServer.Elapsed += (sender, e) =>
            {
                Program.timerConnectToIRCServer.Stop();
                switch (Program.connect)
                {
                    case Connect.Reconnect:
                        Program.ConnectToIRCServerTimer();
                        break;
                    case Connect.Next:
                    case Connect.Default:
                        Program.ConnectToIRCServerNext();
                        break;
                    default:
                        ConsoleError("Invalid Program.connect = " + Program.connect);
                        break;
                }
                Program.connect = Connect.Default;
            }; 

            Program.timerQuit.Elapsed += (sender, e) =>
            {
                Program.timerQuit.Stop();
                m_client.Quit();
            };

            Program.timerQuitWaitPrivmsg.Elapsed += (sender, e) =>
            {
                Program.timerQuitWaitPrivmsgCount++;
                if (Program.timerQuitWaitPrivmsgCount < Program.timerQuitWaitPrivmsgCountMax)
                {
                    ConsoleLine("Waiting of private message " + (Program.timerQuitWaitPrivmsgCountMax - Program.timerQuitWaitPrivmsgCount) + " minutes");
                    return;
                }
                Program.timerQuitWaitPrivmsg.Stop();
                m_client.Quit("Wait Privmsg time elapsed");
            };

            Program.m_IRCServerIndex = (int)m_myRegistry.ReadDWord(m_registryIRCServerIndex, (uint)m_IRCServerIndex);
            Program.ConnectToIRCServerTimer();
            
            /*
            IrcClient client = new IrcClient("irc.freenode.net"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress);
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.Quit();
            };
            client.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
                client = new IrcClient("irc.swiftirc.net"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                    , new IrcUser("ChatSharp", "ChatSharp"));
                client.ConnectAsync();
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */

            /*
Please see messages (---<---) and replies (--->---) of joining to
channel and quit from server another user.

---<--- NICK ChatSharp
---<--- USER ChatSharp hostname servername :ChatSharp
...
---<--- True JOIN #MyChannel
--->--- 221 ChatSharp :+ixpemJMn
---<--- True WHOIS ChatSharp
--->--- ChatSharp!ChatSharp@=Tujtt.66.70.188.95.dsl.krasnet.ru JOIN
:#MyChannel
--->--- 331 ChatSharp #MyChannel :No topic is set.
--->--- 353 ChatSharp = #MyChannel :ChatSharp Guest18573

new user with Hostmask "Guest18573!@" was added into IrcClient.Users

--->--- 366 ChatSharp #MyChannel :End of /NAMES list.
...
--->--- Anhr!Anhr@=Tujtt.66.70.188.95.dsl.krasnet.ru JOIN :#MyChannel

another user with Hostmask "Anhr!Anhr@Tujtt.66.70.188.95.dsl.krasnet.ru"
was added into IrcClient.Users

--->--- Anhr!Anhr@=Tujtt.66.70.188.95.dsl.krasnet.ru QUIT :Connection
Closed

The Anhr user was disconnected from server and was removed from
IrcClient.Users

--->--- Guest18573!Anna@=Tujtt.66.70.188.95.dsl.krasnet.ru QUIT
:Connection Closed

The Guest18573 user was disconnected from server but NOT removed from
IrcClient.Users because Hostmask
"Guest18573!Anna@=Tujtt.66.70.188.95.dsl.krasnet.ru" is not equal of the
Hostmask "Guest18573!@" in IrcClient.Users. See IrcUser.Equals(IrcUser
other) for details.

See my code for resolving of issue https://github.com/SirCmpwn/ChatSharp/pull/65/commits/666a338c0646f065beb529499d19c559dc8eb34b
*/
            /*
            IrcClient client = new IrcClient("irc.webmaster.com"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress);
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.JoinChannel(Program.MyChannel);
            };
            client.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */
            /*
            пользователь ChatSharp заходит на сервер

            пользователь ChatSharp заходит на #MyChannel канал
            RawMessageRecieved: False :ChatSharp!~ChatSharp@stc.66.70.188.95.dsl.krasnet.ru JOIN :#MyChannel
            var channel = client.Channels.GetOrAdd(message.Parameters[0]); появляется канал #MyChannel
            var user = client.Users.GetOrAdd(message.Prefix); появляется пользователь ChatSharp
            user.Channels.Add(channel); у пользователя ChatSharp ноявляется канал #MyChannel

            пользователь darev заходит на сервер
            пользователь darev заходит на #MyChannel канал
            var channel = client.Channels.GetOrAdd(message.Parameters[0]); не добавляется никаких каналов
            var user = client.Users.GetOrAdd(message.Prefix); в списке два пользователя: ChatSharp и darev
            user.Channels.Add(channel); у пользователя darev ноявляется канал #MyChannel

            пользователь darev выходит с #MyChannel канала
            var user = client.Users.Get(message.Prefix);//darev
            var channel = client.Channels[message.Parameters[0]];//#MyChannel
            if (user.Channels.Contains(channel))
                user.Channels.Remove(channel); удаляется канал #MyChannel у пользователя darev
            client.OnUserPartedChannel(new ChannelUserEventArgs(client.Channels[message.Parameters[0]],
                new IrcUser(message.Prefix)));
            client.Channels.Remove(channel);//Думаю тут зря удаляется канал #MyChannel

            пользователь ChatSharp выходит с #MyChannel канала.
            тут оказывается что канала #MyChannel нет в client.Channels
            https://github.com/SirCmpwn/ChatSharp/pull/65/commits/e63e476ab3111a04669076497d77c229fbf59e75
            */
            /*
            IrcClient clientDarev = null;
            IrcClient clientChatSharp = new IrcClient("irc.webmaster.com"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + clientChatSharp.ServerAddress);
            clientChatSharp.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ChatSharp. ConnectionComplete.");
                clientChatSharp.JoinChannel(Program.MyChannel);
            };
            clientChatSharp.UserJoinedChannel += (s, e) =>
            {
                ConsoleWriteLine("ChatSharp. The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel. Joined to " + clientChatSharp.User.Channels.Count() + " channels");
                if (clientDarev != null)
                    return;
                clientDarev = new IrcClient("irc.webmaster.com"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                    , new IrcUser("Darev", "Darev"));
                clientDarev.ConnectionComplete += (sDarev, eDarev) =>
                {
                    ConsoleWriteLine("Darev ConnectionComplete.");
                    clientDarev.JoinChannel(Program.MyChannel);
                };
                clientDarev.UserJoinedChannel += (sDarev, eDarev) =>
                {
                    ConsoleWriteLine("Darev. The " + eDarev.User.Nick + " user has joined to the " + eDarev.Channel.Name + " channel. Joined to " + clientDarev.User.Channels.Count() + " channels");
                    clientDarev.PartChannel(Program.MyChannel);
                };
                clientDarev.UserPartedChannel += (sDarev, eDarev) =>
                {
                    ConsoleWriteLine("Darev. The " + eDarev.User.Nick + " user has parted the " + eDarev.Channel.Name + " channel.");
                    clientChatSharp.PartChannel(Program.MyChannel);
                };
                clientDarev.Disconnected += (sDarev, eDarev) =>
                {
                    ConsoleWriteLine("Darev disconnected." + (eDarev.Message == null ? "" : " " + eDarev.Message.Parameters[0]));
                };

                clientDarev.NetworkError += (sDarev, eDarev) =>
                {
                    ConsoleError("Darev. Network: " + new Win32Exception((int)eDarev.SocketError).Message);
                };
                clientDarev.Error += (sDarev, eDarev) =>
                {
                    ConsoleError("Darev " + eDarev.Error.ToString());
                };
                clientDarev.RawMessageSent += (sDarev, eDarev) => System.Diagnostics.Trace.WriteLine("RawMessageSentDarev: " + eDarev.Outgoing + " " + eDarev.Message);
                clientDarev.RawMessageRecieved += (sDarev, eDarev) => System.Diagnostics.Trace.WriteLine("RawMessageRecievedDarev: " + eDarev.Outgoing + " " + eDarev.Message);

                clientDarev.ConnectAsync();
            };
            clientChatSharp.UserPartedChannel += (s, e) =>
            {
                ConsoleWriteLine("ChatSharp. The " + e.User.Nick + " user has parted the " + e.Channel.Name + " channel.");
            };
            clientChatSharp.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("ChatSharp. Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            clientChatSharp.NetworkError += (s, e) =>
            {
                ConsoleError("ChatSharp. Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            clientChatSharp.Error += (s, e) =>
            {
                ConsoleError("ChatSharp. " + e.Error.ToString());
            };
            clientChatSharp.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("RawMessageSentChatSharp: " + e.Outgoing + " " + e.Message);
            clientChatSharp.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("RawMessageRecievedChatSharp: " + e.Outgoing + " " + e.Message);

            clientChatSharp.ConnectAsync();
            */
            /*
            IrcClient client = new IrcClient("open.ircnet.net"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress + "\"");
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.JoinChannel(Program.MyChannel);
            };
            client.UserJoinedChannel += (s, e) =>
            {
                ConsoleWriteLine("The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel. Joined to " + client.User.Channels.Count() + " channels");
            };
            client.ChannelListRecieved += (s, e) =>
            {
                ConsoleWriteLine("ChannelListRecieved: channel: " + e.Channel.Name + " channel.Users.Count = " + e.Channel.Users.Count());
                if (client.Channels.Count() == 0)
                {
                    ConsoleError("client.Channels.Count() = " + client.Channels.Count());
                    return;
                }
                if (e.Channel.Users.Count() == 0)
                {
                    ConsoleError("e.Channel.Users.Count() = " + e.Channel.Users.Count());
                    return;
                }
                //foreach (var u in e.Channel.Users)
                for (int i = 0; i < e.Channel.Users.Count(); i++)
                {
                    var u = e.Channel.Users[i];
                    ConsoleWriteLine("Nick: " + u.Nick);// + " mode: " + user.ChannelModes[channel]);
                    
                    if (u.WhoIs != null)
                        continue;
                    
                    if (client.User.Nick == u.Nick)
                        continue;

                    if (i == e.Channel.Users.Count() - 1)
                        client.WhoIs(u.Nick, whois=> {
                            ConsoleWriteLine("WhoIs: " + whois.User.Nick);
                            string channelName = Program.MyChannel + "1";
                            if (client.User.Channels.Contains(channelName))
                                return;
                            client.JoinChannel(channelName);
                        });//, Program.WhoIsEnd);
                    else
                        client.WhoIs(u.Nick, whois => {
                            ConsoleWriteLine("WhoIs: " + whois.User.Nick);
                        });//, Program.WhoIs);
                    //boWhoIs = true;
                }
            };
            client.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */
            /*
            //RPL_CHANNELMODEIS reply handler
            //https://github.com/SirCmpwn/ChatSharp/pull/67/commits/2e5a7538dc14792bedc83730d9effd59ae530b69
            IrcClient client = new IrcClient("irc.freenode.net"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress);
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.JoinChannel(Program.MyChannel);
            };
            client.UserJoinedChannel += (s, e) =>
            {
                ConsoleWriteLine("The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel. Joined to " + client.User.Channels.Count() + " channels");
                //client.PartChannel(Program.MyChannel);
            };
            client.ModeChanged += (s, e) =>
            {
                ConsoleWriteLine("ModeChanged: target: " + e.Target + ", change: \"" + e.Change + "\", Nick: " + e.User.Nick);
                //client.PartChannel(Program.MyChannel);
            };
            client.UserPartedChannel += (s, e) => 
            {
                ConsoleWriteLine("The " + e.User.Nick + " user has parted the " + e.Channel.Name + " channel.");
                //client.GetMode(Program.MyChannel.ToLower());
                client.JoinChannel(Program.MyChannel);
            };
            client.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */
            /*
            //Channel names is not case sensetive
            //https://github.com/SirCmpwn/ChatSharp/pull/68/commits/695a55d78b7d8727e6b36ff28980fea7b6808e18
            IrcClient client = new IrcClient("irc.freenode.net"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress);
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.JoinChannel(Program.MyChannel);
            };
            client.UserJoinedChannel += (s, e) =>
            {
                ConsoleWriteLine("The " + e.User.Nick + " user has joined to the " + e.Channel.Name + " channel. Joined to " + client.User.Channels.Count() + " channels");
                client.JoinChannel(Program.MyChannel);
            };
            client.ModeChanged += (s, e) =>
            {
                ConsoleWriteLine("ModeChanged: target: " + e.Target + ", change: \"" + e.Change + "\", Nick: " + e.User.Nick);
                //client.PartChannel(Program.MyChannel);
            };
            client.UserPartedChannel += (s, e) =>
            {
                ConsoleWriteLine("The " + e.User.Nick + " user has parted the " + e.Channel.Name + " channel.");
                //client.GetMode(Program.MyChannel.ToLower());
            };
            client.Disconnected += (s, e) =>
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */
            /*
            //WHOIS exception
            //https://github.com/SirCmpwn/ChatSharp/pull/70
            IrcClient client = new IrcClient("irc.inet.tele.dk"//"irc.dal.net:6660"//"irc.swiftirc.net"//"irc.freenode.net"//"irc.webmaster.com"//"localhost"//"InvalidAddress:1234"//DBIRCServers.URL + (DBIRCServers.Port == null ? "" : ":" + DBIRCServers.Port)
                , new IrcUser("ChatSharp", "ChatSharp"));

            ConsoleWriteLine("IRC client. \"" + client.ServerAddress);
            client.ConnectionComplete += (s, e) =>
            {
                ConsoleWriteLine("ConnectionComplete.");
                client.JoinChannel(Program.MyChannel);
            };
            client.ChannelListRecieved += (s, e) =>
            {
                ConsoleWriteLine("ChannelListRecieved: channel: " + e.Channel.Name + " channel.Users.Count = " + e.Channel.Users.Count());
                var user = e.Channel.Users[1];
                ConsoleWriteLine("WhoIs(" + user.Nick + ")");
                client.WhoIs(user);
                
                if(user.WhoIs == null)
                    client.WhoIs(user);
                
                try
                {
                    client.WhoIs(user.Nick);
                }
                catch (Exception exception)
                {
                    ConsoleError(exception.ToString());
                }
                
            };
            client.Disconnected += (s, e) => 
            {
                ConsoleWriteLine("Disconnected." + (e.Message == null ? "" : " " + e.Message.Parameters[0]));
            };

            client.NetworkError += (s, e) =>
            {
                ConsoleError("Network: " + new Win32Exception((int)e.SocketError).Message);
            };
            client.Error += (s, e) =>
            {
                ConsoleError(e.Error.ToString());
            };
            client.RawMessageSent += (s, e) => System.Diagnostics.Trace.WriteLine("---<---" + e.Message);
            client.RawMessageRecieved += (s, e) => System.Diagnostics.Trace.WriteLine("--->---" + e.Message);

            client.ConnectAsync();
            */

            while (true) ; // Waste CPU cycles
        }
    }
}
