namespace MyCommon
{
    /// <summary>
    /// Calls an elapsed event after a specified number of milliseconds.
    /// </summary>
    public class setTimeout
    {
        public System.Timers.Timer aTimer {  get; private set; }
        /// <summary>
        /// Calls an elapsed event after a specified number of milliseconds.
        /// </summary>
        /// <param name="ElapsedEventHandler">Elapsed event</param>
        /// <param name="Interval">the interval, expressed in milliseconds, at which to raise the elapsed event</param>
        public setTimeout(System.Timers.ElapsedEventHandler ElapsedEventHandler, double Interval)
        {
            this.aTimer = new System.Timers.Timer();
            this.aTimer.Elapsed += ElapsedEventHandler;
            this.aTimer.Interval = Interval;
            this.aTimer.Enabled = true;
        }
    }
}
