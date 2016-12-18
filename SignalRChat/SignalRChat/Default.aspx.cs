using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace SignalRChat
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            //http://www.interestprograms.ru/sources/aspnet/program-code-webforms
            var paramChatRoom = Request.Params["chatRoom"];
            string strWhere = "";
            if (paramChatRoom != null)
            {
                strWhere = " where RoomName != '" + paramChatRoom + "'";
            }

            //< !--https://msdn.microsoft.com/en-us/library/system.web.ui.webcontrols.basedataboundcontrol.datasource(v=vs.100).aspx -->
            // This example uses Microsoft SQL Server and connects
            // to the Northwind sample database. The data source needs
            // to be bound to the GridView control only when the 
            // page is first loaded. Thereafter, the values are
            // stored in view state.                      
            if (!IsPostBack)
            {
                SqlDataSourceRooms.SelectCommand = "select RoomName, RoomNameCount from dbo.ViewRoomList" + strWhere + " order by RoomNameCount desc, RoomName";
            }

        }
    }
}
