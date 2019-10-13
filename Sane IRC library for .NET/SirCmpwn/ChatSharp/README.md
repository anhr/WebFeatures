# ChatSharp

A C# library for chatting on an IRC (Internet Relay Protocol) network.

Supports a lot of RFC 1459 and a little of 2812.

## Example Usage

```csharp

var client = new IrcClient("irc.freenode.net", new IrcUser("ChatSharp", "ChatSharp"));

client.ConnectionComplete += (s, e) => client.JoinChannel("#botwar");

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
```

## Compiling

On Linux/Mac:

    xbuild /p:Configuration=Release

On Windows, use Visual Studio or similar and build in Release mode.

Regardless of platform, you'll receive binaries in `ChatSharp/bin/Release/`.
ChatSharp has no dependencies.

## Support

Open a [Github issue](https://github.com/SirCmpwn/ChatSharp/issues) describing
your problem.

## Development / Contributing

ChatSharp is developed with the following workflow:

1. Nothing happens for weeks/months/years
2. Someone needs it to do something it doesn't already do
3. That person implements that something and submits a pull request
4. Repeat

If it doesn't have a feature that you want it to have, add it! The code isn't that scary.
