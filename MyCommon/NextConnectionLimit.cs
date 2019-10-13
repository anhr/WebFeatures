using System;
using System.Diagnostics;
using System.Linq;

namespace MyCommon
{
    /// <summary>
    /// Ограничения на присоединению к IRC серверу следующего посетителя с моего хоста
    /// </summary>
    /// <remarks>
    /// Этот код общий для обоих приложений IRCBot и SignalRChat.
    /// Если я буду присоеденяться к IRC серверу слишком часто
    /// или количество присоединенных с моего хоста посетителей превысит лимит, установленный конкретным IRC сервером,
    /// то меня могут забанить.
    /// Нужно учитывать частоту соединений и количество присоединенных посетителей со всех моих приложений - IRCBot и SignalRChat
    /// Поэтому каждое приложение делает веб запрос в другое приложение что бы узнать, когда произошло последнее соединение
    /// и сколько посетителей уже присоеденилось к IRC серверу.
    /// Если последнее соединение из другого приложения произошло позже последнего соединения данного приложения,
    /// то надо учитывать последнее соединение из другого приложения.
    /// Если сумма количества присоединенных с моего хоста посетителей от обоих приложений IRCBot и SignalRChat превысит лимит,
    /// то не надо присоединять нового посетителя.
    /// 
    /// Test plan
    /// 
    /// 1. SignalRChat. IRCBot is not opened
    ///     1.1. irc.dal.net . MaxConnections = 14. NextConnectionDelay = 15000 millisecond
    ///         1.1.1. Open http://localhost/Chat/ IRC tab
    ///             IRC Server URL: irc.dal.net
    ///             Nickname: blink1
    ///             Press Connect
    ///         1.1.2 Repeate 1.1.1 with Nickname: blink2 , blink3... 
    ///             You can see "IRC server error:"Reconnecting too fast. Please wait 13 seconds and try again.""
    ///             if press Connect button faster 15 seconds.
    ///             
    ///             if you see 
    /// 
    ///             ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
    ///             IRC server error:"Too many connections. Wait for someone to quit the IRC server and try again."
    /// 
    ///             try connect again. Now you do not see "Closing Link" and see 
    ///             IRC server error:"Too many connections. Wait for someone to quit the IRC server and try again."
    ///     1.2. irc.efnet.org . MaxConnections = 3. NextConnectionDelay = 80000 millisecond
    ///             Go to 1.1.1 with IRC Server URL: irc.efnet.org
    ///             1.2.2 You can connect 3 users only
    ///             If you try to connect more 3 users, then you do not see "Closing Link" and see 
    ///             IRC server error:"Too many connections. Wait for someone to quit the IRC server and try again."
    ///     1.3. irc.gamesurge.net MaxConnections = null. NextConnectionDelay = null в базе данных нет ограничений на подключение к IRC серверу следующего посетителя
    ///             Когда слишком много посетителей присоединяется, все ранее присоединенные посетители получают:
    ///             :OpServ!OpServ@Services.GameSurge.net NOTICE blink5 :WARNING: You have connected the maximum permitted number of clients from one IP address (clones).  If you connect any more, your host will be temporarily banned from the network.
    ///             Если теперь попробовать присоедениться новому посетителю, то все получают сообщение:
    ///             :VortexServers.IL.US.GameSurge.net 465 blink2 :AUTO Excessive connections from a single host.
    ///             и все отсоединяются и банятся.
    ///     1.4. open.ircnet.net MaxConnections = null. NextConnectionDelay = null в базе данных нет ограничений на подключение к IRC серверу следующего посетителя
    ///             После попытки присоеденить 4 посетителя установилось MaxConnections = 3;
    /// 2. Передать на IRCBot максимальное количество соединений MaxConnections, которое было обнаружено в SignalRChat
    ///     2.1 Войти из SignalRChat на irc.dal.net . MaxConnections = 14. NextConnectionDelay = 15000 millisecond
    ///     2.2 Повторять 2.1. Пока не появится сообщение IRC сервера ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
    ///         Для irc.dal.net MaxConnections = 5.
    ///     2.3 Попробовать войти из IRCBot на irc.dal.net. Сейчас IRCBot не должен пытаться войти на IRC сервер
    ///         потому что все равно получит сообщение ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
    ///         а потом и бан.
    /// 3. Передача количества максимальных соединений из SignalRChat приложения в IRCBot
    ///     В моей базе данныз для IRC сервера irc.dal.net задано слишко большое значение максимальных соединений - 14
    ///     На самом деле максимальных соединений может быть от 4 до 9.
    ///     В данном тесте в приложении SignalRChat определяется правильное значение количества максимальных соединений и передается в IRCBot.
    ///     Определение количества максимальных соединений в IRCBot делается в тесте 5.
    ///     3.1 Делаем максимальное количество соединеинй к irc.dal.net серверу из SignalRChat.
    ///         Это может быть от 4 до 9 соединений
    ///         получаю сообщение ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
    ///     3.2 Делаю попытку присоедениться к irc.dal.net серверу из IRCBot.
    ///         На веб странице IRCBot
    ///             status: Max connections limit 10 is exceeded.
    ///             Max connections: 14 to 10
    ///         Не удалось продключиться к IRC серверу
    ///     3.3 В SignalRChat отключить одного посетителя
    ///     3.4 В IRCBot подключить владельца канала bonalink
    ///     3.5 Попробовать присоедениться к irc.dal.net серверу из Chat.
    ///         Вместо соединения на веб странице Chat получаю сообщение
    ///         IRC server error:"Too many connections. Wait for someone to quit the IRC server and try again."
    ///     3.6 В SignalRChat отключить еще одного посетителя
    ///     3.7 В IRCBot подключить посетителя с сайта chaturbate
    ///     3.8 Присоедениться к irc.dal.net серверу из Chat.
    ///         В IRCBot отключится посетитель с сайта chaturbate что бы освободить место для посетителя из SignalRChat с сообщением
    ///         error :closing link: 95.188.70.66 (quit: release connection for another user)
    ///     3.9 Попробовать присоедениться к irc.dal.net серверу из Chat. 
    ///         Вместо соединения еа веб странице Chat получаю сообщение
    ///         IRC server error:"Too many connections. Wait for someone to quit the IRC server and try again."
    ///         потому что больше нет посетителей с сайта chaturbate и некому освобождать место для нового соединения
    ///     3.10 В IRCBot отключить владельца канала bonalink
    ///     3.11 Теперь можно присоеденить посетителя из SignalRChat
    ///     3.12 Еще одного посетителя из SignalRChat подключить уже нельзя
    /// 4. Проверка отсоединения от IRC сервера посетителя с сайта chaturbate, когда количество посетитеоей превысило максимальное значение
    ///     Это нужно для того, что бы освободить место для посетителя из приложения SignalRChat
    ///     4.1 Из IRCBot соедениться с IRC сервером irc.dal.net как владелец канала bonalink и один посетитель с сайта chaturbate
    ///     4.2 Из SignalRChat соеденяться с IRC сервером irc.dal.net пока не получу сообшение сервера типа "too many connections"
    ///         Сейчас в IRCBot должен отсоедениться посетитель с сайта chaturbate, а посетитель из SignalRChat должен наоборот соедниться.
    ///     4.3 Из SignalRChat попробовать соеденяться с IRC сервером irc.dal.net еще раз.
    ///         Это не получится, потому что кончились посетители с сайта chaturbate
    /// 5. Передача количества максимальных соединений из IRCBot приложения в SignalRChat
    ///     В результате теста приложение SignalRChat должно получить сообщение
    ///     "Too many connections. Wait for someone to quit the IRC server and try again."
    ///     без попытки присоедениться к IRC серверу.
    ///     В моей базе данныз для IRC сервера irc.dal.net задано слишко большое значение максимальных соединений - 14
    ///     На самом деле максимальных соединений может быть от 4 до 9.
    ///     В данном тесте в приложении IRCBot определяется правильное значение количества максимальных соединений и передается в SignalRChat.
    ///     Определение количества максимальных соединений в SignalRChat делается в тесте 3.
    ///     5.1 Делаем максимальное количество соединеинй к irc.dal.net серверу из IRCBot.
    ///         Это может быть от 4 до 9 соединений
    ///         получаю сообщение ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)
    ///     5.2 Теперь надо отлючить от IRC сервера всех посетителей с сайта chaturbate.
    ///         Кнопка btnChaturbateDisconnect Disconnect в ветке Chaturbate.
    ///         А то во время подключения к IRC серверу посетителя
    ///         из приложения SignalRChat автоматически будет отключаться посетитель с сайта chaturbate в приложении IRCBot.
    ///         А нам это не надо потому что в этом тесте в приложении SignalRChat я хочу получить сообщение 
    ///         "Too many connections. Wait for someone to quit the IRC server and try again."
    ///     5.3 Поставить точку останова в строке
    ///         this.MaxConnections = MaxConnections;
    ///         в методе MyCommon.NextConnectionLimit.setMaxConnections
    ///         Из SignalRChat подключаем к IRC серверу несколько посетителей.
    ///         5.3.1 При подключении любого посетителя, кроме второго, в точку останова не попадает.
    ///         5.3.2 При подключении второго посетителя в точку останова попадает и устанавливается правильное значение 
    ///             MyCommon.NextConnectionLimit.MaxConnections
    ///         5.3.3 Когда посетителей становится много, получаю сообщение:
    ///          "Too many connections. Wait for someone to quit the IRC server and try again."
    /// </remarks>
    public abstract class NextConnectionLimit : MyCommon.Query
    {
        public NextConnectionLimit(string ServerHostname, short? MaxConnections = null, int? nextConnectionDelay = null)
        {
            this.MaxConnections = MaxConnections;
            this.nextConnectionDelay = nextConnectionDelay;
            this.ServerHostname = ServerHostname;
        }
        protected string ServerHostname;
        /// <summary>
        /// Название приложения, которому будут делаться запросы через CsQuery
        /// </summary>
        private static string Application;
        /// <summary>
        /// Название приложения, которому будут делаться запросы через CsQuery
        /// </summary>
        public static string application
        {
            private get { return Application; }
            set
            {
                if (!string.IsNullOrEmpty(NextConnectionLimit.application) && (NextConnectionLimit.application != value))
                    Trace.Fail("Reassign MyCommon.NextConnectionLimit.application: " + NextConnectionLimit.application);
                NextConnectionLimit.Application = value;
            }
        }
        /// <summary>
        /// Максимально возможное количество соединений с моего хоста к данному IRC серверу
        /// </summary>
        /// <remarks>
        /// Если не установить это ограничение, то некоторые IRC серверы банят мой хост после нескольких попыток присоединения
        /// и получения сообщения "Too many connections".
        /// По умолчанию равно null - ограничение не установлено
        /// 
        /// Для некоторых IRC серверов это ограничение можно получить из базы данных в таблице DBIRCNS.MaxConnections.
        /// 
        /// Устанвливается при получении от IRC сервера сообщения типа "Too many connections"
        /// Если пользователь пытается присоедениться к IRC серверу, к которому уже присоединено количество пользователей
        /// равное MaxConnections, то этому пользователю приходит сообщение, что присоединение невозможно
        /// и нужно подождать пока кто нибудь не отсоеденится от IRC сервера
        /// </remarks>
        public Nullable<short> MaxConnections { get; protected set; }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="MaxConnections"></param>
        /// <remarks>
        /// В приложении IRCBot кроме установки MyCommon.NextConnectionLimit.MaxConnections
        /// еще выводит это значение на веб страницу
        /// </remarks>
        public virtual void setMaxConnections(short? MaxConnections)
        {
            if (MaxConnections == null)
            {
                Trace.Fail("MyCommon.NextConnectionLimit.setMaxConnections(" + MaxConnections + ") failed!");
                return;
            }
            if((MaxConnections != 0) && ((this.MaxConnections == null)
                //|| (this.MaxConnections > MaxConnections)Если оставить эту проверку, то на некоторых IRC серверах (irc.quakenet.org)
                // может получиться this.MaxConnections = -1
                // Другими словами сейчас this.MaxConnections устанавливается только если он равен null
                ))
                this.MaxConnections = MaxConnections;
        }
        /// <summary>
        /// Абстактный метод, который возвращет количество посетителей, присоединенных к данному IRC серверу в текущем приложениии IRCBot или SognalRChat
        /// </summary>
        /// <returns>IRC server connections count</returns>
        protected abstract int getConnections();
        /// <summary>
        /// The NOTICE reply was receoived from IRC server
        /// </summary>
        /// <param name="notice"></param>
        public void NoticeRecieved(string notice)
        {
            //Это сообщение приходит с irc.dal.net если слишком часто присоединяться с моего хоста
            //IRC > :choopa.nj.us.dal.net NOTICE ZUSR :You have been throttled for 2 minutes for too many connections in a short period of time. Further connections in this period will reset your throttle and you will have to wait longer.
            //IRC > :choopa.nj.us.dal.net NOTICE ZUSR :When you return, if you are throttled again, your throttle will last longer.
            if (notice.IndexOf("You have been throttled for") != -1)
            {
                //Установить время приостановки соединения с IRC сервером
                System.Text.RegularExpressions.GroupCollection groupCollection = System.Text.RegularExpressions.Regex.Match(notice, @"(\d+)").Groups;
                if (groupCollection.Count != 2)
                {
                    Trace.Fail("Invalid groupCollection.Count: " + groupCollection.Count);
                    return;
                }
                long throttledDelay;//minutes
                if (long.TryParse(groupCollection[0].Value, out throttledDelay))
                    this.throttledTicks = System.DateTime.Now.Ticks + throttledDelay * 60 * 10000000;
                else Trace.Fail("Invalid notice: " + notice);
                return;
            }
            ///Это сообщение приходит с irc.gamesurge.net ко всем ранее присоединенным посетителям
            /// когда слишком много посетителей присоединяется.
            /// :OpServ!OpServ@Services.GameSurge.net NOTICE blink5 :WARNING: You have connected the maximum permitted number of clients from one IP address (clones).  If you connect any more, your host will be temporarily banned from the network.
            /// Если теперь попробовать присоедениться новому посетителю, то все получают сообщение:
            /// :VortexServers.IL.US.GameSurge.net 465 blink2 :AUTO Excessive connections from a single host.
            /// и все отсоединяются и банятся.
            if (notice.IndexOf("maximum permitted number of clients") != -1)
            {
                string status;
                uint anotherAppConnections;//Количество посетителей, присоединенных к данному IRC серверу из другого приложения
                int myConnections = this.getConnections();
                short maxConnections = 0;
                NextConnectionLimit.queryConnctions(this.ServerHostname, myConnections, out status, out anotherAppConnections, out maxConnections,
                    this.MaxConnections);
                switch (status)
                {
                    case NextConnectionLimit.strReady:// "Ready":
                        //Общее количество присоединенных к IRC серверу пользователей не превышает максимально допустимое
                        //а если первысило, от IRC сервера был успешно отсоединен один посетитель с сайта chaturbate.
                        //Можно присоединяться к IRC серверу.
                        break;
                    case NextConnectionLimit.strServerNotFound:// "Server is not found":
                        break;//В запрашиваемом приложении не было подключено ни одного пользователя к текущенму IRC серверу
                    case NextConnectionLimit.strNoUsersFromChaturbateSite:// "No users from chaturbate site":
                                                                          //Общее количество присоединенных к IRC серверу пользователей превысило максимально допустимое
                                                                          //и ни один пользователь с сайта chaturbate не был отсоединен потому что нет присоединенных.
                                                                          //Нельзя присоединяться, потому что все равно получишь от IRC сервера сообщение типа "Too many connections"
                                                                          //и тогда могут забанить
                                                                          //                        this.onTooManyConnections();
                        break;
                    default: Trace.Fail("Invalid status: " + status); break;
                }
                short? connections = (short?)(anotherAppConnections + myConnections);
                if (((this.MaxConnections == null) && (connections != null)) || (this.MaxConnections < connections))
                    this.setMaxConnections(connections);
            }
        }
        /// <summary>
        /// Время в Ticks до которго приостановлено соединение с IRC сервером из за того, что было слишком частое соедиение с моего хоста
        /// default null - нет приостановки
        /// </summary>
        /// <remarks>
        /// In one hundred nanoseconds or one ten-millionth of a second
        /// IRC сервер (irc.dal.net) возвратил notice:
        /// :choopa.nj.us.dal.net NOTICE ZUSR :You have been throttled for 2 minutes for too many connections in a short period of time. Further connections in this period will reset your throttle and you will have to wait longer.
        /// :choopa.nj.us.dal.net NOTICE ZUSR :When you return, if you are throttled again, your throttle will last longer.
        /// и приостановил (throttled) соединеие, потому что слишко часто было соедиение с моего хоста
        /// Надо переждать это время. Иначе время приостанвки увеличится
        /// </remarks>
        private long throttledTicks;
        /// <summary>
        /// Получить количество секунд, прошедших со времени последнего присоединения к IRC серверу
        /// </summary>
        /// <returns>количество секунд, прошедших со времени последнего присоединения к IRC серверу</returns>
        public long getLastConnectionSeconds()
        {
            long nextConnectionDelay = 6;//6 секунд задержки между соединениями надо серверу irc.webmaster.com что бы не забанили
            if (this.nextConnectionDelay != null)
                nextConnectionDelay = (long)(this.nextConnectionDelay / 1000);
            long seconds = (System.DateTime.Now.Ticks - this.connectionTicks) / 10000000;
            seconds = nextConnectionDelay - seconds;
            return seconds;
        }
        /// <summary>
        /// Is reconnecting too fast?
        /// </summary>
        /// <param name="outMessage">Сообщение для вывода на веб страницу</param>
        /// <returns>
        /// количество секунд, прошедших со времени последнего присоединения к IRC серверу
        /// 0 - можно присоеденить нового посетителя
        /// > 0 - Reconnecting too fast
        /// </returns>
        public long IsReconnectingTooFast(out string outMessage)
        {
            long delay = 0;
            //Может быть я получал от сервера что то типа
            //NOTICE ZUSR :You have been throttled for 2 minutes for too many connections in a short period of time. Further connections in this period will reset your throttle and you will have to wait longer.
            //если время throttled еще не прошло, соединяться не надо, а то могут забанить
            long throttledTicks = this.throttledTicks - System.DateTime.Now.Ticks;
            if (throttledTicks > 0)
            {
                delay = throttledTicks / 10000000;
                outMessage = "Too many connections in a short period of time. Please wait " + delay + " seconds and try again.";
                return delay;// true;
            }

            //Для того, чтобы предотвратить получения от IRC сервера сообщения типа "Reconnecting too fast" и возможно последующего бана,
            //надо знать когда последний раз было успешное соединение с текущим IRC сервером с моего хоста.
            //Последнее успешное соединение может быть из SignalRChat приложения или из IRCBot

            //get connectionTicks of IRCBot application
            long connectionTicks = 0;

            //https://github.com/jamietre/CsQuery
            //перейти в NuGet и установить CsQuery
            string request = "http://localhost/" + NextConnectionLimit.application + "/"//IRCBot/"
                    + "?request=connectionTicks"
                    + "&ServerHostname=" + this.ServerHostname;
            
//            CsQuery.CQ dom = CsQuery.CQ.CreateFromUrl(request);
            CsQuery.CQ dom = MyCommon.CQ.CreateFromUrl(request);

            //status
            var elStatusArray = dom.Document.GetElementsByTagName(MyCommon.Query.tagStatus);// "status");
            if (elStatusArray.Count() != 1)
            {
                outMessage = "Invalid status count = " + elStatusArray.Count();
                Trace.Fail(outMessage);
                return delay;//true;
            }
            string status = elStatusArray[0].InnerHTML;
            switch (status)
            {
                case NextConnectionLimit.strReady:// "Ready"://successfull received the connectionTicks of IRCBot application

                    //IRCBot connectionTicks
                    CsQuery.INodeList<CsQuery.IDomElement> elConnectionTicksArray =
                        dom.Document.GetElementsByTagName(NextConnectionLimit.strConnectionTicks);// "connectionTicks");
                    switch (elConnectionTicksArray.Count())
                    {
                        case 1:
                            if (!System.Int64.TryParse(elConnectionTicksArray[0].InnerHTML, out connectionTicks))
                            {
                                outMessage = "Invalid IRCBot connectionTicks = " + elConnectionTicksArray[0].InnerHTML;
                                return delay;//true;
                            }
                            break;
                        default:
                            outMessage = "Invalid IRCBot connectionTicks array count = " + elConnectionTicksArray.Count();
                            Trace.Fail(outMessage);
                            return delay;//true;
                    }
                    break;
                case NextConnectionLimit.strServerNotFound://"Server is not found":
                    break;
                default:
                    outMessage = "Invalid status: " + status;
                    Trace.Fail(outMessage);
                    return delay;//true;
            }
            if ((this.connectionTicks == 0) && (connectionTicks == 0))
            {
                //Еще ни один клиент не был присоединен к этому IRC северу ни из SignalRCat ни из IRCBot
                outMessage = "";
                return delay;//false;
            }
            if (this.connectionTicks < connectionTicks)
                this.connectionTicks = connectionTicks;

            if (this.connectionTicks == 0)
            {
                string message = "setConnectionTicks first!";
                Trace.Fail(message);
                outMessage = "";
                return delay;//false;
            }
            delay = this.getLastConnectionSeconds();
            if (delay > 0)
            {
                outMessage = "Reconnecting too fast. Please wait " + delay + " seconds and try again.";
                return delay;
            }
            outMessage = "";
            return delay;
        }
        /// <summary>
        /// Уменьшить задержку подключения к IRC серверу следующего пользователя this.nextConnectionDelay
        /// если от IRC сервера пришло сообщение типа "Reconnecting too fast"
        /// </summary>
        /// <param name="message">сообщение от IRC сервера</param>
        public void ReconnectingTooFast(string message)
        {
            if (
                (message.IndexOf("Reconnecting too fast") == -1)//irc.efnet.org ERROR :Reconnecting too fast, throttled.
                && (message.IndexOf("(re)connect too fast") == -1)//irc.dal.net ERROR :Your host is trying to (re)connect too fast -- throttled.
                )
                return;
            if (this.connectionTicks == 0)
                return;//еще не было ни однлго успещного соединения с IRC сервером. Невозможно определить задержку для следующего соединения
            long minDelay = (System.DateTime.Now.Ticks - this.connectionTicks) / 10000;//milliseconds
            if ((this.nextConnectionDelay != null) && (this.nextConnectionDelay < minDelay))
            {
                Trace.Fail("this.nextConnectionDelay " + this.nextConnectionDelay + " < minDelay " + minDelay);
                return;
            }
            this.nextConnectionDelay = (int)minDelay;
            Trace.WriteLine("Reconnecting too fast. nextConnectionDelay = " + this.nextConnectionDelay + " milliseconds");
        }
        /// <summary>
        /// Задержка подключения к IRC серверу следующего пользователя в миллисекундах
        /// </summary>
        /// <remarks>
        /// Некоторые IRC сервера (irc.efnet.org) ограничивают слишком частое присоединение с одного хоста.
        /// При частом присоедиении они возвращают сообщение типа "Reconnecting too fast".
        /// Что бы не получать это сообщение, для таких серверов надо установить эту задержку, после которой можно присоединяться.
        /// Для некоторых IRC серверов это ограничение можно получить из базы данных в таблице DBIRCNS.NextConnectionDelay.
        /// Если для текущего IRC сервера этого ограничения нет то это значение равно null
        /// </remarks>
        public System.Nullable<int> nextConnectionDelay { get; private set; }
        /// <summary>
        /// Момент времени, когда произошло соединение с IRC сервером из текушего приложения.
        /// In one hundred nanoseconds or one ten-millionth of a second
        /// </summary>
        private long connectionTicks;
        /// <summary>
        /// Установить момент времени, когда произошло соединение с IRC сервером
        /// </summary>
        public void setConnectionTicks() { this.connectionTicks = System.DateTime.Now.Ticks; }
        /// <summary>
        /// Получить момент времени, когда произошло соединение с IRC сервером из текушего приложения
        /// </summary>
        /// <returns>момент времени, когда произошло соединение с IRC сервером</returns>
        public long getConnectionTicks() { return this.connectionTicks; }
        /// <summary>
        /// Результат выполнения TooManyConnections()
        /// </summary>
        public class ResTooManyConnections
        {
            /// <summary>
            /// Constructor
            /// </summary>
            /// <param name="enumTooManyConnections">Результат выполнения TooManyConnections()</param>
            public ResTooManyConnections(ResTooManyConnections.EnumTooManyConnections enumTooManyConnections)
            { this.enumTooManyConnections = enumTooManyConnections; }
            /// <summary>
            /// Результат выполнения TooManyConnections()
            /// </summary>
            public enum EnumTooManyConnections
            {
                responseReady,
                tooManyConnections
            }
            /// <summary>
            /// Результат выполнения IsReconnectingTooFast()
            /// </summary>
            public EnumTooManyConnections enumTooManyConnections { get; private set; }
            /// <summary>
            /// Запоминаю старое значение MaxConnections что бы можно было вывести на веб страницу IRCBot поле maxConnections
            /// которое выводится с помощью chatHub.Clients.Caller.onMaxConnections
            /// </summary>
            public Nullable<short> MaxConnectionsOld;
        }
        public const string strReady = "Ready"; 
        public const string strTooManyConnectionsWait = "Too many connections. Wait for someone to quit the IRC server and try again.";
        public const string strTooManyConnections = "Too many connections";
        public const string strNoUsersFromChaturbateSite = "No users from chaturbate site";
        public const string strServerNotFound = "Server is not found";
        public const string strConnections = "connections";
        public const string strMaxConnections = "maxConnections";
        public const string strConnectionTicks = "connectionTicks";
        private const string strStatus = "status";
        public static string getConnectionsTag(uint connections) { return MyCommon.Query.getTag("connections", connections.ToString()); }
        public static string getConnectionTicksTag(long connectionTicks) { return MyCommon.Query.getTag("connectionTicks", connectionTicks.ToString()); }
        public static string getMaxConnectionsTag(short? maxConnections)
        {
            return maxConnections == null ? "" :
                MyCommon.Query.getTag(NextConnectionLimit.strMaxConnections, maxConnections.ToString());
        }
        /// <summary>
        /// Устанвливает максимально возможное количество соединений с моего хоста к данному IRC серверу
        ///  SignalRChat.NextConnectionLimit.MaxConnections
        /// если в message присутствует фраза типа "Too many connections"
        /// </summary>
        /// <param name="message"></param>
        /// <param name="connections">Количество пользоватей, присоеденившихся к данному IRC серверу из этого приложения</param>
        /// <returns>Результат выполнения TooManyConnections()</returns>
        public NextConnectionLimit.ResTooManyConnections TooManyConnections(string message, int connections)
        {
            //irc.freenode.net: error: closing link: 95.188.70.66(too many user connections(global)))
            //irc.freenode.net: "ERROR :Closing Link: 95.188.70.66 (Too many user connections (global))"
            //irc.dal.net: "ERROR :Closing Link: 0.0.0.0 (Too many connections from your host)"
            if (!((message.IndexOf("Too many ") != -1) && (message.IndexOf(" connections") != -1)))
            {
                //irc.abjects.net: "ERROR :Closing link: (unknown@95.188.70.66) [No more connections allowed from your host via this connect class (local)]"
                if (message.IndexOf("No more connections allowed from your host ") == -1)
                    return null;
            }

            //https://github.com/jamietre/CsQuery
            //перейти в NuGet и установить CsQuery
            string request = "http://localhost/" + NextConnectionLimit.application//IRCBot/"
                    + "?request=" + NextConnectionLimit.strTooManyConnections// Too many connections"
                    + "&ServerHostname=" + this.ServerHostname;
            CsQuery.CQ dom = MyCommon.CQ.CreateFromUrl(request);
//            CsQuery.CQ dom = CsQuery.CQ.CreateFromUrl(request);

            //status
            string status = NextConnectionLimit.getElementValue(dom, NextConnectionLimit.strStatus);
            if (status == null)
                return null;
            NextConnectionLimit.ResTooManyConnections resTooManyConnections = null;
            switch (status)
            {
                case NextConnectionLimit.strReady: // "Ready"://successfull disconnected from IRC server a user from https://chaturbate.com/ site
/*
                    resTooManyConnections = new ResTooManyConnections(ResTooManyConnections.EnumTooManyConnections.responseReady);
//                    chatHub.Clients.Caller.onIRCBotResponseReady();
                    break;
*/
                case NextConnectionLimit.strNoUsersFromChaturbateSite:// "No users from chaturbate site":
                case NextConnectionLimit.strServerNotFound:// "Server is not found":
                    resTooManyConnections = new ResTooManyConnections(ResTooManyConnections.EnumTooManyConnections.tooManyConnections);
//                    chatHub.onTooManyConnections();
                    break;
                default: Trace.Fail("Invalid status: " + status); return null;
            }

            //Another app connections count
            uint anotherAppConnections = 0;
            if (!NextConnectionLimit.getElementValueUInt32(dom, NextConnectionLimit.strConnections, out anotherAppConnections))
                return null;
            resTooManyConnections.MaxConnectionsOld = this.MaxConnections;
            this.MaxConnections = (short)(anotherAppConnections + connections - 1);//Уменьшаем на единицу потому что текуший посетитель будет отключен и connections будет меньше
            return resTooManyConnections;
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
        public bool IsMaxConnections(int connections)
        {
            string status;
            uint otherAppConnections = 0;
            short maxConnections;
            NextConnectionLimit.queryConnctions(this.ServerHostname, connections,
                out status, out otherAppConnections, out maxConnections, this.MaxConnections);
            switch (status)
            {
                case NextConnectionLimit.strReady:// "Ready":
                    //Общее количество присоединенных к IRC серверу пользователей не превышает максимально допустимое
                    //а если первысило, от IRC сервера был успешно отсоединен один посетитель с сайта chaturbate.
                    //Можно присоединяться к IRC серверу.
                    break;
                case NextConnectionLimit.strServerNotFound:// "Server is not found":
                    break;//В приложении IRCBot не было подключено ни одного пользователя к текущенму IRC серверу
                default: Trace.Fail("Invalid status: " + status); break;
            }
            if ((maxConnections != 0) && (this.MaxConnections > maxConnections))
            {//другое приложение устанвило максимальное количество соединений с IRC серером меньше, чем у этого приложения. Надо его уменьшить
                this.MaxConnections = maxConnections;
            }
            return (otherAppConnections + connections) >= this.MaxConnections;
        }
        /// <summary>
        /// Получить строку, содержащуюся в теге tagName в ответе на запрос на веб страницу dom 
        /// </summary>
        /// <param name="dom">ответе на запрос на веб страницу</param>
        /// <param name="tagName">имя тега, значение когорого хочется получить</param>
        /// <returns>Строка в теге tagName или null если тег не найден</returns>
        private static string getElementValue(CsQuery.CQ dom, string tagName)
        {
            string value = null;
            CsQuery.INodeList<CsQuery.IDomElement> elConnectionsArray = dom.Document.GetElementsByTagName(tagName);
            switch (elConnectionsArray.Count())
            {
                case 0: break;//Element is not exists in the response
                case 1:
                    value = elConnectionsArray[0].InnerHTML;
                    break;
                default:
                    Trace.Fail("Invalid \"" + tagName + "\" elements count = " + elConnectionsArray.Count());
                    break;
            }
            return value;
        }
        /// <summary>
        /// Получить uint, содержащийся в теге tagName в ответе на запрос на веб страницу dom 
        /// </summary>
        /// <param name="dom">ответе на запрос на веб страницу</param>
        /// <param name="tagName">имя тега, значение когорого хочется получить</param>
        /// <param name="value">Возвращает значение uint, содержащийся в теге tagName или 0 в случае неудачи</param>
        /// <returns>
        /// true - success
        /// </returns>
        private static bool getElementValueUInt32(CsQuery.CQ dom, string tagName, out uint value)
        {
            value = 0;
            string strValue = NextConnectionLimit.getElementValue(dom, tagName);
            if ((strValue != null) && !System.UInt32.TryParse(strValue, out value))
            {
                Trace.Fail("Invalid \"" + tagName + "\" tag UInt32 value = " + strValue);
                return false;
            }
            return true;
/*
            uint value = 0;
            string strValue = NextConnectionLimit.getElementValue(dom, tagName);
            if ((strValue != null) && !System.UInt32.TryParse(strValue, out value))
            {
                Trace.Fail("Invalid \"" + tagName + "\" tag UInt32 value = " + strValue);
                return null;
            }
            return value;
*/
        }
        /// <summary>
        /// Получить short, содержащийся в теге tagName в ответе на запрос на веб страницу dom 
        /// </summary>
        /// <param name="dom">ответе на запрос на веб страницу</param>
        /// <param name="tagName">имя тега, значение когорого хочется получить</param>
        /// <param name="value">Возвращает значение short, содержащийся в теге tagName или 0 в случае неудачи</param>
        /// <returns>
        /// true - success
        /// </returns>
        private static bool getElementValueInt16(CsQuery.CQ dom, string tagName, out short value)
        {
            value = 0;
            string strValue = NextConnectionLimit.getElementValue(dom, tagName);
            if ((strValue != null) && !System.Int16.TryParse(strValue, out value))
            {
                Trace.Fail("Invalid \"" + tagName + "\" tag Int16 value = " + strValue);
                return false;
            }
            return true;
        }
        /// <summary>
        /// Сделать запрос у другого приложения (IRCBot или SignalRChat) количества соединений к данному IRC серверу
        /// и максимально допустимое количество соединений
        /// </summary>
        /// <param name="ServerHostname">адрес IRC cthdthf</param>
        /// <param name="count">
        /// Количество соединений с ServerHostname IRC сенрвером в данном приложении.
        /// Нужно приложению IRCBot для удаления посетителя с сайта chaturbate
        /// если надо освободить соединение для подключения пользователя из приложения SignalRChat
        /// </param>
        /// <param name="status">Возвращает статус возвражемого ответа на запрос. (Запрос обработан, IRC сервер не найден и т.д.)</param>
        /// <param name="connections">Возвращает количество присоединенных к IRC серверу пользователей из другого приложения</param>
        /// <param name="maxConnections">
        /// Возвращает максимально допустимое количество соединений к IRC серверу, полученное из другого приложения
        /// </param>
        /// <param name="myMaxConnections">
        /// Максимально допустимое количество соединений к IRC серверу из этого приложения.
        /// </param>
        /// <remarks>
        /// Если не передавать myMaxConnections в приложение IRCBot, то не будет отключаться от IRC сервера посетитель с сайта chaturbate
        /// когда количество присоединенных посетителей достигло максимального,
        /// что бы освобдить место для посетителя из приложения SignslRChat.
        /// Потому что может быть неверным значение MaxConnections в приложении IRCBot для данного IRC сервера.
        /// Для теститровпния выполнить пункт
        /// 4. "Проверка отсоединения от IRC сервера посетителя с сайта chaturbate, когда количество посетитеоей превысило максимальное значение"
        /// теста, который написан вверху этого файла
        /// </remarks>
        public static void queryConnctions(string ServerHostname, int count, out string status, out uint connections, out short maxConnections,
            short? myMaxConnections)
        {
            status = "";
            connections = 0;
            maxConnections = 0;

            if (string.IsNullOrEmpty(NextConnectionLimit.application))
            {
                Trace.Fail("MyCommon.NextConnectionLimit.application: " + NextConnectionLimit.application);
                return;
            }

            //https://github.com/jamietre/CsQuery
            //перейти в NuGet и установить CsQuery
            //Возвращает количество присоединенных к IRC серверу пользователей из приложения IRCBot
            //Если количество присоединенных к IRC серверу пользователей превышает максимально допустимое,
            //то от IRC сервера отсоединяется один посетитель с сайта chaturbate если таковые имеются.
            //Тем самым освобождается место для присоединения этого пользователя
            string url = "http://localhost/" + NextConnectionLimit.application + "/"//IRCBot/"
                + "?request=" + NextConnectionLimit.strConnections
                + "&ServerHostname=" + ServerHostname
                + "&" + NextConnectionLimit.strConnections + "=" + count
                + (myMaxConnections == null ? "" : "&" + NextConnectionLimit.strMaxConnections + "=" + myMaxConnections);
            CsQuery.CQ dom = MyCommon.CQ.CreateFromUrl(url);
//            CsQuery.CQ dom = CsQuery.CQ.CreateFromUrl(url);

            //Another app connections count
            if (!NextConnectionLimit.getElementValueUInt32(dom, NextConnectionLimit.strConnections, out connections))
                return;

            //Max connections count
            if (!NextConnectionLimit.getElementValueInt16(dom, NextConnectionLimit.strMaxConnections, out maxConnections))
                return;

            //status
            status = NextConnectionLimit.getElementValue(dom, NextConnectionLimit.strStatus);
            if (status != null )
            {
                Trace.WriteLine("query: " + url);
                Trace.WriteLine(NextConnectionLimit.strStatus + ": " + status
                    + ", " + NextConnectionLimit.strConnections + " = " + connections
                    + ", " + NextConnectionLimit.strMaxConnections + " = " + maxConnections);
            }
        }
    }
}