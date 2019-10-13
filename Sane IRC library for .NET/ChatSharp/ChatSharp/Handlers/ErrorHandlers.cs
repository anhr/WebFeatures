namespace ChatSharp.Handlers
{
    /// <summary>
    /// IRC error replies handler. See rfc1459 6.1.
    /// </summary>
    internal static class ErrorHandlers
    {
        /// <summary>
        /// IRC Error replies handler. See rfc1459 6.1.
        /// </summary>
        public static void HandleError(IrcClient client, IrcMessage message)
        {
            switch (message.Command)
            {
                case "401"://ERR_NOSUCHNICK "<nickname> :No such nick/channel"
                    RequestOperation requestOperation = client.RequestManager.PeekOperation("WHOIS " + message.Parameters[1]);
                    if (requestOperation != null)
                        ((WhoIs)requestOperation.State).error = message.Command;
                    break;
                case "421"://ERR_UNKNOWNCOMMAND "<command> :Unknown command" - Returned to a registered client to indicate that the command sent is unknown by the server.
                    string nickServ = "NickServ";
                    if (message.Parameters[1] != nickServ)
                        break;
                    RequestOperation requestOperationNickServ = client.RequestManager.DequeueOperation(nickServ);
                    if (requestOperationNickServ != null)
                    {
                        client.SendRawMessage("privmsg " + nickServ + " {0}", requestOperationNickServ.State);
                        return;
                    }
                    break;
            }
            client.OnErrorReply(new Events.ErrorReplyEventArgs(message));
        }
        /// <summary>
        /// IRC fatal error handler.
        /// </summary>
        public static void HandleFatalError(IrcClient client, IrcMessage message)
        {
            client.Disconnect(message);
        }
    }
}
