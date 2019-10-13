using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace IRCBot
{
    /// <summary>
    /// Строка из представления ViewIRCNS в котором перечислены все IRC серверы к которым я присоединяю пользователей с сайта https://chaturbate.com/ .
    /// А так же тут указаны данные, которые используются для присоединения к IRC серверу пользователей с сайта https://chaturbate.com/
    /// </summary>
    public class MyIRCServer// : IRCBot.ViewIRCNS убрал базовый класс для устранения дублирования MaxConnections и NextConnectionDelay
                            //которые есть еще в MyCommon.NextConnectionLimit
    {
        /// <summary>
        /// for new JavaScriptSerializer().Deserialize<MyIRCServer>(JSONIRCServer)
        /// in IRCBot.ChatHub.ircConnect
        /// </summary>
        public MyIRCServer() { }
        public MyIRCServer(IRCBot.ViewIRCNS IRCServer, IRCBot.Chaturbate.user chaturbate)
        {
            this.copyViewIRCNS(IRCServer);
            this.chaturbate = chaturbate;
        }
        public MyIRCServer(string URL, string Nick)
        {
            this.Nick = Nick;
            this.URL = URL;
        }
        /// <summary>
        /// </summary>
        /// <param name="IRCServer">запись в таблите db.ViewIRCNS в которой перечислены все IRC серверы, к которым может подключиться IRCBot</param>
        public MyIRCServer(IRCBot.ViewIRCNS IRCServer) { this.copyViewIRCNS(IRCServer); }
        private void copyViewIRCNS(IRCBot.ViewIRCNS IRCServer)
        {
            this.Email = IRCServer.Email;
            this.Id = IRCServer.Id;
            this.Nick = IRCServer.Nick;
            this.Pass = IRCServer.Pass;
            this.Port = IRCServer.Port;
            this.URL = IRCServer.URL;
//            base.MaxConnections = IRCServer.MaxConnections;
//            base.NextConnectionDelay = IRCServer.NextConnectionDelay;
        }
        private int Id { get; set; }
        public string URL { get; private set; }
        private System.Nullable<short> Port { get; set; }
        public string Nick { get; private set; }
        private string Email { get; set; }
        public string Pass { get; private set; }
//        public Nullable<short> MaxConnections { get; set; }
//        public Nullable<int> NextConnectionDelay { get; set; }
        /// <summary>
        /// Присоеденить к IRC серверу пользователя, транаслирующего на сайте https://chaturbate.com/
        /// </summary>
        /// <param name="ServerHostname">IRC server address</param>
        /// <param name="Nick"></param>
        /// <param name="Chaturbate">Chaturbate user</param>
        /// <param name="NextConnectionDelay">Задержка в миллисекундах присоединения к IRC серверу следующего пользователя.
        /// Нужно чтобы не забанили на IRC сервере за флуд
        /// </param>
        public MyIRCServer(string ServerHostname, string Nick, IRCBot.Chaturbate.user Chaturbate)//, int? NextConnectionDelay)
        {
            this.URL = ServerHostname;
            this.Nick = Nick;
            this.chaturbate = Chaturbate;
//            base.NextConnectionDelay = NextConnectionDelay;
        }
        /// <summary>
        /// Chaturbate user
        /// </summary>
        public IRCBot.Chaturbate.user chaturbate;
        public string serverAddress() { return this.URL + (this.Port != null ? ":" + this.Port : "");}
    }
    public class MyIrcClient : ChatSharp.IrcClient
    {
        /// <summary>
        /// ChatSharp.IrcClient пользователя
        /// </summary>
        /// <param name="chatHub"></param>
        /// <param name="IRCServer"></param>
        /// <param name="user">The IRC user to connect as.</param>
        /// <param name="Chaturbate">Chaturbate user</param>
        /// <param name="useSSL">Connect with SSL if true.</param>
        public MyIrcClient(//ChatHub chatHub,
            MyIRCServer IRCServer, ChatSharp.IrcUser user, IRCBot.Chaturbate.user Chaturbate, bool useSSL = false)
            : base(IRCServer.serverAddress(), user, useSSL)
        {
            base.timeoutConnectIRCServer = 30000;
//            this.chatHub = chatHub;
            this.chaturbateUser = Chaturbate;
        }
        /// <summary>
        /// Connects to the IRC server.
        /// </summary>
        public new void ConnectAsync()
        {
            if (this.chaturbateUser != null)
                // Возможен случай когда 
                //this.videoState = MyIrcClient.VideoState.Stopped
                //и произошло отключение пользователя от сервера
                // IRCClient.Disconnected
                // по причине
                // ERROR :Closing Link: 95.188.70.66 (Too many user connections (global)))
                // Если я не установлю это состояние то остановится Connect all users
                // Что приведет к тому что не будет периодически обновляться список посетителей с сайта chaturbate
                // До конца не разобрался почему это иногда происходит
                // Возможно я посылаю на IRC сервер команду 
                // Quit("playing of the video was stopped")
                // а в ответ получаю сообщение ERROR :Closing Link: 95.188.70.66 (Too many user connections (global))
                this.videoState = MyIrcClient.VideoState.Started;
            System.Threading.Tasks.Task.Run(() =>
            {
                if (this.isConnected())
                {
                    Trace.Fail("Disconnect the IRC server before connecting.");
                    return;
                }
                base.ConnectAsync();
            });
        }
        /// <summary>
        /// IRCBot.MyIrcClient.channelsList item
        /// </summary>
        public class Channel : IRCBot.ViewIRCCS
        {
            /// <summary>
            /// Constructor
            /// </summary>
            /// <param name="channel">Запись из базы данных таблица ViewIRCCS</param>
            /// <param name="chatHub"></param>
            public Channel(IRCBot.ViewIRCCS channel, IRCBot.ChatHub chatHub)
            {
                base.Id = channel.Id;
                base.ViewIRCNSId = channel.ViewIRCNSId;
                base.URL = channel.URL;
                base.Name = channel.Name;
                base.Topic = channel.Topic;
                base.Pass = channel.Pass;

//                this.chatHub = chatHub;
            }
            private ChatHub chatHub
            {
                get { return IRCBot.ChatHub.chatHub; }
                set { Trace.Fail("set chatHub is not allowed"); }
            }
/*
            public void SetChatHub(ChatHub chatHub)
            {
                if (this.chatHub != null)
                    return;
                this.chatHub = chatHub;
            }
*/
            /// <summary>
            /// false: default. На веб странице не готов IRC канал или список посетителей с сайта chaturbate.
            ///     Поэтому на IRC канал нельза добалять нового посетителя.
            ///     Это иногда может произойти после обновления веб станицы когда к IRC серверу автоматически добавляются посетители с сайта chaturbate
            /// true: на веб странице готов IRC канал, на который можно добавить нового посетителя. тоесть вызвалась this.ircChanelCreated().
            ///     Если this.User != null тоесть есть посетитель, которого не удалось добавить на IRC канал после обновления веб страницы,
            ///     то он будет добавлен когда обновится список посетителей с сайта chaturbate. Тоесть вызовется this.chaturbateUsersReady()
            /// </summary>
            /// <remarks>
            /// Иногда после обновления веб страницы посетитель добавляется на канал, который еще не успел добавиться на веб страницу
            /// а так же еще не получен список посетителей с сайта chaturbate.
            /// Другими словами
            /// chat.client.onIRCUserJoinedChannel
            /// вызывается до того как завершилось выполнение 
            /// chat.client.onChannel
            /// и вызвалась функция 
            /// chaturbateUsersReady()
            /// В этом случае появится сообшение об ошибке
            /// 4.815: findIRCChannel(irc.freenode.net, videochat) failed! Add channel first.
            /// 4.817: chat.client.onIRCUserJoinedChannel(irc.freenode.net, nick: mariahpinkkitty, channelName: #videochat) failed! Add channel first.
            /// 4.997 bonalink: chaturbateList is empty
            /// 
            /// В этом случае надо:
            ///     Если this.ready == false то не вызывать chat.client.onIRCUserJoinedChannel а запомнить параметры в 
            ///     IRCBot.MyIrcClient.Channel.User и IRCBot.MyIrcClient.Channel.prefix.
            /// 
            ///     Дождаться когда вызовется this.ircChanelCreated() - IRC канал создан
            ///     this.ready = true
            /// 
            ///     Дождаться завершения вывода на веб страницу пользоватеоей с сайта chaturbate в функции IRCBot.MyIRCClients.chaturbateUsers()
            ///     которая вызывает IRCBot.MyIrcClient.Channel.chaturbateUsersReady().
            ///     и оттуда вызвать chat.client.onIRCUserJoinedChannel с парамертами 
            ///     IRCBot.MyIrcClient.Channel.User и IRCBot.MyIrcClient.Channel.prefix.
            ///     Затем
            ///     IRCBot.MyIrcClient.Channel.User = null
            ///     и IRCBot.MyIrcClient.Channel.prefix = null.
            /// 
            /// Для теститрования использовал irc.freenode.net
            /// </remarks>
            private bool ready = false;
            /// <summary>
            /// Здесь запоминается пользователь, который join to channel до того, как этот chsnnel был добавлен на веб страницу
            /// </summary>
            /// <remarks>Детали смотри в IRCBot.MyIrcClient.Channel.ready</remarks>
            private ChatSharp.IrcUser User;
            private char? prefix;
            /// <summary>
            /// Occurs when a user joins a channel.
            /// </summary>
            /// <param name="User"></param>
            /// <param name="prefix"></param>
            public void Joined(ChatSharp.IrcUser User, char? prefix)
            {
                if(this.ready)
                {
                    if(this.chatHub != null)
                        this.chatHub.Clients.All.onIRCUserJoinedChannel(base.URL, User.Nick, "#" + base.Name,
                            new { User.Nick, User.ChannelModes, User.Hostmask }, prefix);
                    return;
                }
                if (this.chatHub == null)
                    return;//Веб страница IRCBot вообще не открывалась. IRCBot был запущен из BotStarter
                if (this.User != null)
                    Trace.Fail("IRCBot.MyIrcClient.Channel.Joined(...) failed! this.User != null");
                this.User = User;
                this.prefix = prefix;
            }
            /// <summary>
            /// IRC channel was successfully added in to web page
            /// </summary>
            public void ircChanelCreated()
            {
                if (this.ready)
                    Trace.Fail("IRCBot.MyIrcClient.Channel.ircChanelCreated() failed! Set this.ready = true twise");
                this.ready = true;
            }
            /// <summary>
            /// Список посетителей сайта chaturbate готов. Добавить на IRC канал посетителя который еще не добавлен после обновления веб страницы
            /// </summary>
            public void chaturbateUsersReady()
            {
/*
                if (this.ready)
                    Trace.Fail("IRCBot.MyIrcClient.Channel.ircChanelCreated() failed! Set this.ready = true twise");
                this.ready = true;
*/
                if (this.User == null)
                    return;
                Trace.WriteLine("IRCBot.MyIrcClient.Channel.ircChanelCreated() onIRCUserJoinedChannel(" + base.URL + ", " + this.User.Nick + ", #" + base.Name + ", ...)");
                this.chatHub.Clients.All.onIRCUserJoinedChannel(base.URL, this.User.Nick, "#" + base.Name,
                        new { this.User.Nick, this.User.ChannelModes, this.User.Hostmask }, this.prefix);
                this.User = null;
                this.prefix = null;
            }
            /// <summary>
            /// Add IRC channel into web page
            /// </summary>
            /// <param name="IRCServer">Current IRC server</param>
            /// <param name="joined">true: current user is joined to the current IRC channel</param>
            /// <param name="resetReady">true: set IRCBot.MyIrcClient.Channel.ready to false</param>
            /// <remarks>
            /// Для чего нужно resetReady?
            /// IRC канал может выводиться на веб страницу для владельца канала или для посетителя с сайта Chaturbate.
            /// 
            /// Для владельца канала надо каждый раз сбрасывать this.ready что бы не появлялось сообщение об ошибке
            /// IRCBot.MyIrcClient.Channel.ircChanelCreated() failed! Set this.ready = true twise
            /// после обновления веб страницы во время автоматического присоединения к IRC серверу всех посетителей
            /// потому что this.ready = true уже было установлено во время предыдущего открытия веб страницы.
            /// 
            /// Но тогда во время присоединения посетителя на IRC канал, когда вызывается IRCBot.MyIrcClient.Channel.Joined(...)
            /// this.ready = false даже если канал успешо выведен на веб страницу.
            /// Это происходит потому что IRCBot.MyIrcClient.Channel.onChannel(...)
            /// в данном случае вызывается из IRCBot.ChatHub.getChanels()
            /// 
            /// для решения проблемы устанавливаю resetReady = false
            /// если IRCBot.MyIrcClient.Channel.onChannel(...) вызывается из IRCBot.ChatHub.getChanels() 
            /// </remarks>
            public void onChannel(IRCBot.MyIRCServer IRCServer, bool joined, bool resetReady)
            {
                if(resetReady)
                    this.ready = false;
                if(this.chatHub != null)
                    this.chatHub.Clients.All.onChannel(IRCServer, this, joined);
            }
        }
/*
        public void SetChatHub(ChatHub chatHub)
        {
            if (this.channelsList == null)
                return;
            foreach (IRCBot.MyIrcClient.Channel channel in this.channelsList) { channel.SetChatHub(chatHub); }
        }
*/
        /// <summary>
        /// List of channels for current IRC server
        /// </summary>
        /// <remarks>
        /// Этот список имеется только у владельца канала.
        /// Этот список нужен на случай когда приходится изменить название канала
        /// Например когда нет доступа на канал
        /// например на сервере irc.webmaster.com получаю сообщение
        /// "474":ERR_BANNEDFROMCHAN "channel :Cannot join channel (+b)"
        /// 
        /// В этом случае я меняю название канала, присоединяюсь к нему, но уже не могу устновить для него топик
        /// потому что в базе данных топик определен только для старого названия канала
        /// Для решения проблемы я скачиваю из базы данных список каналов только один раз в констркуторе MyIRCServer(IRCBot.ViewIRCNS IRCServer)
        /// В этом списке теперь можно менять имя канала и получить топик уже для этого нового канала
        /// </remarks>
        private System.Collections.Generic.List<Channel> channelsList;// { get; private set; }
        public bool isChanneslList() { return this.channelsList != null; }
        /// <summary>
        /// Gets channels from database and display to web page
        /// </summary>
        /// <param name="chatHub"></param>
        /// <param name="IRCServer">запись в таблите db.ViewIRCNS в которой перечислены все IRC серверы, к которым может подключиться IRCBot</param>
        public void ChannelsList(IRCBot.ChatHub chatHub, IRCBot.ViewIRCNS IRCServer)
        {
            if (this.channelsList == null)
            {//после обновления веб страницы сюда не должно попадать а то будет дублирование каналов
                this.channelsList = new System.Collections.Generic.List<IRCBot.MyIrcClient.Channel>();
                using (var db = new DBChatEntities())
                {
                    foreach (var viewIRCCSItem in db.ViewIRCCS.Where(item => item.ViewIRCNSId == IRCServer.Id))
                    {
                        this.channelsList.Add(new IRCBot.MyIrcClient.Channel(viewIRCCSItem, chatHub));
                    }
                }
            }
            this.ViewChannelsList(new IRCBot.MyIRCServer(IRCServer));
        }
        /// <summary>
        /// Occurs when a user joins a channel.
        /// </summary>
        /// <param name="channelName"></param>
        /// <param name="chatHub"></param>
        /// <param name="User"></param>
        /// <param name="prefix"></param>
        public void ChannelJoined(string channelName, IRCBot.ChatHub chatHub, ChatSharp.IrcUser User, char? prefix)
        {
            if(this.channelsList == null)
            {
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " IRCBot.MyIrcClient.ChannelJoined(" + channelName + ") failed! this.channelsList = null");
                return;
            }
            IRCBot.MyIrcClient.Channel channel = this.channelsList.FirstOrDefault(item => ("#" + item.Name) == channelName);
            if(channel == null)
            {
                
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " IRCBot.MyIrcClient.ChannelJoined(" + channelName + ") failed! channel = null");
                return;
            }
            channel.Joined(User, prefix);
        }
        /// <summary>
        /// Список посетителей сайта chaturbate готов. Добавить на IRC канал посетителя который еще не добавлен после обновления веб страницы
        /// </summary>
        public void chaturbateUsersReady()
        {
            if (this.channelsList == null)
            {//это не владелец канала
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " IRCBot.MyIrcClient.chaturbateUsersReady() failed! this.channelsList = null");
                return;
            }
            this.channelsList.ForEach(delegate (IRCBot.MyIrcClient.Channel channel) { channel.chaturbateUsersReady(); });
        }
        /// <summary>
        /// IRC channel was successfully added in to web page
        /// </summary>
        /// <param name="channelName"></param>
        public void ircChanelCreated(string channelName)
        {
            if (this.channelsList == null)
            {
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " IRCBot.MyIrcClient.ircChanelCreated(" + channelName + ") failed! this.channelsList = null");
                return;
            }
            IRCBot.MyIrcClient.Channel channel = this.channelsList.FirstOrDefault(item => (item.Name) == channelName);
            if (channel == null)
            {

                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " IRCBot.MyIrcClient.ChannelJoined(" + channelName + ") failed! channel = null");
                return;
            }
            channel.ircChanelCreated();
        }
        /// <summary>
        /// display channels to the web page
        /// </summary>
        /// <param name="IRCServer"></param>
        public void ViewChannelsList(IRCBot.MyIRCServer IRCServer, bool resetReady = true)
        {
            foreach (IRCBot.MyIrcClient.Channel channel in this.channelsList)
            {
                Trace.WriteLine("Server: " + IRCServer.URL + " Channel: " + channel.Name);
                channel.onChannel(IRCServer, this.Channels.Contains(IRCBot.ChatHub.channelName(channel.Name)), resetReady);
//                chatHub.Clients.All.onChannel(IRCServer, channel, this.Channels.Contains(IRCBot.ChatHub.channelName(channel.Name)));
            }
        }
        /// <summary>
        /// Войти на все каналы перечисленные для данного IRC сервера если пользователь еще не вошел на них
        /// </summary>
        /// <param name="myIrcClient"></param>
        public void JoinChannelsList(IRCBot.MyIrcClient myIrcClient = null)
        {
            if (myIrcClient == null)
                myIrcClient = this;
            foreach (var viewIRCCSItem in this.channelsList)
            {
                string channelName = "#" + viewIRCCSItem.Name;
                if (!myIrcClient.Channels.Contains(channelName))
                    myIrcClient.JoinChannel(channelName);
            }
        }
        /// <summary>
        /// список топиков которые были попытки установить на данном канале
        /// </summary>
        /// <remarks>
        /// Key: имя канала
        /// Добавил этот список что бы предотвратить дублирующие попытки установить топик канала
        /// </remarks>
        private System.Collections.Generic.Dictionary<string, string> topics = new System.Collections.Generic.Dictionary<string, string>();
        /// <summary>
        /// Retrieves the topic for the specified channel.
        /// </summary>
        public new void GetTopic(string channelName)
        {
            string cn = IRCBot.ChatHub.channelName(channelName);
            if (this.topics.ContainsKey(cn))
                return;//для этого канала уже известен топик и была попытка установить новый топик
            base.GetTopic(cn);
        }
        /// <summary>
        /// Sets the topic for the specified channel.
        /// </summary> 
        public new void SetTopic(string channelName, string topic)
        {
            string cn = IRCBot.ChatHub.channelName(channelName);
            if (this.topics.ContainsKey(cn) && (this.topics[cn] == topic))
                return;//Не надо устанавливать один и тот же топик на канал несколько раз
            Trace.WriteLine("IRCBot.MyIrcClient.SetTopic(ServerURL: " + this.ServerHostname + ", Channel Name: " + channelName + ", topic: " + topic + ")");
            base.SetTopic(cn, topic);
/*do not compatible with irc.dal.net
            if (string.IsNullOrEmpty(this.User.Password))
                base.SetTopic(cn, topic);
            else this.SendRawMessage("ChanServ TOPIC " + cn + " " + topic);
*/
            this.topics.Add(cn, topic);
        }
        public void setTopic(string channelName, string topic, IRCBot.ChatHub chatHub, string nick)
        {
            string URL = this.MySiteIRCChannelURL(channelName);
            foreach (var viewIRCCSItem in this.channelsList.Where
                    (channel => 
                        (channel.Name == channelName.Replace("#", ""))
                        && (string.Format(channel.Topic, URL) != topic)
                    )
                )
            {
                string topicDest = string.Format(viewIRCCSItem.Topic, URL);
                if (topicDest.Length >= this.ServerInfo.MaxTopicLength)
                {
                    topicDest = string.Format(viewIRCCSItem.Topic, IRCBot.MyIrcClient.MySiteIRCURL());
                    if (topicDest.Length >= this.ServerInfo.MaxTopicLength)
                    {
                        IRCBot.ChatHub.rememberMessages.Error(chatHub, this.ServerHostname,
                            "topic: \"" + topicDest + "\" too long. Max length = " + this.ServerInfo.MaxTopicLength, this.User.Nick, null, null);
                        IRCBot.ChatHub.IRCClients[this.ServerHostname].StopConnectAllUsers();
                        return;
                    }
                }
                if((topic != topicDest) && (chatHub != null))
                    chatHub.ircSetTopic(this.ServerHostname, nick, channelName, topicDest);
            }
        }
        public void RenameChannel(string channelName, string newChannelName)
        {
            Trace.Fail("Under constraction. Для проверки надо дождаться получения сообщения 474 ERR_BANNEDFROMCHAN на сервере irc.webmaster.com");
            this.channelsList.SingleOrDefault(channel => channel.Name == channelName.Replace("#", "")).Name = newChannelName.Replace("#", "");
        }
        /// <summary>
        /// IRC channel for joining from this IRCBot application
        /// </summary>
        /// <remarks>
        /// Некоторые IRC серверы irc.webmaster.com банят вход на канал:
        /// 474 ERR_BANNEDFROMCHAN "<channel> :Cannot join channel (+b)"
        /// Для борьбы с этим злом я делаю список каналов IRCBotChannels, к которым должен присоедениться посетитель.
        /// Этот класс - элемент этого списка
        /// Если канал забанен, я прекращаю присоеденять к IRC серверу всех посетителей,
        /// делаю паузу, обновляю список посетителей и снова начинаю присоеденять к IRC серверу всех посетителе
        /// в надежде что канал разбанят.
        /// </remarks>
        private class IRCBotChannel
        {
            /// <summary>
            /// true - 474 ERR_BANNEDFROMCHAN "<channel> :Cannot join channel (+b)"
            ///        reply was received from IRC server
            /// </summary>
            internal bool banned = false;
            /// <summary>
            /// Это число добавляется в имя забаненного канала для того что бы попробовать join на канал с другим именем
            /// </summary>
            private int channelNameIndex = 0;
            /// <summary>
            /// Set the IRCBotChannel.banned member
            /// </summary>
            /// <param name="banned"></param>
            /// <returns>Index of channel name</returns>
            /// <remarks>
            /// Когда канал забанен this.banned == true надо попробовать присоедениться к другому каналу 
            /// имя которого равно имени забаненнного канала плюс IRCBotChannel.channelNameIndex
            /// </remarks>
            public int Banned (bool banned)
            {
                this.banned = banned;
                if (this.banned)
                    this.channelNameIndex++;
                return this.channelNameIndex;
            }
        }
        /// <summary>
        /// Dictionary of the IRC channels for joining from this IRCBot application
        /// </summary>
        /// <remarks>Key: channel name </remarks>
        System.Collections.Generic.Dictionary<string, IRCBotChannel> IRCBotChannels =
            new System.Collections.Generic.Dictionary<string, IRCBotChannel>();
        /// <summary>
        /// The "474"://ERR_BANNEDFROMCHAN "channel :Cannot join channel (+b)"
        /// was received from IRC server
        /// </summary>
        /// <param name="channel"></param>
        /// <param name="banned">
        /// true - The "474":ERR_BANNEDFROMCHAN "channel :Cannot join channel (+b)"
        /// was received from IRC server
        /// </param>
        public void ChannelBanned(string channel, bool banned)
        {
            int channelNameIndex = this.IRCBotChannels[channel].Banned(banned);
            if (!banned)
                return;
            string newChannel = channel + channelNameIndex;
            this.RenameChannel(channel, newChannel);
            if(IRCBot.ChatHub.chatHub != null)
                IRCBot.ChatHub.chatHub.Clients.All.onRenameChannel(this.ServerHostname, this.User.Nick, channel, newChannel);
            this.JoinChannel(newChannel);
        }
        /// <summary>
        /// Trying to join to channel again if this channel was banned before
        /// </summary>
        /// <returns>true - one or more channels was tried to join</returns>
        /// <remarks>
        /// Вызывается из IRCBot.Chaturbate.ConnectAll.Connect
        /// Если до этого посетитель уже был присоединен к IRC серверу,
        /// но войти на канал не удалось по какой либо причине,
        /// например если канал был забанен 
        /// "474":ERR_BANNEDFROMCHAN "channel :Cannot join channel (+b)"
        /// </remarks>
        public bool JoinBannedChannels()
        {
            bool banned = false;
            
            foreach (var IRCBotChannelPair in this.IRCBotChannels)
            {
                if (IRCBotChannelPair.Value.banned)
                {
                    banned = true;
                    base.JoinChannel(IRCBotChannelPair.Key);
                }
            }
            return banned;
        }
        public bool IsChannelBanned(string channel) { return IRCBotChannels[channel].banned; }
        /// <summary>
        /// Joins the specified channel.
        /// </summary>
        public new void JoinChannel(string channel)
        {
            if (this.erronousNick)
                return;//Do not join to channel with erronous nick
            if (!this.IRCBotChannels.ContainsKey(channel))
                this.IRCBotChannels.Add(channel, new IRCBot.MyIrcClient.IRCBotChannel());
            base.JoinChannel(channel);
            this.topics.Clear();
        }
        /// <summary>
        /// Leaves the specified channel.
        /// </summary>
        public new void PartChannel(string channel)
        {
            if (this.IRCBotChannels.ContainsKey(channel))
                this.IRCBotChannels.Remove(channel);
            base.PartChannel(channel);
        }
        /// <summary>
        /// Chaturbate user
        /// </summary>
        public IRCBot.Chaturbate.user chaturbateUser;
        /// <summary>
        /// The current thread is waiting until user has quitted from IRC server
        /// </summary>
        private System.Threading.EventWaitHandle ewh;
        /// <summary>
        /// Quit from IRC server after request from Chat application
        /// </summary>
        /// <param name="reason">reason of disconnecting</param>
        public void QuitReason(string reason)
        {
            base.Quit(reason);
            // Create EventWaitHandle.
            this.ewh = new System.Threading.EventWaitHandle(false, System.Threading.EventResetMode.ManualReset);
            // Wait on the EventWaitHandle.
            this.ewh.WaitOne();
            //            System.Threading.Thread.Sleep(System.Threading.Timeout.Infinite);
        }
        /// <summary>
        /// Response to chat application if chat application has requested a responce before it
        /// </summary>
        public void ResponseToChat()
        {
            if(this.ewh == null)
                return;
            Trace.WriteLine("Response to chat application.");
            //Sets the state of the event to signaled, allowing one or more waiting threads to proceed.
            this.ewh.Set();
            this.ewh.Dispose();
            this.ewh = null;
        }
        //private ChatHub chatHub;
        /// <summary>
        /// User has clicked the "updateChaturbate" checkbox
        /// </summary>
        /// <param name="period">Time in seconds of next upating of chaturbate users. 0 - not udating - defaulf value</param>
        public void UpdateChaturbateEvery(int period)
        {
            if (period == 0)
            {
                Trace.Fail("IRCBot.MyIrcClient.UpdateChaturbateEvery(" + period + ") failed! period = " + period);
                return;//сюда не должно попадать если останавливается периодическое upating of chaturbate users
            }
            if (!this.isConnected())
                return;//upating of chaturbate users начнется когда вручную присоеденится владелец канала
            IRCBot.ChatHub.IRCClients[this.ServerHostname].ChaturbateConnectAllUsers(this.ServerHostname);//, this.chatHub);
//            this.chatHub.ircChaturbateConnectAll(this.ServerHostname);
            this.JoinChannelsList();
        }
        public bool ContainsNick(string nick)
        {
            //существует опасность что myIrcClient.chaturbate.getNick() равено nick другого пользователя
            //лень это проверять и делать
            if ((this.User.Nick == nick) || ((this.chaturbateUser != null) && (this.chaturbateUser.getNick() == nick)))
                return true;
            return false;
        }
        public Dictionary<string, char?> getChannelModes(string channelName)
        {
            //Trace.WriteLine("MyIrcClient.getChannelModes(" + channelName + ")");
            Dictionary<string, char?> ChannelModes = new Dictionary<string, char?>();
            if (!Channels.Contains(channelName))
                return ChannelModes;//Private web page with user
            ChatSharp.IrcChannel ircChannel = Channels[channelName];

            //Exclude the 
            // Collection was modified; enumeration operation may not execute.
            //exception
            // https://stackoverflow.com/questions/604831/collection-was-modified-enumeration-operation-may-not-execute
            lock (ircChannel.Users)
            {
                foreach (var user in ircChannel.Users)
                    foreach (var mode in user.ChannelModes)
                    {
                        char? Prefix = this.ServerInfo.GetPrefixForMode(mode.Value.Mode);
                        if ((Prefix != null) && (mode.Key.Name == channelName))
                        {
                            Trace.WriteLine("user: " + user.Nick + " Prefix: " + Prefix);
                            ChannelModes.Add(user.Nick, Prefix);
                        }
                    }
            }
            return ChannelModes;
        }
        /// <summary>
        /// Sends a message to destination (channel or user).
        /// </summary>
        /// <param name="message"></param>
        /// <param name="destination">channel or user</param>
        public void SendMessage(string message, string destination)//, bool boFileTransfer = false)
        {
            base.SendMessage(message, destination);
        }
        /// <summary>
        /// true if 
        /// 432 ERR_ERRONEUSNICKNAME
        /// or 455 ERR_HOSTILENAME
        /// or 433 ERR_NICKNAMEINUSE "<nick> :Nickname is already in use"
        /// Continue connect all users
        /// </summary>
        /// <remarks>
        /// Incorrect nick.
        /// I have receiving 
        /// 455 * britny_big_cock :Invalid username. Please use another.
        /// in the irc.webmaster.com
        /// </remarks>
        public bool erronousNick = false;

        public enum VideoState
        {
            NoVideo,

            //This is IRC client of the user from https://chaturbate.com/ site:

            Started,
            Stopped // User has stopped of his video broadcasting
                    /// and I have send the quit message to IRC server.
                    /// Do not stop of connecting to IRC server of all users from https://chaturbate.com/ site
        };
        /// <summary>
        /// video state
        /// </summary>
        public VideoState videoState { get; private set; } = VideoState.NoVideo;

        /// <summary>
        /// https://bonalink.hopto.org/Chat/?tab=IRC
        /// </summary>
        /// <returns></returns>
        public static string MySiteIRCURL() { return "https://bonalink.hopto.org/Chat/?tab=IRC"; }
        public static string GetRealName() { return IRCBot.MyIrcClient.MySiteIRCURL() + " web IRC client"; }
        /// <summary>
        /// Link to IRC channel web page
        /// </summary>
        /// <param name="channelName"></param>
        /// <param name="nick"></param>
        /// <returns></returns>
        public string MySiteIRCChannelURL(string channelName = null, string nick = null)
        {
            if (string.IsNullOrEmpty(channelName) && (this.Channels.Count() > 0))
                channelName = this.Channels[0].Name;
            /*https://bonalink.hopto.org/Chat/?Nickname=anhr&tab=IRC&IRCURL=irc.dal.net&IRCPort=6667&Channel=%23videochat */
            return IRCBot.MyIrcClient.MySiteIRCURL()
            + (string.IsNullOrEmpty(nick) ? "" : "&Nickname=" + System.Uri.EscapeDataString(nick))//nick of destination
            + "&IRCURL=" + System.Uri.EscapeDataString(this.ServerHostname)
            + "&IRCPort=" + this.ServerPort
            + (string.IsNullOrEmpty(channelName) ? "" : "&Channel=" + System.Uri.EscapeDataString(channelName));
        }
        /// <summary>
        /// Quit from IRC server of the user because playing of the video was stopped
        /// </summary>
        /// <returns>true - the QUIT message was sent to IRC server</returns>
        public bool PlayingVideoStopped()
        {
            if (this.chaturbateUser == null)
            {
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " You can not stop playing of video if current user is not from chaturbate site");
                return false;
            }
            Trace.WriteLine(this.ServerHostname + " " + this.User.Nick + " PlayingVideoStopped() this.isConnected() = " + this.isConnected());
            if (this.videoState == IRCBot.MyIrcClient.VideoState.Stopped)
                Trace.Fail(this.ServerHostname + " " + this.User.Nick + " Please call PlayingVideoStopped once");
            this.videoState = IRCBot.MyIrcClient.VideoState.Stopped;
            if (this.isConnected())
            {
                this.Quit("playing of the video  " + this.MySiteIRCChannelURL() + "  was stopped");
                return true;
            }
            //если не удалить из списка посетителей посетителя, который прекратил вещание но еще не присоединен к IRC серверу, то я думаю,
            // что когда посетитель снова начнет и прекратит вещать я получу сообщение об ошибке 
            // Please call PlayingVideoStopped once
            //Посетитель, который присоеденен к IRC серверу, удаляется из списка посетителей в 
            //IRCClient.Disconnected += (s, e) =>
            IRCBot.ChatHub.IRCClients[this.ServerHostname].Remove(this.User.Nick);

            return false;
        }
    }
    /// <summary>
    /// Список пользователей, подключенных к одному IRC серверу
    /// Ключ - ник пользователя
    /// </summary>
    /// <remarks>
    /// Заменил Dictionary на List потому что в Dictionary дублируются nick и key а при изменении nick не могу изменить key
    /// и появляется двусмысленность.
    /// Например в случае, когда приходится укорачивать nick для посетителей с сайта Chaturbate
    /// </remarks>
    public class MyIRCClients : System.Collections.Generic.List<IRCBot.MyIrcClient>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="IRCServer">Строка из представления ViewIRCNS в котором перечислены все IRC серверы к которым может присоедениться IRCBot</param>
        /// <param name="chatHub"></param>
        /// <param name="nextConnectionDelay">Задержка подключения к IRC серверу следующего пользователя в миллисекундах</param>
        /// <param name="MaxConnections">Максимально возможное количество соединений с моего хоста к данному IRC серверу</param>
        public MyIRCClients(MyIRCServer IRCServer,// ChatHub chatHub,
            int? nextConnectionDelay, short? MaxConnections) : base()
        {
            this.IRCServer = IRCServer;
//            this.chatHub = chatHub;
            this.nextConnectionLimit = new MyNextConnectionLimit(IRCServer.URL, //this.chatHub,
                MaxConnections, nextConnectionDelay);
        }
        public ChatHub chatHub
        {
            get { return IRCBot.ChatHub.chatHub; }
            private set { Trace.Fail("set chatHub is not allowed"); }
        }
/*
        public void SetChatHub(ChatHub chatHub)
        {
            if (chatHub == null)
                return;//пока что нет случая, когда надо обнулить chatHub

            if (this.chatHub != null)
                return;

            this.chatHub = chatHub;
//            foreach(IRCBot.MyIrcClient myIrcClient in this) { myIrcClient.SetChatHub(chatHub); }
        }
*/
        /// <summary>
        /// Connect user to IRC server if user is not connected and otherwise disconnect
        /// </summary>
        /// <param name="IRCServer"></param>
        /// <param name="nextConnectionDelay">Задержка подключения к IRC серверу следующего пользователя в миллисекундах</param>
        /// <param name="MaxConnections">Максимально возможное количество соединений с моего хоста к данному IRC серверу</param>
        /// <returns>
        /// количество секунд, прошедших со времени последнего присоединения к IRC серверу
        /// 0 - можно присоеденить нового посетителя
        /// > 0 - Reconnecting too fast
        /// </returns>
        public long ircConnect2(IRCBot.MyIRCServer IRCServer, int? nextConnectionDelay, short? MaxConnections, bool? NickServSupport
            , IRCBot.ChatHub chatHub)
        {
            long delay = 0;
            Trace.WriteLine("ircConnect: " + IRCServer.URL + ", " + IRCServer.Nick);
            if (!ChatHub.IRCClients.ContainsKey(IRCServer.URL))
            {
                string message = "Connect of " + IRCServer.Nick + " to " + IRCServer.URL + " failed!";
                Trace.Fail(message);
                if(chatHub != null)
                    chatHub.Clients.All.onIRCConnect(message, IRCServer.URL, IRCServer.Nick);
                return delay;
            }
            IRCBot.MyIrcClient ircClient;
            IRCBot.MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[IRCServer.URL];

            //Если IRCBot запускается из BotStarter до того как была открыта веб станица IRCBot, то myIRCClients.chatHub == null
            //Далее, при подключении веб станицы, надо установить myIRCClients.chatHub
            //Иначе на веб страницу не будут передаваться события из IRCBot.
//            myIRCClients.SetChatHub(chatHub);

            if (!myIRCClients.ContainsKey(IRCServer.Nick))
            {
                //add a user from Chaturbate site
                ircClient = IRCBot.ChatHub.newIRCClient(IRCServer, nextConnectionDelay, MaxConnections, NickServSupport);//, chatHub);
            }
            else ircClient = ChatHub.IRCClients.getIRCClient(IRCServer.URL, IRCServer.Nick);
            if (ircClient.isConnected())
            {
                Trace.WriteLine("Disconnect " + IRCServer.Nick + " from " + IRCServer.URL);
                ircClient.Quit("bye");
                return delay;
            }
            delay = myIRCClients.IsReconnectingTooFast(chatHub, IRCServer.Nick);
            if (delay > 0)
                return delay;//Reconnecting too fast
            if (myIRCClients.IsMaxConnections((int)IRCBot.ChatHub.IRCClients[IRCServer.URL].connections()))
            {//Количество присоединенных к IRC серверу из всех приложений посетителей превысило максимально допустимое
                string message = "Max connections limit " + myIRCClients.MaxConnections + " is exceeded.";
                Trace.WriteLine(IRCServer.URL + " " + IRCServer.Nick + " " + message);
                if (chatHub != null)
                    chatHub.Clients.Caller.onIRCSetStatus(IRCServer.URL, IRCServer.Nick, message);
                return delay;
            }

            System.DateTime date = System.DateTime.Now;
            Trace.WriteLine("[" + IRCBot.ChatHub.RememberMessages.dateFormat(date) + "]" + ircClient.ServerHostname + " " + ircClient.User.Nick
                + " ConnectAsync() dalay: " + myIRCClients.GetConnectAsyncDelay(date));
            ircClient.ConnectAsync();
            return delay;
        }
        public void LogInformation()
        {
            /*
            MyCommon.Logger.LogInformation(this.IRCServer.URL +
                " updateChaturbatePeriod: " + this.updateChaturbatePeriod + " sec." + 
                (this.chaturbate == null ? "" : this.chaturbate.LogInformation()));
            */
        }
        /// <summary>
        /// Устанвливает максимально возможное количество соединений с моего хоста к данному IRC серверу
        ///  SignalRChat.NextConnectionLimit.MaxConnections
        /// если в message присутствует фраза типа "Too many connections"
        /// </summary>
        /// <param name="message"></param>
        /// <param name="chatHub"></param>
        public void TooManyConnections(string message, IRCBot.ChatHub chatHub)
        {
            MyCommon.NextConnectionLimit.ResTooManyConnections resTooManyConnections =
                this.nextConnectionLimit.TooManyConnections(message, (int)this.connections());
            if (resTooManyConnections != null)
            {
                switch (resTooManyConnections.enumTooManyConnections)
                {
                    case MyCommon.NextConnectionLimit.ResTooManyConnections.EnumTooManyConnections.responseReady:
                        Trace.Fail("case MyCommon.NextConnectionLimit.ResTooManyConnections.EnumTooManyConnections.responseReady: under consraction");
//                        chatHub.Clients.Caller.onIRCBotResponseReady();
                        break;
                    case MyCommon.NextConnectionLimit.ResTooManyConnections.EnumTooManyConnections.tooManyConnections:
                        if (chatHub != null)
                        {
//                        chatHub.onTooManyConnections();
                            chatHub.Clients.Caller.onMaxConnections(this.IRCServer.URL,
                                resTooManyConnections.MaxConnectionsOld + " to " + this.nextConnectionLimit.MaxConnections);
                        }
                        break;
                }
            }
        }
        /// <summary>
        /// Is max connections?
        /// </summary>
        /// <param name="connections">
        /// Количество соединений с ServerHostname IRC сенрвером в данном приложении.
        /// </param>
        /// <returns>
        /// true - количество соединений к IRC серверу this.ServerHostname со всех приложений (SignalRChat и ircBot) 
        ///     превысило максимально допустимое
        /// </returns>
        public bool IsMaxConnections(int connections) { return this.nextConnectionLimit.IsMaxConnections(connections); }
        /// <summary>
        /// Получить момент времени, когда произошло соединение с IRC сервером из приложения IRCBot
        /// </summary>
        public long ConnectionTicks
        {
            get { return this.nextConnectionLimit.getConnectionTicks(); }
            private set { Trace.Fail("set IRCBot.MyIRCClients.ConnectionTicks unavailable"); }
        }
        /// <summary>
        /// Получить количество секунд, прошедших со времени присоединения к IRC серверу
        /// </summary>
        /// <returns>количество секунд, прошедших со времени присоединения к IRC серверу</returns>
        public long getLastConnectionSeconds() { return this.nextConnectionLimit.getLastConnectionSeconds(); }
        private class MyNextConnectionLimit : MyCommon.NextConnectionLimit
        {
            public MyNextConnectionLimit(string ServerHostname, //ChatHub chatHub, 
                short? MaxConnections = null, int? nextConnectionDelay = null)
                : base(ServerHostname, MaxConnections, nextConnectionDelay)
            {
//                this.chatHub = chatHub;
            }
            private ChatHub chatHub
            {
                get { return IRCBot.ChatHub.chatHub; }
                set { Trace.Fail("set chatHub is not allowed"); }
            }
            /// <summary>
            /// возвращет количество посетителей, присоединенных к данному IRC серверу в текущем приложениии IRCBot
            /// </summary>
            /// <returns>IRC server connections count</returns>
            protected override int getConnections() { return (int)IRCBot.ChatHub.IRCClients[this.ServerHostname].connections(); }
            public override void setMaxConnections(short? MaxConnections)
            {
                if(this.chatHub != null)
                    this.chatHub.Clients.Caller.onMaxConnections(base.ServerHostname, base.MaxConnections + " to " + MaxConnections);
                base.setMaxConnections(MaxConnections);
            }
        }
        private MyNextConnectionLimit NextConnectionLimit;
        private MyNextConnectionLimit nextConnectionLimit
        {
            get
            {
                if (this.NextConnectionLimit == null)
                    this.NextConnectionLimit = new MyNextConnectionLimit(this.IRCServer.URL//, this.chatHub
                        );//в базе данных нет ограничений на подключение к IRC серверу следующего посетителя
                return this.NextConnectionLimit;
            }
            set { this.NextConnectionLimit = value; }
        }
        /// <summary>
        /// Установить момент времени, когда произошло соединение с IRC сервером
        /// </summary>
        public void setConnectionTicks() { this.nextConnectionLimit.setConnectionTicks(); }
        /// <summary>
        /// The NOTICE reply was received from IRC server
        /// </summary>
        /// <param name="notice"></param>
        public void NoticeRecieved(string notice) { this.nextConnectionLimit.NoticeRecieved(notice); }
        /// <summary>
        /// Is reconnecting too fast?
        /// </summary>
        /// <param name="outMessage">Сообщение для вывода на веб страницу</param>
        /// <returns>
        /// количество секунд, прошедших со времени последнего присоединения к IRC серверу
        /// 0 - можно присоеденить нового посетителя
        /// > 0 - Reconnecting too fast
        /// </returns>
        public long IsReconnectingTooFast(ChatHub chatHub, string nick)
        {
            string message = "";
            long delay = this.nextConnectionLimit.IsReconnectingTooFast(out message);
            if ((this.updateChaturbatePeriod == 0) && !string.IsNullOrEmpty(message))
                //Выводить сообщение на веб страницу только когда не поставлена птичка updateChaturbate
                //Потому что во время атоматического присоединения к IRC серверу посетителей с сайта Chaturbate
                //всегда будет появляться сообщение ReconnectingTooFast. Это нормально, поэтому его не нужно отображать
                //
                //Но тогда будет вот какая проблема:
                //  Выбрать IRC сервер irc.quakenet.org для которого есть задержка следующего соединения Next connection delay: 40000 millisecs.
                //  Убрать птичку updateChaturbate и нажать кнопку Connect id="btnConnect"
                //  Дождаться status: My whoIs received
                //  В течении 40 секунд нажать Disconnect id="btnConnect" и поставить птичку updateChaturbate
                //  Сейчас бесконечно видно status:  Toggle connection irc.quakenet.org bonalink.
                //  А надо status: <irc.quakenet.org> bonalink. "Reconnecting too fast. Please wait 37 seconds and try again."
                //Тут выводить нельзя потому что на веб странице будет засоряться окно messagesList
                //Для решения пролемы вывожу на веб страницу сообщение 
                //"Too many connections in a short period of time. Please wait " + delay + " seconds and try again." 
                //из IRCBot.ChatHub.ircConnect то есть только после того, как пользователь вручную поставил птичку updateChaturbate
                chatHub.Clients.Caller.onIRCConnect(message, this.IRCServer.URL, nick);
            return delay;
        }
        /// <summary>
        /// time of last ConnectAsync to IRC server
        /// </summary>
        /// <remarks>
        /// for debugging.
        /// На сервере irc.efnet.org получаю сообщение
        /// ERROR :Reconnecting too fast, throttled.
        /// несмотря что задержку между соедиениями сделал 80 секунд.
        /// При попытке следующего соединения получаю бан
        /// ERROR :Closing Link: 95.188.70.66 (*** Banned )
        /// Ввел эту переменную что бы узнать реальный провежуток времени между соедиенинями к IRC серверу.
        /// Возможно по какой то причине он меньше 80 секунд
        /// 
        /// Думаю это происходит потому что во время автоматического присоединения к IRC серверу из IRCBot
        /// я присоединяюсь к IRC серверу с моего хоста из дугого клиента включая SignalRChat.
        /// Надо получать из SignalRChat время, когда было последнее соединение с IRC сервером SignalRChat.ChatHub.MyIRCClients.connectionTicks
        /// Если время последнего соединения из SignalRChat болше времени последнего соединения с IRCBot,
        /// то нужно увеличить задержку следующего соединения
        /// 
        /// </remarks>
        private System.DateTime dateConnectAsync;
        public string GetConnectAsyncDelay(System.DateTime date)
        {
            System.TimeSpan time = new System.TimeSpan(date.Ticks - this.dateConnectAsync.Ticks);
            this.dateConnectAsync = date;
            return time.Days != 0 ? ""//вообще не выводить задержку если она больше одного дня. Скорее всего это первое соедиенине
                : //((time.Hours == 0 ? "" : time.Hours + ":") + //не выводить часы если они равны нулю
                    ((time.Hours == 0 && time.Minutes == 0) ? ""
                : time.Hours + ":" + time.Minutes + " ") + time.Seconds + " sec.";
        }
        /// <summary>
        /// update chaturbate users list every this period in seconds
        /// </summary>
        /// <remarks>
        /// 0 - default value - not updating
        /// != 0 User has clicked the "updateChaturbate" checkbox
        /// </remarks>
        public int updateChaturbatePeriod { get; private set; } = 0;
        /// <summary>
        /// User has clicked the "updateChaturbate" checkbox
        /// </summary>
        /// <param name="period">Time in seconds of next upating of chaturbate users. 0 - not udating - defaulf value</param>
        public void UpdateChaturbateEvery(int period)
        {
            this.updateChaturbatePeriod = period;
            if (this.updateChaturbatePeriod == 0)
            {
                this.StopConnectAllUsers();
                return;//прекратить переодическое обновленик списка посетителей с сайта Chaturbate
            }

            //если не вставить эту строку, то не удается восстановить периодическое обновление списка посетителей с сайта chaturbate
            // после того как была снята и снова поставлена птичка updateChaturbate - Connect all chaturbate users and update chaturbate list
            // во время паузы
            // Wait 50 seconds for update of Chaturbate users list.
            // которая задерживает очередное обновление списка посетителей с сайта chaturbate.
            // Потому что когда снова поставить птичку updateChaturbate то появлется сообщение об ошибке 
            // "setСhaturbateTicks first!"
            // потому что непонятно по какой причине IRCBot.Chaturbate.сhaturbateTicks равен нулю.
            // А если поставить эту строку, то в функции 
            // IRCBot.MyIRCClients.chaturbateUsers
            // вызывается конструтор
            // new IRCBot.Chaturbate(chatHub, ServerHostname);
            // а затем скачивается новый список посетителей с сайта Chaturbate и устанвливается время, когда это произошло в этом стеке
            // IRCBot.dll!IRCBot.Chaturbate.getUsers() Line 577    C#
            // IRCBot.dll!IRCBot.MyIRCClients.chaturbateUsers(string ServerHostname, bool boAllUsers, IRCBot.ChatHub chatHub) Line 932 C#
            // IRCBot.dll!IRCBot.ChatHub.chaturbateUsers(string ServerHostname, bool boAllUsers) Line 1159 C#
            // IRCBot.dll!IRCBot.MyIRCClients.ChaturbateConnectAllUsers(string ServerHostname, IRCBot.ChatHub chatHub) Line 997    C#
            // IRCBot.dll!IRCBot.ChatHub.ircChaturbateConnectAll(string ServerHostname) Line 885   C#
            // IRCBot.dll!IRCBot.MyIrcClient.UpdateChaturbateEvery(int period) Line 416    C#
            // 
            // Для тестирования поставить птичку updateChaturbate для irc.gamesurge.net
            // Дождаться когда присоеденится максимальное количество посетителей с моего хоста раное 4.
            // Появится пауза 
            // Wait 50 seconds for update of Chaturbate users list.
            // Убрать птичку updateChaturbate и дождаться, когда пройдет время этой паузы
            // Снова поствить птичку updateChaturbate.
            // Должен скачаться новый список посетителей с сайта Chaturbate и снова установится пауза обновления этого спска.
            //
            // Теперь, когда убрать и снова поставить птичку updateChaturbate во время присоединения к IRC серверу посетителей с сайта Chaturbate,
            // то список посетиелей с сайта Chaturbate будет обновляться сразу после установки птички updateChaturbate.
            // Думаю это ничего страшного.
            this.chaturbate = null;

            IRCBot.MyIrcClient channelOwner = this.SingleOrDefault(item => item.chaturbateUser == null);
            channelOwner.UpdateChaturbateEvery(period);
        }
        /// <summary>
        /// Gets the IRC client at the specified nick.
        /// </summary>
        /// <param name="nick">user's nick</param>
        /// <returns></returns>
        public IRCBot.MyIrcClient this[string nick]
        {
            get
            {
                foreach (IRCBot.MyIrcClient myIrcClient in this)
                {
                    if(myIrcClient.ContainsNick(nick))
                        return myIrcClient;
                }
                return null;
            }
            private set { }
        }
        /// <summary>
        /// Determines whether the list contains the IRC client with specified user's nick.
        /// </summary>
        /// <param name="nick">user's nick</param>
        /// <returns>
        ///     true - list is contains the IRC client with specified user's nick
        ///     false - is not contains
        /// </returns>
        public bool ContainsKey(string nick)
        {
            
            return this[nick] == null ? false : true;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <remarks>
        /// Попытка избежать исключения 
        /// System.InvalidOperationException - "Collection was modified; enumeration operation may not execute."
        /// во время получения списка IRC клиентов в IRCBot.MyIRCClients.testConnections().
        /// Замыкаю этот объект всякий раз, когда добавляю, удаляю или просмаотриваю этот список
        /// https://codereview.stackexchange.com/questions/62033/creating-a-thread-safe-list-using-a-lock-object
        /// ВНИМАНИЕ!!! Этот способ не проверен! Не знаю в каких случаях появляется это исключение. Надеюсь это исключение больше не появится.
        /// </remarks>
        private readonly object lockList = new object();
        /// <summary>
        /// Adds an IRC Client to the end of the IRC Clients list.
        /// </summary>
        /// <param name=IRCClient>IRC client for adding</param>
        public new void Add(IRCBot.MyIrcClient IRCClient)
        {
            lock (lockList)
            {
                base.Add(IRCClient);
            }
        }
        /// <summary>
        /// Removes the IRC client from the list.
        /// </summary>
        /// <param name=IRCClient>IRC client for removing</param>
        /// <returns>
        /// true if item is successfully removed; otherwise, false. This method also returns
        /// false if item was not found in the System.Collections.Generic.List`1.
        /// </returns>
        private new bool Remove(IRCBot.MyIrcClient myIrcClient)
        {
            bool res;
            lock (lockList)
            {
                res = base.Remove(myIrcClient);
            }
            return res;
        }
        /// <summary>
        /// Removes the IRC client with specified user's nick from the list.
        /// </summary>
        /// <param name="nick">user's nick of the IRC client for removing</param>
        /// <returns>
        /// true if item is successfully removed; otherwise, false. This method also returns
        /// false if item was not found in the System.Collections.Generic.List`1.
        /// </returns>
        public bool Remove(string nick)
        {
            IRCBot.MyIrcClient myIrcClient = this[nick];
            if (myIrcClient == null)
                return false;
            Trace.WriteLine("MyIRCClients.Remove(" + nick + ") from " + myIrcClient.ServerHostname);
            return this.Remove(myIrcClient);
        }
        /// <summary>
        /// Количество успешных соединений к текущему IRC серверу.
        /// </summary>
        /// <param name="chaturbate">true - учитывать только посетитеоей с сайта chaturbate</param>
        /// <returns>Количество успешных соединений к текущему IRC серверу.</returns>
        /// <remarks>
        /// Нужно чтобы на некоторых IRC серверах ограничить количесто соединений, иначе можно получть бан.
        /// Максимальное количество соендинений для конкретного сервера хранится в базе данных в таблице DBIRCNS
        /// а посмотреть максимальное количество соендинений можно в передставлении ViewIRCNS
        /// </remarks>
        public uint connections(bool chaturbate = false)
        {
            uint connections = 0;
            foreach (var myIRCClient in this)
            {
                if (myIRCClient.isConnected())
                    connections++;
            }
            return connections;
        }
        /// <summary>
        /// возвратить на веб страницу всех посетителей onTestConnections() и на веб странице проверить каждого посетителя присоединен он к IRC серверу или нет.
        /// Вызвать chatHub.Clients.All.onTestConnectionsStop
        /// </summary>
        /// <param name="chatHub"></param>
        /// <remarks>
        /// В displayConnections обнаружилась ошибка в количестве соединений к IRC серверу
        /// Ошибки могут быть трех видов:
        ///     1. Соединение с IRC сервером у посетителя на моем сервере и на веб странице не совпадают.
        ///         Исправить статус посетителя на веб странице. См. chat.client.onTestConnections(...).
        ///     2. На веб странице не найден посетитель, который есть на моем сервере.
        ///         Вызывается testConnectionsFailed(...). Сейчас просто удаляю этого посетителя с моего сервера
        ///     3. На веб странице есть посетители, которых нет на моем сервере. Надо удалить их с веб страницы.
        ///         Для этого вызываю onTestConnectionsStop(...)
        /// Отправить на мой сервер testConnectionsFailed(...) если на веб странице не найден посетитель, который есть на моем сервере
        /// </remarks>
        public void testConnections(IRCBot.ChatHub chatHub)
        {
            lock (lockList)
            {
                foreach (var myIRCClient in this)
                    chatHub.Clients.All.onTestConnections(myIRCClient.ServerHostname, myIRCClient.User.Nick, myIRCClient.isConnected());
            }
            chatHub.Clients.All.onTestConnectionsStop(this.IRCServer.URL);
        }
        public short? MaxConnections
        {
            get { return this.nextConnectionLimit.MaxConnections; }
            set
            {
//                this.IRCServer.MaxConnections = value;
                //Здесь есть неоднозначность MaxConnections
                this.nextConnectionLimit.setMaxConnections((short)value);
            }
        }
        public int? NextConnectionDelay { get { return this.nextConnectionLimit.nextConnectionDelay; } }
        public MyIRCServer IRCServer { get; private set; }
        /// <summary>
        /// Real name of all users I want to connect to the current IRC server
        /// </summary>
        /// <remarks>
        /// Некторые IRC сервера (irc.webmaster.com) выдают ошибку 
        /// 459 * :Invalid gecos/real name. Please use another.
        /// когда я задаю realname по умолчанию, которое содержит гиперссылку
        /// Поэтому я заменяю realname = ""
        /// см. case "459": в IRCClient.ErrorReply
        /// Для того что бы для каждого посетителя не получать это сообщение об ошибке
        /// Теперь realname для каждого пользователя будет равно nick
        /// см. private MyIrcClient newIRCClient(MyIRCServer IRCServer)
        /// </remarks>
        public string realName = IRCBot.MyIrcClient.GetRealName();
        //////////////////////////////////////////////////////////////
        //Chaturbate

        /// <summary>
        /// здесть хранится список уже выведенных на веб страницу пользователей, транаслирующих на сайте https://chaturbate.com/
        /// </summary>
        private IRCBot.Chaturbate chaturbate;
        /// <summary>
        /// это список уже выведенных на веб страницу пользователей, которые прекратили трансляцию на сайте https://chaturbate.com/
        /// их нужно удалить
        /// </summary>
        private IRCBot.Chaturbate chaturbateOld;
        /// <summary>
        /// Получить список пользователей с сайта https://chaturbate.com
        /// </summary>
        /// <param name="ServerHostname"></param>
        /// <param name="boAllUsers">
        /// true - вывести всех пользователей
        /// false - вывести всех пользователей и удалить тех, кторые прекратили видео трансляцию
        /// </param>
        /// <param name="chatHub"></param>
        public void chaturbateUsers(string ServerHostname, bool boAllUsers)//, ChatHub chatHub)
        {
            //если просто приравнять списки посетителей то при обновлении списка посетителей с сайта https://chaturbate.com/ 
            //(кнопка btnUpdateChaturbate) появится System.InvalidOperationException - "Collection was modified; enumeration operation may not execute."
            //потому что this.chaturbateOld = this.chaturbate; и при удалении пользователя из this.chaturbateOld
            //он одновременно удаляется из this.chaturbate.
            // Поэтому делаю копию списка в констукторе IRCBot.Chaturbate(this.chaturbate)
            //
            //this.chaturbateOld = this.chaturbate;

            if (this.chaturbate != null)
                this.chaturbateOld = new IRCBot.Chaturbate(this.chaturbate);

            //Не надо несколько раз вызывать new Chaturbate
            // потому что тогда несколько раз подряд буду получать список посетителей с сайта https://chaturbate.com/ 
            if (this.chaturbate == null)
                this.chaturbate = new IRCBot.Chaturbate(//chatHub,
                    ServerHostname);

            if (!this.chaturbate.getUsers())//сейчас несколько раз подряд списки не считываются потому что IRCBot.Chaturbate.gettingUsers
                                            //разрешает получить новый список только если прошел период времени, когда на сайте chaturbate обновился список блядей
                this.chaturbate = null;//список получить не удалось. Разрешить пропробовать получить список еще раз.
            else this.chaturbate.displayUsers(boAllUsers ? null : chaturbateOld);

            //если обновить веб странцу во время присоединеия посетителя с сайта chaturbate,
            //то иногда этот посетитель не добавляется в список посетителей IRC канала
            //Это происходит потому что IRC канал еще не добавлен на веб страницу
            //и не готов список посетителей с сайта chaturbate.
            //Тут я перебираю всех IRC клентов, присоединенных к данному серверу, которым сообщаю что chaturbate список готов
            //Если в IRC клиенте есть посетитель, который еще не добавлен на IRC канал, он тут добавляется
            //Подробности смотри в описании IRCBot.MyIrcClient.Channel.ready
            foreach (IRCBot.MyIrcClient myIrcClient in this.Where (item => item.isChanneslList()))//выбрать только посетителей, у которых channelsList != null. Т.е. владельцев IRC канала
            { myIrcClient.chaturbateUsersReady(); }
//            this.ForEach(delegate (IRCBot.MyIrcClient myIrcClient) { myIrcClient.chaturbateUsersReady(); });
        }
        /// <summary>
        /// Copy to web page of all users from https://chaturbate.com/ site without query of users list from https://chaturbate.com/ site
        /// </summary>
        /// <returns>true success.</returns>
        public bool chaturbateCopyUsers()
        {
            if (this.chaturbate == null)
                return false;//непонятно почему сюда попадает когда на канал вошел посторонний посетитель потому что в это время на веб странице почемуто открывается ветка Chaturbate
            this.chaturbate.getUsers();
            return true;
        }
        /// <summary>
        /// войти на канал владельцу канала
        /// или присоеденить к IRC серверу следующего пользователя, транаслирующего на сайте https://chaturbate.com/
        /// </summary>
        /// <param name="myIrcClient">Irc Client</param>
        /// <param name="chatHub"></param>
        /// <param name="boChannelOwner">true: к IRC серверу присоеденился владелец канала, нужно его join to channel</param>
        public void connectNext(IRCBot.MyIrcClient myIrcClient, //IRCBot.ChatHub chatHub,
            bool boChannelOwner)
        {
//Trace.WriteLine("IRCBot.MyIRCClients.ConnectNext. " + myIrcClient.ServerHostname);
            if (this.chaturbate == null)
            {
                if (this.updateChaturbatePeriod != 0)
                {//Пользователь установил галочку updateChaturbate
                    IRCBot.ChatHub.IRCClients[myIrcClient.ServerHostname].ChaturbateConnectAllUsers(myIrcClient.ServerHostname);//, chatHub);
//                    chatHub.ircChaturbateConnectAll(myIrcClient.ServerHostname);
                    // а затем повторять все это с периодом updateChaturbatePeriod секунд
                }
            }
            if ((this.updateChaturbatePeriod != 0) && (this.chaturbate.connectAll == null))
            {
                //For testing:
                // Check updateChaturbate checkbox
                // Open a IRC server branch, then open the Chaturbate branch
                // Connect to IRC server the owner of the channel
                this.chaturbate.ConnectAllUsers(myIrcClient.ServerHostname);
            }
            if ((this.chaturbate != null) && (this.chaturbate.connectAll != null))
            {
                //если убрать эту проверку то сразу два посетителя с сайта  https://chaturbate.com/ будут присоединяться к IRC серверу
                //Есть подозрение что на irc.efnet.org из за этого меня банят потому что слишком часто происходит соединение с моего хоста
                if (!boChannelOwner)
                    this.chaturbate.connectAll.ConnectNext(myIrcClient);//или присоеденить к IRC серверу следующего пользователя, транаслирующего на сайте https://chaturbate.com/

                //join to channel этого пользователя
                IRCBot.ChatHub.getChannelsList(myIrcClient.ServerHostname).JoinChannelsList(myIrcClient);
            }
        }
        /// <summary>
        /// Начать присоеденять к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
        /// </summary>
        /// <param name="ServerHostname"></param>
        /// <param name="chatHub"></param>
        public void ChaturbateConnectAllUsers(string ServerHostname)//, IRCBot.ChatHub chatHub)
        {
            if(this.chaturbate == null)
            {//пользователь поставил галочку updateChaturbate - периодически обновлять список пользователей с сайта https://chaturbate.com/
             //и нажал кнопку btnConnect для владельца ChannelName
             //После присоединеия владельца ChannelName к IRC серверу надо присоединить к ChannelName еще пользователей с сайта https://chaturbate.com/
             //Но список этих пользователей может быть еще не готов потому что не открывалась ветка Chaturbate
                ChatHub.IRCClients[ServerHostname].chaturbateUsers(ServerHostname, true//, chatHub
                    );//Откыть ветку Chaturbate
//                chatHub.chaturbateUsers(ServerHostname);//Откыть ветку Chaturbate
            }

            //если не вызывать эту функцияю, то после того как к IRC серверу присоединятся все посетители с сайта https://chaturbate.com/
            //которое происходит после нажатия кнопки btnChaturbateConnect
            // IRCBot.Chaturbate.ConnectAll.enumerator будет указывать в конец списка IRCBot.Chaturbate.orderedUsers посетителей с сайта https://chaturbate.com/
            // и тогда IRCBot.Chaturbate.ConnectAll.enumerator.MoveNext() возвратит false и поэтому ConnectAllUsers ничего не выполнит.
            //
            // Другими словами повторно присоедиенить к IRC северу всех посетителей с сайта https://chaturbate.com/ не получится
            // потому что указатель списка посетителей сайта указывает на конец списка
            //
            // Пробовал IRCBot.Chaturbate.ConnectAll.enumerator переместить в начало списка с помошью команды Reset(); 
            // но получил исключение System.NotSupportedException
            //
            // Переместить указатель в конец списка можно на сервере irc.webmaster.com потому что он не делает ограничение Too many connections
            //
            // Эта функция повторно будет получать список посетителей с сайта https://chaturbate.com/ перед присоединением их к IRC серверу
            this.chaturbateUsers(ServerHostname, false);//, chatHub);

            if (this.chaturbate == null)
                return;//сюда попадает когда не удается скачать список посетителей с сайта https://chaturbate.com/
                        //для тестирования вынуть сетевой кабель
            this.chaturbate.ConnectAllUsers(ServerHostname);
        }
        /// <summary>
        /// Stop chaturbate connect all.
        /// </summary>
        /// <remarks>
        /// The btnChaturbateStop button was clicked
        /// or updateChaturbate checkBox was unchecked - прекратить периодически обновлять список посетителей с сайта Chaturbate
        /// or IRCClient.Disconnected callaed because "ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)"
        /// </remarks>
        public void StopConnectAllUsers()
        {
            if (this.chaturbate == null)
                return;
            this.chaturbate.StopConnectAllUsers();
        }
        /// <summary>
        /// Stop chaturbate connect all.
        /// Wait some time and update list of users from https://chaturbate.com/ site again
        /// </summary>
        public void WaitUpdateUsersList()
        {
//            Trace.WriteLine("IRCBot.MyIRCClients.WaitUpdateUsersList " + this.IRCServer.URL + ", " + this.IRCServer.Nick);
            this.StopConnectAllUsers();
            if(this.chaturbate != null)
                this.chaturbate.WaitUpdateUsersList();
        }
    }
    /// <summary>
    /// Список списков IRC серверов.
    /// Ключ - адрес сервера
    /// </summary>
    /// <remarks>
    /// Здесь перечислены все IRC сервера, к которым IRCBot может подключиться
    /// </remarks>
    [System.SerializableAttribute]
    public class MyIRCClientss : System.Collections.Generic.Dictionary<string, MyIRCClients>
    {
        //for removing of
        // warning CA2229: Microsoft.Usage : Add a constructor to MyIRCClientss with the following signature: 'protected MyIRCClientss(SerializationInfo info, StreamingContext context)'.
        //for testing:
        //open the Analyze/Run Code Analyze item of the context memu of the IRCBot project in the Solution Explorer panel
        protected MyIRCClientss(System.Runtime.Serialization.SerializationInfo info, System.Runtime.Serialization.StreamingContext context)
            : base(info, context) { }
        public MyIRCClientss() : base() { }
        /// <summary>
        /// Start IRCBot application 
        /// </summary>
        /// <returns>current status of the IRCBot app</returns>
        /// <remarks>
        /// Вызывается из приложения BotStarter.
        /// Добавил эту функцию на случай если по какой либо причине произойдет остановка выполнения IRCBot.
        /// Заметил, иногда где то через сутки работы IRCBot останавливается без всяких видимых причин.
        /// Для выяснения причины остановки добавил вывод в реестр в IRCBot.Global.Application_End
        /// но она почему то не вызывается в данном случае.
        /// Для решения проблемы сделал проект BotStarter который переодически вызывает эту функцию и возвращает текущее состояние IRCBot.
        /// Возможные состояния IRCBot:
        ///     "get IRC servers"
        ///     "IRC servers"
        /// Детали смотри в MyCommon.BotStart
        /// </remarks>
        public string Start()
        {
            if (this.Count == 0)
            {
                IRCBot.ChatHub.getIrcServers();
                return MyCommon.Query.getStatusTag(MyCommon.BotStart.strGetIRCservers);// "get IRC servers";
            }
            string response = MyCommon.Query.getStatusTag("IRC servers");
            foreach (MyIRCClients myIRCClients in this.Values)
            {
                /*
                if (myIRCClients.IRCServer.URL != "irc.gamesurge.net")
                    continue;
                */
                //System.Diagnostics.Trace.WriteLine("IRC server: " + myIRCClients.IRCServer.URL);
                string strIRCClients = "";
                uint connections = 0;//количество посетителей, присоединенных к текущему IRC серверу 
                foreach (IRCBot.MyIrcClient myIrcClient in myIRCClients)
                {
                    if (myIrcClient.isConnected())
                        connections++;
                    if (
                        (myIrcClient.chaturbateUser == null)//is channel owner
                        && !myIrcClient.isConnected()
                        )//Для уменьшения лишней информации вывести на консоль только не присоединенного к IRC серверу владелца канала
                        strIRCClients += MyCommon.BotStart.getIRCClientTag(MyCommon.BotStart.getUserTag(myIrcClient.User.Nick + 
                            (myIrcClient.chaturbateUser == null ? " is channel owner" : "")) +
                            (myIrcClient.isConnected() ? "" : 
                            MyCommon.BotStart.getErrorTag("is not connected")
                            ));
                }
                string NoUpdateChaturbate = "";
                if (myIRCClients.updateChaturbatePeriod == 0)
                {
                    myIRCClients.UpdateChaturbateEvery(50);
                    ViewIRCNS viewIRCNS = new DBChatEntities().ViewIRCNS.SingleOrDefault(item => item.URL == myIRCClients.IRCServer.URL);
                    myIRCClients.ircConnect2
                        (myIRCClients.IRCServer, viewIRCNS.NextConnectionDelay, viewIRCNS.MaxConnections, viewIRCNS.NickServSupport
                        , myIRCClients.chatHub);

                    NoUpdateChaturbate = "no update Chaturbate";
                }
                response += MyCommon.BotStart.getIRCServerTag(MyCommon.BotStart.getURLTag(myIRCClients.IRCServer.URL + " " + connections + " connections") + 
                    (NoUpdateChaturbate != "" ? MyCommon.BotStart.getErrorTag(NoUpdateChaturbate) : "")
                    + strIRCClients);
//break;
            }
            return response;// MyCommon.NextConnectionLimit.strReady;// "Ready";
        }
        public IRCBot.MyIrcClient getIRCClient(string ServerHostname, string nick)
        {
            if (!this.ContainsKey(ServerHostname))
                return null;
            IRCBot.MyIRCClients myIRCClients = this[ServerHostname];
            if (!myIRCClients.ContainsKey(nick))
                return null;
            return myIRCClients[nick];
        }
        public IRCBot.MyIrcClient getIRCClientChannelOwner(string ServerHostname)
        { return this[ServerHostname].SingleOrDefault(myIrcClient => myIrcClient.chaturbateUser == null); }
        public new bool Remove(string key)
        {
            if (!base.ContainsKey(key))
                return false;
            Trace.WriteLine("MyIRCClientss.Remove(" + key + ")");
            return base.Remove(key);
        }
    }
}