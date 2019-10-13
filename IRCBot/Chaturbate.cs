using System;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Linq;

//https://github.com/jamietre/CsQuery
using CsQuery;

namespace IRCBot
{
    /// <summary>
    /// получить данные с сайта https://chaturbate.com/
    /// </summary>
    public class Chaturbate
    {
        public Chaturbate(//IRCBot.ChatHub chatHub, 
            string ServerHostname)
        {
//            this.chatHub = chatHub;
            this.serverHostname = ServerHostname;

            //если в конструкторе получать список посетителей this.getUsers()
            // то этот консткутор будет выполняться достаточно долго
            // и в IRCBot.MyIRCClients.chaturbateUsers
            // может несколько раз вызваться этот конструктор
            // птому что может так получиться что IRCBot.MyIRCClients.chaturbate == null
            // потому что предыдущей конструктор еще не завершил свою работу
            // Как результат получится несколько экземпляров этого класса и все они получают список посетителей одновременно.
            // Но это бессмысленно потому что все эти списки будут оданаковые.
            // Chaturbate.gettingUsers не поможет потому что он будет в разных объектах этого класса
            //
            //            this.getUsers();
        }
        /// <summary>
        /// Copy of chaturbate users
        /// </summary>
        /// <param name="chaturbate"></param>
        public Chaturbate(Chaturbate chaturbate)
        {
//            this.chatHub = chaturbate.chatHub;
            this.serverHostname = chaturbate.serverHostname;
            foreach (var userPair in chaturbate.users)
            {
                this.users.Add(userPair.Key, userPair.Value);
            }
            //            this.getUsers();
        }
        /// <summary>
        /// Chaturbate user
        /// </summary>
        public class user
        {
            public user Clone()
            {
                return (user)this.MemberwiseClone();
            }
            public string href;
            public string getHref() { return this.href; }
            public string getNick() { return this.href.Replace("/", ""); }
            public string img;
            public string thumbnail_label;
            public string location;
            public string subject;
            public string age;
            public string gender;
            private void setGender(string Gender)
            {
                if (gender != null) Trace.TraceError("gender: " + gender);
                gender = Gender;
            }
            public void setAgeGender(IDomObject el)
            {
                foreach (string classesTitle in el.Classes)
                {
                    switch (classesTitle)
                    {
                        case "age":
                            this.age = el.InnerHTML;
                            break;
                        case "genderf":
                            this.setGender("feamale");
                            break;
                        case "genderm":
                            this.setGender("male");
                            break;
                        case "genderc":
                            this.setGender("pair");
                            break;
                        case "genders":
                            this.setGender("trans");
                            break;
                        default:
                            Trace.TraceError("classesTitle: " + classesTitle);
                            break;
                    }
                }
            }
            public class Cams
            {
                /*Если я оставлю этот конструктор то во время подключения к IRC серверу получу исключение 'System.MissingMethodException
                    Additional information: No parameterless constructor defined for type of 'IRCBot.Chaturbate+user+Cams'.
                в строке 
                    MyIRCServer IRCServer = new JavaScriptSerializer().Deserialize<MyIRCServer>(JSONIRCServer);
                в функции
                    public void ircConnect(string JSONIRCServer)

                public Cams(string cams)
                {
                    MatchCollection matches = new Regex(@"([0-9]+)").Matches(cams);
                    mins = Convert.ToUInt32(matches[0].Value);
                    viewers = Convert.ToUInt32(matches[1].Value);
                }
                */
                public void setCams(string cams)
                {
                    MatchCollection matches = new Regex(@"([0-9]+)").Matches(cams);
                    mins = Convert.ToUInt32(matches[0].Value);
                    viewers = Convert.ToUInt32(matches[1].Value);
                }
                public uint mins = 0;
                public uint viewers = 0;
            }
            public Cams cams;
        }
        /// <summary>
        /// список пользователей, транаслирующих на сайте https://chaturbate.com/
        /// </summary>
        /// <remarks>Key: Chaturbate.user.href </remarks>
        private System.Collections.Generic.Dictionary<string, Chaturbate.user> users
            = new System.Collections.Generic.Dictionary<string, Chaturbate.user>();
        /// <summary>
        /// список отсортиованных по количеству зрителей user.cams.viewers пользователей с сайта https://chaturbate.com/ 
        /// </summary>
        /// <remarks>orderedUsers пришлось заводить отдельно от users потому что в отсортированомм списке похоже нельза добавлять и удалять пользователей</remarks>
        private System.Linq.IOrderedEnumerable<System.Collections.Generic.KeyValuePair<string, IRCBot.Chaturbate.user>> orderedUsers;
        /// <summary>
        /// Удалить из chaturbateOld всех пользователей которые уже есть на веб странице.
        /// Вывести на веб страницу всех пользователей
        /// </summary>
        /// <param name="chaturbateOld">список пользователей, которые уже показаны на веб сранице</param>
        private void updateUsers(IRCBot.Chaturbate chaturbateOld)
        {
            foreach (var itemPair in this.users)
            {
                if ((chaturbateOld != null) && (chaturbateOld.users.ContainsKey(itemPair.Key)))
                    //этот пользователь уже есть на веб странице
                    // из chaturbateOld надо удалить всех пользователей которые уже есть на веб странице
                    chaturbateOld.users.Remove(itemPair.Key);
                //else
                MyIrcClient IRCClient = null;
                if (!string.IsNullOrEmpty(this.serverHostname) && ChatHub.IRCClients.ContainsKey(this.serverHostname))
                    IRCClient = ChatHub.IRCClients.getIRCClient(this.serverHostname, itemPair.Value.getNick());
                //вывести на веб страницу этого пользователя
                ChatHub chatHub = this.chatHub;
                if (chatHub != null)
                    chatHub.Clients.All.onChaturbateUser(this.serverHostname, itemPair.Value, IRCClient == null ? false : IRCClient.isConnected(),
                        IRCClient == null ? null : IRCClient.User.Nick);
            }
        }
        /// <summary>
        /// В списке chaturbateOld остались пользователи, которые прекратили трансляцию на сайте https://chaturbate.com/
        /// Их нужно удалить с веб страницы
        /// </summary>
        public void removeUsers(IRCBot.Chaturbate chaturbateOld)
        {
            if (chaturbateOld == null)
                return;
            MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[chaturbateOld.serverHostname];
            foreach (var itemPair in chaturbateOld.users)
            {
                string nick = itemPair.Value.getNick();
                if (!myIRCClients.ContainsKey(nick))
                    continue;
                MyIrcClient ircClient = myIRCClients[nick];
                ircClient.PlayingVideoStopped();
/*непонятно почему я удаляю пользователя со всех IRC серверов
                foreach (var IRCClientssPair in IRCBot.ChatHub.IRCClients)
                {
                    string nick = itemPair.Value.getNick();
                    if (!IRCClientssPair.Value.ContainsKey(nick))
                        continue;
                    MyIrcClient ircClient = IRCClientssPair.Value[nick];
                    ircClient.PlayingVideoStopped();
                }
*/
                if(this.chatHub != null)
                    this.chatHub.Clients.All.onChaturbateUserRemove(ircClient.ServerHostname, itemPair.Value.getHref());
            }
            chaturbateOld = null;
        }
        /// <summary>
        /// вывести на веб страницу список пользователей, транслирующих на сайте https://chaturbate.com/
        /// и удалить тех, кто прекратил трансляцию
        /// </summary>
        /// <param name="chaturbateOld">список пользователей, которые уже показаны на веб сранице</param>
        public void displayUsers(IRCBot.Chaturbate chaturbateOld)
        {
            if (chaturbateOld == null)
            {
                this.updateUsers(chaturbateOld);
                this.removeUsers(chaturbateOld);
                return;
            }

            //замыкаю список chaturbateOld.users что бы не получить исключение
            //System.InvalidOperationException - "Collection was modified; enumeration operation may not execute."
            //Это исключение иногда появляется если я поставлю птичку updateChaturbate - периодически обновлять список посетителей с сайта Chaturbate
            //и запущу connect all users
            //на сервере irc.webmaster.com
            lock (chaturbateOld.users)
            {
                this.updateUsers(chaturbateOld);
                this.removeUsers(chaturbateOld);
            }
        }
        /// <summary>
        /// присоеденить к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
        /// </summary>
        public class ConnectAll
        {
            /// <summary>
            /// текущий пользователь в списке Chaturbate.users пользователей с сайта https://chaturbate.com/ 
            /// который в данный момент присоединяется к IRC серверу.
            /// Используется для подключения к IRC серверу всех пользователей из Chaturbate.users
            /// </summary>
            private System.Collections.Generic.IEnumerator<System.Collections.Generic.KeyValuePair<string, IRCBot.Chaturbate.user>> enumerator;
            /// <summary>
            /// Stop chaturbate connect all.
            /// The btnChaturbateStop button was clicked
            /// or IRCClient.Disconnected callaed because "ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)"
            /// </summary>
            public void StopConnectAllUsers()
            {
                this.enumerator = null;
            }
            private ChatHub chatHub
            {
                get { return IRCBot.ChatHub.chatHub; }
                set { Trace.Fail("set chatHub is not allowed"); }
            }
/*
            /// <summary>
            /// false - ни один посетитель из текущего списка не был присоединен к IRC серверу потому что они уже присоеденены
            /// </summary>
            /// <remarks>
            /// если ни один посетитель из текущего списка не был присоединен к IRC серверу,
            /// то надо подождать немного, обновить список посетителей с сайта https://chaturbate.com/
            /// и попробовать снова присоединить к IRC серверу
            /// </remarks>
            public bool connect { get; private set; } = false;
*/
            /// <summary>
            /// Timeout присоедения к IRC серверу пользователя, транаслирующего на сайте https://chaturbate.com/
            /// </summary>
            private MyCommon.setTimeout timeoutConnect;
            private void TimeoutConnect(string ServerHostname, IRCBot.Chaturbate.user user, double Interval)
            {
                if ((this.timeoutConnect != null) && (this.timeoutConnect.aTimer.Enabled == true))
                    Trace.Fail("IRCBot.Chaturbate.ConnectAll.timeoutConnect.aTimer.Enabled == true");//Старый таймер не был остановлен перед запуском нового таймера
                this.timeoutConnect = new MyCommon.setTimeout((sender, args) => this.OnIRCConnectTimedEvent(sender, ServerHostname, user), Interval);
            }
            /// <summary>
            /// Присоеденить к IRC серверу пользователя, транаслирующего на сайте https://chaturbate.com/
            /// </summary>
            /// <param name="ServerHostname">Адрес IRC сервера</param>
            /// <remarks>
            /// первый пользователь присоединяется без задержки из public ConnectAll
            /// остальные присоединяются с задержкой из OnConnectTimedEvent
            /// </remarks>
            private void Connect(string ServerHostname)
            {
                if (this.enumerator == null)
                {
                    if (this.chatHub != null)
                        this.chatHub.Clients.All.onServerStatus(ServerHostname, "Connect chaturbate user stopped. IRCBot.Chaturbate.ConnectAll.enumerator == null");
                    return;//The btnChaturbateStop button was clicked
                }
                IRCBot.MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[ServerHostname];
//                short? MaxConnections = new DBChatEntities().ViewIRCNS.SingleOrDefault(item => item.URL == ServerHostname).MaxConnections;
                while (true)
                {
                    if (!this.enumerator.MoveNext())
                    {//закончились посетители с сайта https://chaturbate.com/
                        
                        if (myIRCClients.updateChaturbatePeriod != 0)
                        {//Пользователь установил галочку updateChaturbate
                            //Обновить список посетителей с сайта https://chaturbate.com/ и снова запустить ConnectAllUsers
                            myIRCClients.WaitUpdateUsersList();
                        }
/*
                        if (!this.connect)
                            Trace.Fail("No connect any user 1");
*/
                        return;
                    }
                    var itemPair = this.enumerator.Current;
                    bool boConnected = false;
                    foreach (var IRCClientPair in myIRCClients)
                    {
                        IRCBot.MyIrcClient myIrcClient = IRCClientPair;
                        if(myIrcClient.isConnected() && myIrcClient.JoinBannedChannels())
                        { }
                        else if (
                            (
                                myIrcClient.isConnected()
                                || myIrcClient.erronousNick//Do not connect to IRC server a user with erroneous nickname
                            )
                            && (myIrcClient.chaturbateUser != null)
                            && (myIrcClient.chaturbateUser.getHref() == itemPair.Value.getHref())
                            )
                        {
                            boConnected = true;
                            break;
                        }
                    }
                    if (boConnected)
                        continue;
                    if (myIRCClients.connections(true) >= myIRCClients.MaxConnections)
                    {
                        myIRCClients.WaitUpdateUsersList();
                        break;
                    }
                    this.TimeoutConnect(ServerHostname, itemPair.Value, 1);
                    break;
                }
                if (myIRCClients.connections(true) >= myIRCClients.MaxConnections)
                {
                    Trace.WriteLine("Max connections limit is exceeded.");
                    if (this.enumerator != null)
                        while (this.enumerator.MoveNext()) { }//есть ограничения на количество присоединенных к IRC серверу посетителей с сайта https://chaturbate.com/
                }
            }
            private void OnIRCConnectTimedEvent(object sender, string ServerHostname, IRCBot.Chaturbate.user user)
            {
                ((System.Timers.Timer)sender).Stop();//остановить бесконечный цикл вызова этой функции
                string message = "Connect of chaturbate " + user.href + " to " + ServerHostname;
                Trace.WriteLine(message);
                if (this.chatHub != null)
                    this.chatHub.Clients.All.onServerStatus(ServerHostname, message);
                IRCBot.MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[ServerHostname];
                long delay = myIRCClients.ircConnect2(new MyIRCServer(ServerHostname, user.getNick(), user),
                    myIRCClients.NextConnectionDelay, myIRCClients.MaxConnections, null, this.chatHub);
                if(delay > 0)
                {//Reconnecting too fast
                    message = "Connect of chaturbate " + user.href + " to " + ServerHostname + " too fast. Wait " + delay + " seconds. Start time = "
                    + IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now.AddSeconds(delay), "T");
                    Trace.WriteLine(message);
                    if (this.chatHub != null)
                    {
                        this.chatHub.Clients.All.onServerStatus(ServerHostname, message);
                        this.chatHub.Clients.Caller.onIRCSetStatus(ServerHostname, user.getNick(),
                            "Wait " + delay + " seconds for connect. Start time = "
                            + IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now.AddSeconds(delay), "T"));
                    }
                    this.TimeoutConnect(ServerHostname, user, delay * 1000);
//                    new MyCommon.setTimeout((sender2, args) => this.OnIRCConnectTimedEvent(sender2, ServerHostname, user), delay * 1000);
                    return;
                }
            }
            /// <summary>
            /// Начать присоеденять к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
            /// </summary>
            /// <param name="ServerHostname">Адрес IRC сервера</param>
            /// <param name="Enumerator">текущий пользователь из списка отсортиованных по количеству зрителей user.cams.viewers пользователей с сайта https://chaturbate.com/ </param>
            /// <param name="chatHub">chat hub</param>
            public ConnectAll(string ServerHostname,
                System.Collections.Generic.IEnumerator<System.Collections.Generic.KeyValuePair<string, IRCBot.Chaturbate.user>> Enumerator)
//                , ChatHub chatHub)
            {
                this.enumerator = Enumerator;
//                this.enumerator.Reset(); System.NotSupportedException
//                this.chatHub = chatHub;
                this.Connect(ServerHostname);
            }
            /// <summary>
            /// Присоеденить к IRC серверу следующего пользователя, транаслирующего на сайте https://chaturbate.com/
            /// </summary>
            /// <param name="myIrcClient">Irc Client</param>
            /// <returns>
            /// true - Присоеденить к IRC серверу следующего пользователя
            /// false - сейчас присоединение к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
            /// либо закончилось, либо вообще не запускалось
            /// </returns>
            public bool ConnectNext(IRCBot.MyIrcClient myIrcClient)
            {
//Trace.WriteLine("ConnectNext. " + myIrcClient.ServerHostname);
                if (this.enumerator == null)
                {
//Trace.Fail("ConnectNext. this.enumerator == null");
                    return false;//The btnChaturbateStop button was clicked
                }
                if (this.enumerator.Current.Key == null)
                {
//Trace.Fail("ConnectNext. this.enumerator.Current.Key == null");
                    return false;//сейчас присоединение к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
                                 //либо закончилось, либо вообще не запускалось
                }
                try
                {
                    string message = "Connect Next chaturbate user. " + myIrcClient.ServerHostname;
                    Trace.WriteLine(message);
                    this.Connect(myIrcClient.ServerHostname);
                }
                catch (InvalidOperationException e)
                {
                    Trace.Fail("under constraction " + e.Message);
                }
                catch (Exception)
                {//сюда попадает когда забуду установить MyIrcClient.connectionTicks
                }

                return true;
            }
        }
        public ConnectAll connectAll;
        private string serverHostname;
        /// <summary>
        /// Начать присоеденять к IRC серверу всех пользователей, транаслирующих на сайте https://chaturbate.com/
        /// </summary>
        /// <param name="ServerHostname"></param>
        public void ConnectAllUsers(string ServerHostname)
        {
            if (this.orderedUsers == null)
            {
                Trace.Fail("No chaturbate users");
                return;//нет посетителей с сайта https://chaturbate.com/ . Скрее всего не удалось открыть https://chaturbate.com/ или еще какая то фигня случилась на этом сайте
            }
            this.serverHostname = ServerHostname;
            this.connectAll = new IRCBot.Chaturbate.ConnectAll(ServerHostname, this.orderedUsers.GetEnumerator());//, this.chatHub);
/*
            if (!this.connectAll.connect)
            {//ни один посетитель не был присоединен к IRC серверу потому что они уже присоеденены
             //Для того чтобы продолжить периодическое обновление списка посетителей с сайтаhttps://chaturbate.com/
             /// Надо подождать немного, обновить список посетителей с сайта https://chaturbate.com/
             /// и попробовать снова присоединить к IRC серверу

                //Установить текущее время
                this.ChaturbateTicks = 0;//приравнивается к любому числу для того чтобы вызалась this.ChaturbateTicks.set
                this.WaitUpdateUsersList();
            }
*/
        }
        /// <summary>
        /// Stop chaturbate connect all.
        /// </summary>
        /// <remarks>
        /// The btnChaturbateStop button was clicked
        /// or IRCClient.Disconnected callaed because "ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)"
        /// </remarks>
        public void StopConnectAllUsers()
        {
            if (this.connectAll == null)
                return;
            string message = "StopConnectAllUsers() " + this.serverHostname;
            Trace.WriteLine(message);
            if (this.chatHub != null)
                this.chatHub.Clients.All.onServerStatus(this.serverHostname, message);
            this.connectAll.StopConnectAllUsers();
        }
        /// <summary>
        /// Wait some time and update list of users from https://chaturbate.com/ site again
        /// </summary>
        public void WaitUpdateUsersList()
        {
            long chaturbateTicks = this.ChaturbateTicks;//Приравнивние для того что бы вызвалась ChaturbateTicks.get
        }

        //обойти блокировку в России http://money.krisgerm.com/chaturbate-%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD-%D1%82%D0%B5%D1%80%D1%80%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D0%B8-%D1%80%D0%BE%D1%81%D1%81%D0%B8%D0%B8/
        private static string itemUrl = "https://en.chaturbate.com/";
        /// <summary>
        /// false - IRCBot.Chaturbate.getUsers() никогда не вызывался или прошел период времени, когда снова можно вызвать эту функцию.
        /// true - IRCBot.Chaturbate.getUsers() был вызван но не подошло время когда имеет смысл вызыват ее снова, потому что результат не будет отличаться от предыдущего вызова
        /// </summary>
        /// <remarks>
        /// Иногда IRCBot.Chaturbate.getUsers() вызывается слишко часто.
        /// Ну например когда пользовател поставил галочку updateChaturbate - периодически обновлять список посетителей с сайта https://chaturbate.com/
        /// и нажал btnConnect у владельца канала.
        /// Запусится цикл "Update chaturbate users list and connect all chaturbate users to IRC" который вызывает IRCBot.Chaturbate.getUsers()
        /// первый раз когда получаем ответ ChatSharp.IrcClient.OnWhoIsReceived для владельца канала:
        /// IRCBot.dll!IRCBot.Chaturbate.getUsers() Line 417	C#
        /// IRCBot.dll!IRCBot.Chaturbate.Chaturbate(IRCBot.ChatHub chatHub, string ServerHostname) Line 21	C#
        /// IRCBot.dll!IRCBot.MyIRCClients.chaturbateUsers(string ServerHostname, bool boAllUsers, IRCBot.ChatHub chatHub) Line 741	C#
        /// IRCBot.dll!IRCBot.ChatHub.chaturbateUsers(string ServerHostname, bool boAllUsers) Line 838	C#
        /// IRCBot.dll!IRCBot.MyIRCClients.ChaturbateConnectAllUsers(string ServerHostname, IRCBot.ChatHub chatHub) Line 822	C#
        /// IRCBot.dll!IRCBot.ChatHub.ircChaturbateConnectAll(string ServerHostname) Line 611	C#
        /// IRCBot.dll!IRCBot.MyIRCClients.connectNext(IRCBot.MyIrcClient myIrcClient, IRCBot.ChatHub chatHub, bool boChannelOwner) Line 782	C#
        /// IRCBot.dll!IRCBot.ChatHub.connectNext(IRCBot.MyIrcClient myIrcClient) Line 43	C#
        /// IRCBot.dll!IRCBot.ChatHub.newIRCClient.AnonymousMethod__7_3(object s, ChatSharp.Events.WhoIsReceivedEventArgs e) Line 114	C#
        /// ChatSharp.dll!ChatSharp.IrcClient.OnWhoIsReceived(ChatSharp.Events.WhoIsReceivedEventArgs e) Line 743	C#
        ///
        /// Если при этом ветка chaturbate не была открыта, то при открытии этой ветки IRCBot.Chaturbate.getUsers() вызывается второй раз:
        /// IRCBot.dll!IRCBot.Chaturbate.getUsers() Line 439	C#
        /// IRCBot.dll!IRCBot.Chaturbate.Chaturbate(IRCBot.ChatHub chatHub, string ServerHostname) Line 21	C#
        /// IRCBot.dll!IRCBot.MyIRCClients.chaturbateUsers(string ServerHostname, bool boAllUsers, IRCBot.ChatHub chatHub) Line 741	C#
        /// IRCBot.dll!IRCBot.ChatHub.chaturbateUsers(string ServerHostname, bool boAllUsers) Line 838	C#
        /// Этот стек вызывается из веб страницы "get Chaturbate list"
        /// </remarks>
        private bool gettingUsers = false;

        //for debugging
        //private static bool boFirstUser = true;

        /// <summary>
        /// Получить список пользователей с сайта https://chaturbate.com
        /// </summary>
        /// <returns>true - success</returns>
        public bool getUsers()
        {
            if (this.gettingUsers)
                return true;//слишком часто вызывается эта функция. Список еще не изменился. Надо подождать пока не пройдет время заданное в
                       //IRCBot.MyIRCClients.updateChaturbatePeriod
                       // и не вызовется 
                       // IRCBot.Chaturbate.OnChaturbateTimedEvent
            this.gettingUsers = true;
            this.users.Clear();

            //делаем 10 попыток получить список с сайта https://chaturbate.com/
            int maxAttempts = 10;
            int i = 0;
            for (; i < maxAttempts; i++)
            {
                string message = null;
                if(this.chatHub != null)
                    this.chatHub.Clients.All.onChaturbateStatus(this.serverHostname,
                        this.serverHostname + " Updating chaturbate users..." + (i > 0 ? " Attempt " + (i + 1) + " from " + maxAttempts : ""));

                //Загружаем веб страницу https://chaturbate.com/ 
                try
                {
                    //https://github.com/jamietre/CsQuery
                    //перейти в NuGet и установить CsQuery
                    CsQuery.CQ dom = MyCommon.CQ.CreateFromUrl(itemUrl);
                    if (dom == null)
                        message = itemUrl + " is unavailable. dom == null." + (i > 0 ? " Attempt " + (i + 1) + " from " + maxAttempts + "." : "");
                    else
                    {
                        foreach (IDomObject elList in dom.Find("ul.list"))
                        {
                            foreach (IDomObject elUser in elList.ChildNodes)
                            {
                                if (elUser.NodeName != "LI")
                                    continue;
                                Chaturbate.user user = new Chaturbate.user();
                                //Trace.WriteLine(this.serverHostname + " " + elUser.NodeName + "." + elUser.ClassName);
                                foreach (IDomObject elUserItem in elUser.ChildNodes)
                                {
                                    //Trace.WriteLine(this.serverHostname + " elUserItem: " + elUserItem.NodeName + "." + elUserItem.ClassName);
                                    switch (elUserItem.NodeType)
                                    {
                                        //     An element node.
                                        case CsQuery.NodeType.ELEMENT_NODE:
                                            this.parseElementNode(elUserItem, user);
                                            break;
                                        //     A text node.
                                        case CsQuery.NodeType.TEXT_NODE:
                                            break;
                                        //     A CDATA node.
                                        case CsQuery.NodeType.CDATA_SECTION_NODE:
                                        //     A comment node.
                                        case CsQuery.NodeType.COMMENT_NODE:
                                        //     A document node.
                                        case CsQuery.NodeType.DOCUMENT_NODE:
                                        //     The DOCTYPE node.
                                        case CsQuery.NodeType.DOCUMENT_TYPE_NODE:
                                        //     A document fragment node.
                                        case CsQuery.NodeType.DOCUMENT_FRAGMENT_NODE:
                                            continue;
                                        default:
                                            Trace.TraceError(this.serverHostname + " elUserItem.NodeType: " + elUserItem.NodeType);
                                            continue;
                                    }
                                }
                                /*
                                //for debugging
                                if(IRCBot.Chaturbate.boFirstUser)
                                {
                                    IRCBot.Chaturbate.boFirstUser = false;
                                    user.href = "/ezra/";//переименовать первого пользователя на ник зарегистрированного на irc.freenode.net пользователя
                                }
                                */
                                //                        Trace.WriteLine(new JavaScriptSerializer().Serialize(user));
                                //Trace.WriteLine(this.serverHostname + " new chaturbate user " + user.getHref());
                                if (this.users.ContainsKey(user.getHref()))
                                    //Непонятно почему сюда попадает
                                    //В списке elList одинаковых пльзователей не обнаружил
                                    //Список elList проверял с помощью запрса
                                    //elList.ChildNodes.Where(item => (item.NodeName == "LI") && (item.FirstElementChild.Attributes["Href"] == user.getHref()))
                                    Trace.Fail(this.serverHostname + " IRCBot.Chaturbate.getUsers() failed! Dupliccate user: " + user.getHref());
                                else this.users.Add(user.getHref(), user);
                            }
                        }
                        this.orderedUsers = this.users.OrderByDescending(user => user.Value.cams.viewers);
                    }
                }
                catch (System.UriFormatException uex)
                {
                    Trace.Fail(this.serverHostname + " There was an error in the format of the url: " + itemUrl + " " + uex.Message);
                }
                catch (System.Net.WebException wex)
                {
                    message = this.serverHostname + " There was an error connecting to the url: " + itemUrl + " " + wex.Message + ".";
                }
                if (string.IsNullOrEmpty(message))
                {//success
                    if (this.chatHub != null)
                        this.chatHub.Clients.All.onChaturbateStatus(this.serverHostname, "Ready");
                    //установить время, когда был получен список
                    this.ChaturbateTicks = 0;//приравнивается к любому числу для того чтобы вызалась this.ChaturbateTicks.set
                    break;
                }
                //Неудачная попытка получить список с сайта https://chaturbate.com/
                //Скорее всего сайт временно недоступен
                //Подождать 5 секунд и попробовать еще раз
                //ВНИМАНИЕ!!! Если сюда попадает то трудно остановть IIS пока программа не выйдет из этого цикла
                int pause = 5000;
                if (this.chatHub != null)
                    this.chatHub.Clients.All.onChaturbateStatus(this.serverHostname, this.chatHub.errorMessage(message + " Pause = " + pause/1000 + " sec."));
                System.Threading.Thread.Sleep(pause);
            }
            return i != maxAttempts;
        }
        /// <summary>
        /// Момент времени, когда был получен список пользователей с сайта https://chaturbate.com/  .
        /// In one hundred nanoseconds or one ten-millionth of a second
        /// </summary>
        private long сhaturbateTicks = 0;
        /// <summary>
        /// таймер, который срабатывает когда надо обновить список пользователей с сайта https://chaturbate.com/
        /// </summary>
        /// <remarks>
        /// Эту переменнуюю ввел для предотвращения запуска таймера несколько раз. А то тогда список посеиителей с сайта https://chaturbate.com/
        /// будет загружаться несколько раз подряд и произойдет исключение System.ArgumentException An item with the same key has already been added.
        /// потому что в список будет добавляться один посетитель несколько раз.
        /// 
        /// Если эта переменная не равена нулю, значит таймер уже запущен и не надо его запускать еще раз
        /// </remarks>
        private MyCommon.setTimeout timeout;
        /// <summary>
        /// таймер для обнаружения ошибочной остановки обновления списка пользователей с сайта https://chaturbate.com/
        /// </summary>
        /// <remarks>
        /// иногда непонятно по какой причине прекращается переодическое обновление пользователей с сайта https://chaturbate.com/
        /// Возможно потому что временно было потеряно соединение с IRC сервером.
        /// По этой причине не вызвалась 
        /// IRCClient.WhoIsReceived
        /// которая вызвает
        /// IRCBot.ChatHub.connectNext()
        /// тоесть не присоединяется к IRC серверу следующий пользователь с сайта https://chaturbate.com/
        /// Я запускаю этот таймер и переодически проверяю, вызывалась ли 
        /// IRCBot.Chaturbate.OnChaturbateTimedEvent(...)
        /// со времени последнего срабатывания этго таймера.
        /// Если не запускалась, значит произошла ошибочная остановка обновления списка пользователей с сайта https://chaturbate.com/
        /// Надо ее перезапустить.
        /// </remarks>
        private MyCommon.setTimeout timeoutRestart;
        /// <summary>
        /// true - IRCBot.Chaturbate.OnChaturbateRestartTimedEvent was called
        /// false - IRCBot.Chaturbate.OnChaturbateTimedEvent was called
        /// </summary>
        /// <remarks>
        /// Устанвливается в false каждый раз когда запускается обновление списка пользователей с сайта https://chaturbate.com/
        /// Устанвливается в true каждый раз когда запускается IRCBot.Chaturbate.OnChaturbateRestartTimedEvent
        /// Если после очередного вызова IRCBot.Chaturbate.OnChaturbateRestartTimedEvent
        /// окажется, что boRestart = true, значит в период времени между зарусками IRCBot.Chaturbate.OnChaturbateRestartTimedEvent
        /// ни разу не обновлялся список посетителей.
        /// Зачит по какой то причине обновление списка остановилось.
        /// Нужно перезапустить это обновление.
        /// </remarks>
        private bool boRestart = false;
        public string LogInformation() { return this.timeout == null ? "" : "Update of chaturbate users timeout."; }
        private long ChaturbateTicks
        {
            /// <summary>
            /// Установить момент времени, когда был получен список пользователей с сайта https://chaturbate.com/  .
            /// </summary>
            set
            {
                if (this.сhaturbateTicks != 0)
                {
                    //список пользователей с сайта https://chaturbate.com/ считался более одного раза до того была вызва на OnChaturbateTimedEvent
                    Trace.Fail("setСhaturbateTicks once!");
                }
                this.сhaturbateTicks = IRCBot.ChatHub.IRCClients[this.serverHostname].updateChaturbatePeriod == 0 ? 0 : System.DateTime.Now.Ticks;
                Trace.WriteLine("set IRCBot.Chaturbate.сhaturbateTicks = " + this.сhaturbateTicks);
            }
            /// <summary>
            /// Получить количество секунд, прошедших со времени, когда был получен список пользователей с сайта https://chaturbate.com/
            /// Вызвать this.OnChaturbateTimedEvent  для следующего обновления списка пользователей с сайта https://chaturbate.com/.
            /// </summary> 
            get
            {
                int updateChaturbatePeriod = IRCBot.ChatHub.IRCClients[this.serverHostname].updateChaturbatePeriod;
                if (updateChaturbatePeriod == 0)
                    return 0;
                if (this.сhaturbateTicks == 0)
                {
                    //сюда попадает когда одновременно два посетителя отключаются от IRC сервера.
                    //Детали смотри ниже в комментариях к строке this.сhaturbateTicks = 0;
                    Trace.Fail("setСhaturbateTicks first!");
                    return 0;
                }
                if (this.timeout != null)
                    return 0;//таймер уже запущен и не надо его запускать еще раз
                long seconds = updateChaturbatePeriod - (System.DateTime.Now.Ticks - this.сhaturbateTicks) / 10000000;
                if (seconds <= 0)//0 секунд нельзя ставить потому что не вызовется IRCBot.Chaturbate.ConnectAll.OnConnectTimedEvent
                    seconds = 1;
                if(seconds > 100)
                {//seconds не может быть больше значения, указанного на веб странице в элементе updateChaturbatePeriod
                    //Был случай на IRC сервере irc.efnet.org когда seconds = 49716.
                    Trace.Fail("seconds = " + seconds);
                    seconds = updateChaturbatePeriod;
                }
                string message = "Wait " + seconds + " seconds for update of Chaturbate users list. Start time = "
                    + IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now.AddSeconds(seconds), "T");
                Trace.WriteLine(message + " in " + this.serverHostname);
                if (this.chatHub != null)
                    this.chatHub.Clients.All.onServerStatus(this.serverHostname, message);
                this.timeout = new MyCommon.setTimeout((sender, args) => this.OnChaturbateTimedEvent(sender), seconds * 1000);

                //                this.сhaturbateTicks = 0;//getChaturbateTicks вызывается два раза подряд когда сразу два посетителя отключаются от
                //IRC сервера одновременно. Это почемуто происходит на irc.dal.net когда я:
                // check updateChaturbate
                // press btnConnect for owner of the channel
                // Почемуто одновременно два посетителя с сайта https://chaturbate.com/ подключаются к серверу
                // Поэтому получаю два сообщеия IRC Disconnected. ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
                // одновременно.
                // Как результат дважды вызывается OnChaturbateTimedEvent и одовременно дважды получаю список посетителей с сайта  https://chaturbate.com/
                // и поэтому в этот список дважды вносится один и тот же посетитель.
                // Теперь, когда я добваил эту строку, список считывается один раз а на второй раз просто выводится сообщение об ошибке
                // "setСhaturbateTicks first!" см. выше

                if (this.timeoutRestart == null)
                {
                    //Интервал вызова OnChaturbateRestartTimedEvent.
                    //Равен времени присоединения к IRC серверу всех посетителей Chaturbate плюс время ожидания обновления списка Chaturbate
                    //  и все это удвоить.
                    //Надеюсь за это время хотя бы раз вызовется IRCBot.Chaturbate.OnChaturbateTimedEvent
                    //который устанавливает this.boRestart = false который означает что не нужно делать Restart обновления списка Chaturbate
                    double Interval = 
                        (
                            (
                                (System.DateTime.Now.Ticks//момент времени когда запускается таймер this.timeout,
                                                         //который срабатывает когда надо обновить список пользователей с сайта https://chaturbate.com/
                                - this.сhaturbateTicks//Момент времени, когда был получен предыдущий список пользователей с сайта https://chaturbate.com/
                                ) / 10000//переводим в миллисекунды
                            ) + updateChaturbatePeriod * 1000//update chaturbate users list every this period in milliseconds
                        ) * 2//удвоить. 
                        ;
                    Trace.WriteLine(this.serverHostname + " Restart of update Chaturbate interval = " + Interval + "milliseconds");
                    if (this.chatHub != null)
                        this.chatHub.Clients.Caller.onChaturbateRestart(this.serverHostname, "Time of the next testing of Chaturbate Restart = "
                            + IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now.AddSeconds(Interval / 1000), "T"));
                    this.timeoutRestart = new MyCommon.setTimeout((senderRestart, args) => this.OnChaturbateRestartTimedEvent(senderRestart), Interval);
                }

                return seconds;
            }
        }
        /// <summary>
        /// Вызывается когда закончилась задержка для следующего обновления списка пользователей с сайта https://chaturbate.com/
        /// </summary>
        private void OnChaturbateTimedEvent(object sender)
        {
            ((System.Timers.Timer)sender).Stop();//остановить бесконечный цикл вызова этой функции

            this.timeout = null;//таймер сработал и теперь его можно запустить еще раз

            this.boRestart = false;

            this.сhaturbateTicks = 0;//обнуляю что бы появлялось сообщение об ошибке "setСhaturbateTicks once!" если эта функция не вызвалась.
            //Другими словами после каждого считывания списка пользователей с сайта https://chaturbate.com/
            //нужно обязательно вызвать эту функцию

            string message = "OnChaturbateTimedEvent()";
            Trace.WriteLine(message + " " + this.serverHostname);
            if (this.chatHub != null)
                this.chatHub.Clients.All.onServerStatus(this.serverHostname, message);
            if (this.gettingUsers == false) Trace.Fail("Invalid IRCBot.Chaturbate.gettingUsers");
            this.gettingUsers = false;
            IRCBot.ChatHub.IRCClients[this.serverHostname].ChaturbateConnectAllUsers(this.serverHostname);//, this.chatHub);
//            this.chatHub.ircChaturbateConnectAll(this.serverHostname);
        }
        private void OnChaturbateRestartTimedEvent(object sender)
        {
            MyIRCClients myIRCClients = IRCBot.ChatHub.IRCClients[this.serverHostname];
            if (myIRCClients.updateChaturbatePeriod == 0)
            {//убрал птичку updateChaturbate
                ((System.Timers.Timer)sender).Stop();//остановить бесконечный цикл вызова этой функции

                this.timeoutRestart = null;//таймер сработал и теперь его можно запустить еще раз
                return;
            }
            string message = "";
            if (this.boRestart == true)
            {//по какой то причине обновление списка посетителей Chaturbate остановилось.

                //Что бы попасть сюда во время отладки надо:
                // 1. Для irc.rizon.net поставить птичку updateChaturbate(Connect all chaturbate users and update chaturbate list every )
                //Дождаться сообщения
                //  Wait 20 seconds for update of Chaturbate users list.
                //которое означает что к IRC серверу присоеденилось максимальное количество посетителей с сайта chaturbate
                // 2. Отключить компьютер от интернета
                //Появится ошибка
                //  ERROR: https://en.chaturbate.com/ is unavailable. dom == null. Attempt 10 from 10. Pause = 5 sec.
                //Дождаться сообщения
                // StopConnectAllUsers() irc.rizon.net Time of the next testing of Chaturbate Restart = 7:47:37
                //Вниманике!!! С первого раза сюда не попадает потому что this.boRestart == false
                //
                //Это означает что за время последнего вызова этой функции OnChaturbateRestartTimedEvent
                //список посетителей Chaturbate ни разу не обновлялся
                //
                //Если компьютер все еще отключен от интернета, то сюда будет поподать постоянно
                // 3. Подключить компьютер к интернету
                //Обновления списка посетителе Chaturbate должно восстановиться и сюда перестанет попадать

                message = " Update of Chaturbate problem.";
                Trace.Fail(this.serverHostname + " " + message);
                IRCBot.MyIrcClient channelOwner = myIRCClients.SingleOrDefault(item => item.chaturbateUser == null);
                if (!channelOwner.isConnected())
                {
                    message += " Сначала присоединяется владелец канала, а потом автоматически все остальные";
                    long delay = myIRCClients.ircConnect2(new MyIRCServer(this.serverHostname,
                        channelOwner.User.Nick,
                        channelOwner.chaturbateUser
                        ), myIRCClients.NextConnectionDelay, myIRCClients.MaxConnections, null, this.chatHub);
                }
                else
                {
                    message += " Владелец канала уже присоединен. Надо подключить остальных";
                    this.chatHub.сhaturbateRestart(channelOwner);
/*
                    //Что бы попасть сюда во время отладки надо:
                    //Внимание! для отладки надо убрать комментарий в строке
                    //this.chatHub.Clients.Caller.onUpdateChaturbatePeriod(this.serverHostname, myIRCClients.updateChaturbatePeriod);
                    //расположенной ниже. Потом не забыть снова поствить этот комментарий.
                    // 1. Убрать птичку updateChaturbate что бы после присоедиения владельца канала автоматически не присоеденились посетители Chaturbate
                    // 2. Нажать btnConnect для владельца канала

                    this.chatHub.сhaturbateRestart(channelOwner);
                    //myIRCClients.UpdateChaturbateEvery(myIRCClients.updateChaturbatePeriod);
                    //this.ConnectAllUsers(this.serverHostname);

                    //Во время отладки я убираю птичку updateChaturbate и нажимаю кнопку btnConnect для владельца канала что бы попасть сюда.
                    //Как результат список Chaturbate не обновляется, а только присоединяются уже полученные ранее посетители с сайта Chaturbate
                    //Поставить птичку updateChaturbate
                    //this.chatHub.Clients.Caller.onUpdateChaturbatePeriod(this.serverHostname, myIRCClients.updateChaturbatePeriod);
                    //Внимание! После звершения отладки снова закоментировать строку выше
*/
                }
                if (this.chatHub != null)
                    this.chatHub.Clients.All.onIRCBotMessage(IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now), this.serverHostname,
                        ""//item.Nick
                        , message);
            }
            if (this.chatHub != null)
                this.chatHub.Clients.Caller.onChaturbateRestart(this.serverHostname, " Time of the next testing of Chaturbate Restart = "
                    + IRCBot.ChatHub.RememberMessages.dateFormat(System.DateTime.Now.AddSeconds(((System.Timers.Timer)sender).Interval / 1000), "T") +
                    message);
            this.boRestart = true;
        }
        private ChatHub chatHub
        {
            get { return IRCBot.ChatHub.chatHub; }
            set { Trace.Fail("set chatHub is not allowed"); }
        }
        private void parseElementTitle(IDomObject el, Chaturbate.user user)
        {
            switch (el.NodeName)
            {
                case "A":
                    break;//эта ссылка повторяется
                case "SPAN"://Age gender
                    //Trace.WriteLine("gender: " + gender);
                    user.setAgeGender(el);
                    break;
                default:
                    Trace.TraceError("el.NodeName: " + el.NodeName);
                    break;
            }
        }
        private void parseElementSubject(IDomObject el, Chaturbate.user user)
        {
            switch (el.NodeName)
            {
                case "LI":
                    user.subject = el.InnerHTML;
                    break;
                default:
                    Trace.TraceError("el.NodeName: " + el.NodeName);
                    break;
            }
        }
        private void parseElementSubInfo(IDomObject el, Chaturbate.user user)
        {
            switch (el.NodeName)
            {
                case "LI":
                    switch (el.ClassName)
                    {
                        //<li class="location" style="display: none;">Barbie world</li>
                        case "location":
                            user.location = el.InnerHTML;
                            break;
                        //<li class="cams">47 мин., 325 зрителей</li>
                        case "cams":
                            user.cams = new Chaturbate.user.Cams();
                            user.cams.setCams(el.InnerHTML);
                            break;
                    }
                    break;
                default:
                    Trace.TraceError("el.NodeName: " + el.NodeName);
                    break;
            }
        }
        private void parseElementDetails(IDomObject el, Chaturbate.user user)
        {
            switch (el.NodeName)
            {
                case "DIV":
                    switch (el.ClassName)
                    {
                        case "title":
                            foreach (IDomObject elChild in el.ChildNodes)
                            {
                                if (elChild.NodeType != CsQuery.NodeType.ELEMENT_NODE)
                                    continue;
                                this.parseElementTitle(elChild, user);
                            }
                            break;
                        default:
                            Trace.TraceError("el.NodeName: " + el.NodeName + "el.ClassName: " + el.ClassName);
                            break;
                    }
                    break;
                case "UL":
                    switch (el.ClassName)
                    {
                        case "subject":
                            foreach (IDomObject elChild in el.ChildNodes)
                            {
                                if (elChild.NodeType != CsQuery.NodeType.ELEMENT_NODE)
                                    continue;
                                this.parseElementSubject(elChild, user);
                            }
                            break;
                        case "sub-info":
                            foreach (IDomObject elChild in el.ChildNodes)
                            {
                                if (elChild.NodeType != CsQuery.NodeType.ELEMENT_NODE)
                                    continue;
                                this.parseElementSubInfo(elChild, user);
                            }
                            break;
                        default:
                            Trace.TraceError("el.NodeName: " + el.NodeName + "el.ClassName: " + el.ClassName);
                            break;
                    }
                    break;
                default:
                    Trace.TraceError("el.NodeName: " + el.NodeName);
                    break;
            }
        }
        private void parseElementNode(IDomObject elUserItem, Chaturbate.user user)
        {
            switch (elUserItem.NodeName)
            {
                case "A":
                    user.href = elUserItem.GetAttribute("Href");
                    foreach (IDomObject el in elUserItem.ChildNodes)
                    {
                        if ((el.NodeType == CsQuery.NodeType.ELEMENT_NODE) && (el.NodeName == "IMG"))
                        {
                            user.img = el.GetAttribute("src");
                        }
                    }
                    break;
                case "DIV":
                    foreach (string classes in elUserItem.Classes)
                    {
                        switch (classes)
                        {
                            case "thumbnail_label":
                                user.thumbnail_label = elUserItem.InnerHTML;
                                break;
                            case "thumbnail_label_c_hd":
                            case "thumbnail_label_c_hd_plus":
                            case "thumbnail_label_c":
                            case "thumbnail_label_c_new":
                            case "thumbnail_label_exhibitionist":
                                break;
                            case "details":
                                foreach (IDomObject el in elUserItem.ChildNodes)
                                {
                                    if (el.NodeType != CsQuery.NodeType.ELEMENT_NODE)
                                        continue;
                                    this.parseElementDetails(el, user);
                                }
                                break;
                            default:
                                Trace.TraceError("classes: " + classes);
                                break;
                        }
                    }
                    break;
                default:
                    Trace.TraceError("elUserItem.NodeName: " + elUserItem.NodeName);
                    break;
            }
        }
    }
}