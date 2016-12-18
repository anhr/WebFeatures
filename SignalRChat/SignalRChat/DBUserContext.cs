//http://www.asp.net/signalr/overview/guide-to-the-api/working-with-groups
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

//Error CS0234 The type or namespace name 'Entity' does not exist in the namespace 'System.Data' (are you missing an assembly reference?)
//http://stackoverflow.com/questions/9972426/the-type-or-namespace-name-entity-does-not-exist-in-the-namespace-system-data
//Right-click on the Solution from the Visual Studio Solution Explorer click the Manage Nuget packages for solution and install the EntityFramework
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace DBChatOld
{
    public class UserContext : DbContext
    {
/*
        public UserContext()
            : base("name=Chat")
        {
        }
*/
        public DbSet<User> Users { get; set; }
        public DbSet<Connection> Connections { get; set; }
        public DbSet<ConversationRoom> Rooms { get; set; }
//        public DbSet<UserConversationRooms> UserConversationRoomsRooms { get; set; }
    }

    public class User
    {
        [Key]
        public string UserName { get; set; }
//        public ICollection<Connection> Connections { get; set; }
        public virtual ICollection<Connection> Connections { get; set; }
        public virtual ICollection<ConversationRoom> Rooms { get; set; }
    }

    public class Connection
    {
        [Key]
        public string ConnectionID { get; set; }
//        public virtual ICollection<User> Users { get; set; }
    }

    public class ConversationRoom
    {
        [Key]
        public string RoomName { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}