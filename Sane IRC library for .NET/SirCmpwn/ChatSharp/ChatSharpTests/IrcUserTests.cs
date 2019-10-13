using System;
using ChatSharp;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChatSharp.Tests
{
    [TestClass]
    public class IrcUserTests
    {
        [TestMethod]
        public void GetUserModes_NotNull_FiveModes()
        {
            IrcUser user = new IrcUser("~&@%+aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 5);
        }

        [TestMethod]
        public void GetUserModes_NotNull_FourModes()
        {
            IrcUser user = new IrcUser("&@%+aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 4);
        }

        [TestMethod]
        public void GetUserModes_NotNull_ThreeModes()
        {
            IrcUser user = new IrcUser("@%+aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 3);
        }

        [TestMethod]
        public void GetUserModes_NotNull_TwoModes()
        {
            IrcUser user = new IrcUser("%+aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 2);
        }

        [TestMethod]
        public void GetUserModes_NotNull_OneMode()
        {
            IrcUser user = new IrcUser("+aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 1);
        }

        [TestMethod]
        public void GetUserModes_IsNull()
        {
            IrcUser user = new IrcUser("aji", "user");
            IrcClient client = new IrcClient("irc.address", user);

            var userModes = client.ServerInfo.GetModesForNick(user.Nick);

            Assert.IsTrue(userModes.Count == 0);
        }
    }
}
