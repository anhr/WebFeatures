using System;
/*
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
*/
namespace WelcomeToChat
{
    public partial class Default : System.Web.UI.Page
    {
        public string browserID = null;
        public bool IsEditProfile()
        { return (browserID != null) && (browserID != ""); }
        protected void Page_Load(object sender, EventArgs e)
        {
//            if (IsPostBack == true)
            {
                //http://www.interestprograms.ru/sources/aspnet/program-code-webforms
                var paramBrowserID = Request.Params["browserID"];
                if (paramBrowserID != null)
                {
                    browserID = paramBrowserID;
                }
            }
        }

/*
        public string userId = null;
        public bool IsEditProfile()
        { return userId != null; }
        protected void Page_Load(object sender, EventArgs e)
        {
//            if (IsPostBack == true)
            {
                //http://www.interestprograms.ru/sources/aspnet/program-code-webforms
                var paramUserId = Request.Params["userId"];
                if (paramUserId != null)
                {
                    userId = paramUserId;
                }
            }
        }
*/
    }
}