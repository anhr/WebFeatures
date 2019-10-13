namespace MyCommon
{
    public class CQ : CsQuery.CQ
    {
        /// <summary>
        /// Creates a new DOM from an HTML file.
        /// </summary>
        /// <param name="url">The URL of the remote server.</param>
        /// <returns>A CQ object composed from the HTML response from the server.</returns>
        public static CsQuery.CQ CreateFromUrl(string url)
        {
            CsQuery.Web.ServerConfig options = new CsQuery.Web.ServerConfig();
            options.TimeoutSeconds = 10;
            CsQuery.CQ res = null;
            while (res == null)
            {
                try
                {
                    res = CsQuery.CQ.CreateFromUrl(url, options);
                }
                catch (System.Net.WebException e)
                {
                    System.Diagnostics.Trace.Fail("CreateFromUrl(" + url + ") exception " + e.Message + " options.TimeoutSeconds = " + options.TimeoutSeconds);
                    if (e.Status == System.Net.WebExceptionStatus.Timeout)
                        options.TimeoutSeconds += 10;
                    else break;
                }
            }
            return res;
        }
    }
}
