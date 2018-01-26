using System;
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
    }
}