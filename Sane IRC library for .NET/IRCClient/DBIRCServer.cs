//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace IRCClient
{
    using System;
    using System.Collections.Generic;
    
    public partial class DBIRCServer
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public DBIRCServer()
        {
            this.DBIRCChats = new HashSet<DBIRCChat>();
            this.DBIRCUsers = new HashSet<DBIRCUser>();
        }
    
        public int Id { get; set; }
        public string URL { get; set; }
        public Nullable<short> Port { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public Nullable<int> ChannelId { get; set; }
        public int DBIRCGroupsId { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DBIRCChat> DBIRCChats { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DBIRCUser> DBIRCUsers { get; set; }
        public virtual DBIRCGroup DBIRCGroup { get; set; }
    }
}
