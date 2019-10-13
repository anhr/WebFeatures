using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BotStarter
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Bot starter.");

            BotStarter.Program.timeout = new MyCommon.setTimeout((sender, args2) => BotStarter.Program.OnTimedEvent(sender), 1);
/*
            string response = "";

            //status
            var elStatusArray = dom.Document.GetElementsByTagName(MyCommon.Query.tagStatus);// "status");
            if (elStatusArray.Count() != 1)
            {
                response = "Invalid status count = " + elStatusArray.Count();
                System.Diagnostics.Trace.Fail(response);
            }
            else
            {
                string status = elStatusArray[0].InnerHTML;
                response = "status : " + status;
                Console.WriteLine("request: " + request + " " + response);
                switch (status)
                {
//                    case "Ready":
                    case MyCommon.BotStart.strIRCservers:// "IRC servers":
                        foreach(var IRCServer in dom.Document.GetElementsByTagName(MyCommon.BotStart.tagIRCserver))
                        {
                            Console.WriteLine("IRCServer:");// + IRCServer.InnerHTML);
                            foreach (var tag in IRCServer.ChildNodes)
                            {
                                Console.WriteLine(" " + tag.NodeName + ": " + tag.InnerHTML);
                            }
                        }
                        break;
                    case MyCommon.BotStart.strGetIRCservers:// "get IRC servers":
                        break;
                    default:
                        response = "Unknown status : " + status;
                        System.Diagnostics.Trace.Fail(response);
                        break;
                }
            }
*/
            Console.WriteLine("Press Enter for exit from app.");
            //Console.CursorVisible = false;
            BotStarter.Program.CursorTop = Console.CursorTop;
//BotStarter.Program.OnTimedEvent();
            Console.ReadLine();
        }
        /// <summary>
        /// Default background color is black
        /// </summary>
        private static ConsoleColor BackgroundColor = Console.BackgroundColor;
        private static void WriteRed(string str)
        {
            Console.BackgroundColor = ConsoleColor.Red;
            Console.Write(str);
            Console.BackgroundColor = BotStarter.Program.BackgroundColor;
        }
        /// <summary>
        /// Creates a new DOM from an HTML file.
        /// </summary>
        /// <param name="url">The URL of the remote server.</param>
        /// <returns>A CQ object composed from the HTML response from the server.</returns>
        private static CsQuery.CQ CreateFromUrl(string url)
        {
            CsQuery.Web.ServerConfig options = new CsQuery.Web.ServerConfig();
            options.TimeoutSeconds = 10;
            CsQuery.CQ res = null;
            while (res == null)
            {
                try
                {
                    res = CsQuery.CQ.CreateFromUrl(url, options);
                }
                catch (System.Net.WebException e)
                {
//                    System.Diagnostics.Trace.Fail("CreateFromUrl(" + url + ") exception " + e.Message + " options.TimeoutSeconds = " + options.TimeoutSeconds);
                    BotStarter.Program.WriteRed
                        ("CreateFromUrl(" + url + ") exception " + e.Message + " options.TimeoutSeconds = " + options.TimeoutSeconds + "\r\n");
/*
                    if (e.Status == System.Net.WebExceptionStatus.Timeout)
                        options.TimeoutSeconds += 10;
                    else
*/
                        break;
                }
            }
            return res;
        }
        /// <summary>
        /// Номер строки консоли, начиная с которой обновляется экран консоли
        /// </summary>
        /// <remarks>если это не запоминать, то ичезнут строки в верху экрана консоли</remarks>
        private static int CursorTop;
        /// <summary>
        /// Таймер, который периодически запускает функцию OnTimedEvent для проверки состояния приложения IRCBot
        /// </summary>
        private static MyCommon.setTimeout timeout;
/*
        class MyCQ : MyCommon.CQ
        {
            private static void Trace(string strError) { System.Diagnostics.Trace.Fail(strError); }
        }
*/
        /// <summary>
        /// Эта функция периодически вызывается для проверки состояния приложения IRCBot
        /// </summary>
        /// <param name="sender"></param>
        private static void OnTimedEvent(object sender = null)
        {
            System.Timers.Timer timer = (System.Timers.Timer)sender;

            if (timer != null)
            {
                timer.Stop();//остановить бесконечный цикл вызова этой функции
                if (timer.Interval == 1)
                    timer.Interval = 10 * //seconds
                        1000;
            }

            Console.WriteLine(BotStarter.Program.dateFormat(System.DateTime.Now, "T") + " On timed event.");

            //очистить экран ниже курсора
            Console.BackgroundColor = BotStarter.Program.BackgroundColor;
            for (int i = BotStarter.Program.CursorTop; i < (Console.BufferHeight - BotStarter.Program.CursorTop); i++)
            {
                //                int currentLineCursor = Console.CursorTop;
                Console.SetCursorPosition(0, i);
                Console.Write(new string(' ', Console.BufferWidth));
            }
            Console.SetCursorPosition(0, 0);
            Console.SetCursorPosition(0, BotStarter.Program.CursorTop);

            //Console.Clear();

            //https://github.com/jamietre/CsQuery
            //перейти в NuGet и установить CsQuery
            string request = "http://localhost//IRCBot/" + "?request=" + MyCommon.BotStart.strStart;//start
            CsQuery.CQ dom = BotStarter.Program.CreateFromUrl(request);
            //            CsQuery.CQ dom = MyCommon.CQ.CreateFromUrl(request);
            //            CsQuery.CQ dom = MyCQ.CreateFromUrl(request);

            if (dom == null)
            {
/*
                System.IO.TextWriter errorWriter = Console.Error;
                errorWriter.WriteLine("MyCommon.CQ.CreateFromUrl(" + request + ") failed!");
                return;
*/
            }
            else BotStarter.Program.ChildNodesTree(dom.Document.Body.ChildNodes);

            if (timer != null)
            {
                timer.Start();
                Console.WriteLine("\r\nNext event: " + BotStarter.Program.dateFormat(System.DateTime.Now.AddSeconds(timer.Interval / 1000), "T"));
            }
        }
        public static string dateFormat(System.DateTime date, string format = null)
        { return date.ToString(string.IsNullOrEmpty(format) ? "F" : format, System.Globalization.CultureInfo.CreateSpecificCulture("ru-RU")); }
        /// <summary>
        /// количество отступов в текущей ветке ChildNodes tree
        /// </summary>
        private static uint tab = 0;
        /// <summary>
        /// Вывести на консоль ChildNodes tree
        /// </summary>
        /// <param name="ChildNodes"></param>
        private static void ChildNodesTree(CsQuery.INodeList ChildNodes)
        {
            foreach (var tag in ChildNodes)
            {
                if (tag.NodeName == "#text")
                {
                    //Console.Write(tag.NodeValue);
                    continue;
                }
                if (tag.NodeName == MyCommon.Query.tagNL)
                {
                    string strTab = "";
                    for (uint i = 0; i < BotStarter.Program.tab; i++)
                        strTab += '\t';

                    Console.Write(tag.InnerHTML + strTab);
                    continue;
                }
                string str = tag.NodeName + ": " + ((tag.ChildNodes != null) && (tag.ChildNodes.Count > 0) && (tag.ChildNodes[0].ChildNodes == null) ? tag.InnerHTML : "");
                if (tag.NodeName == MyCommon.BotStart.strError)
                {
                    Console.Write(" ");
                    BotStarter.Program.WriteRed(str);
                }
                else Console.Write(str);
                BotStarter.Program.tab++;
                BotStarter.Program.ChildNodesTree(tag.ChildNodes);
                BotStarter.Program.tab--;
            }
        }
    }
}
