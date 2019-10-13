//using System;
using System.Data.SqlClient;
using System.Text;
namespace MyCommon
{
    public class SqlExceptionTrace
    {
        public string getSqlExceptionTrace(SqlException ex)
        {
            StringBuilder errorMessages = new StringBuilder();
            for (int i = 0; i<ex.Errors.Count; i++)
            {
                errorMessages.Append("Index #" + i + "\n" +
                    "Message: " + ex.Errors[i].Message + "\n" +
                    "LineNumber: " + ex.Errors[i].LineNumber + "\n" +
                    "Source: " + ex.Errors[i].Source + "\n" +
                    "Procedure: " + ex.Errors[i].Procedure + "\n");
            }
            //            System.Diagnostics.Trace.WriteLine("ERROR: " + errorMessages.ToString());
            return errorMessages.ToString();
        }
    }
}