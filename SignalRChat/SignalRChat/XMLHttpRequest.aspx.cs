using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SignalRChat
{
    public partial class XMLHttpRequest : System.Web.UI.Page
    {
        public static string strResponse;
        protected void Page_Load(object sender, EventArgs e)
        {
            string roomName = Request.Params["ValidRoomName"];
            if (roomName != null)
            {
                string userID = Request.Params["userID"];
                if((userID == null) || (userID == ""))
                {
                    strResponse = "ERROR: userID is empty. Request.QueryString: " + Request.QueryString;
                    return;
                }
                using (var db = new ChatContainer())
                {
                    var room = db.DBRooms.Where(u => u.RoomName == roomName).FirstOrDefault();
                    if (room == null)
                    {
//                        strResponse = "1";
                        strResponse = System.Guid.NewGuid().ToString();
                        return;
                    }
                }
                strResponse = "0";
                return;
            }

            roomName = Request.Params["isVisitingRoom"];
            if (roomName != null)
            {
                string browserID = Request.Params["UserBrowserID"];
                if ((browserID == null) || (browserID == ""))
                {
                    strResponse = "ERROR: browserID is empty. Request.QueryString: " + Request.QueryString;
                    return;
                }
                using (var db = new ChatContainer())
                {
                    var room = db.ViewRooms.Where(u => ((u.RoomName == roomName) && (u.BrowserID.ToString() == browserID))).FirstOrDefault();
                    if (room == null)
                    {//The browserID user is not visiting  in the roomName room
                        strResponse = "0";
                        return;
                    }
                }
                strResponse = "1";
                return;
            }
            strResponse = "ERROR: invalid params: " + Request.QueryString;
        }
    }
}