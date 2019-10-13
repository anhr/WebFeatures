using System.Collections.Generic;
using System.Linq;

namespace ChatSharp
{
    /// <summary>
    /// Represents a raw IRC message. This is a low-level construct - PrivateMessage is used
    /// to represent messages sent from users.
    /// </summary>
    public class IrcMessage
    {
        /// <summary>
        /// The unparsed message.
        /// </summary>
        public string RawMessage { get; private set; }
        /// <summary>
        /// The message prefix.
        /// </summary>
        public string Prefix { get; private set; }
        /// <summary>
        /// The message command.
        /// </summary>
        public string Command { get; private set; }
        /// <summary>
        /// Additional parameters supplied with the message.
        /// </summary>
        public string[] Parameters { get; private set; }

        /// <summary>
        /// Initializes and decodes an IRC message, given the raw message from the server.
        /// </summary>
        public IrcMessage(string rawMessage)
        {
            RawMessage = rawMessage;

            if (rawMessage.StartsWith(":"))
            {
                Prefix = rawMessage.Substring(1, rawMessage.IndexOf(' ') - 1);
                rawMessage = rawMessage.Substring(rawMessage.IndexOf(' ') + 1);
            }

            if (rawMessage.Contains(' '))
            {
                Command = rawMessage.Remove(rawMessage.IndexOf(' '));
                rawMessage = rawMessage.Substring(rawMessage.IndexOf(' ') + 1);
                // Parse parameters
                var parameters = new List<string>();
                while (!string.IsNullOrEmpty(rawMessage))
                {
                    if (rawMessage.StartsWith(":"))
                    {
                        parameters.Add(rawMessage.Substring(1));
                        break;
                    }
                    if (!rawMessage.Contains(' '))
                    {
                        parameters.Add(rawMessage);
                        rawMessage = string.Empty;
                        break;
                    }
                    parameters.Add(rawMessage.Remove(rawMessage.IndexOf(' ')));
                    rawMessage = rawMessage.Substring(rawMessage.IndexOf(' ') + 1);
                }
                Parameters = parameters.ToArray();
            }
            else
            {
                // Violates RFC 1459, but we'll parse it anyway
                Command = rawMessage;
                Parameters = new string[0];
            }
        }
    }
}
