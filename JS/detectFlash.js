/*

      Flash detector v0.2
      By Eric Gerds   http://www.pinlady.net/PluginDetect/

 Note:
  1) In your web page, load the PluginDetect script BEFORE you load this script.
  2) In your web page, have the output <div> BEFORE this script. The <div> looks like this:
       <div id="detectFlash_output"></div>
  3) Feel free to modify this script as you wish.
  4) If you wish to use the plugindetect <div>, then insert it into the <body>,
     anywhere BEFORE the plugin detection begins.
     This <div> temporarily holds any plugin object that is inserted into the web page,
     but only when needed for detection.
     For example:
        <div id="plugindetect" style="right:0px; top:0px; position:absolute;"></div>
     This step is optional, as PluginDetect will create and insert the <div> automatically 
     when needed.


*/


(function(){


 // Return text message based on plugin detection result
 var getStatusMsg = function(obj){
   if (obj.status==1) return "installed & enabled, version is >= " + obj.minVersion;
   if (obj.status==0) return "installed & enabled, version is unknown";
   if (obj.status==-0.1) return "installed & enabled, version is < " + obj.minVersion;
   if (obj.status==-0.2) return "installed but not enabled";
   if (obj.status==-1) return "not installed or not enabled";
   if (obj.status==-3) return "error...bad input argument to PluginDetect method";
   return "unknown";
 };   // end of function

 var out = document.getElementById("detectFlash_output");  // node for output text

 // Add text to output node
 var docWrite = function(text){
     if (out){
        if (text){
          text = text.replace(/&nbsp;/g,"\u00a0");
          out.appendChild(document.createTextNode(text));
        };
        out.appendChild(document.createElement("br"));
     };
 };  // end of function


   // Object that holds all data on the plugin
   var P = {name:"Flash", status:-1, version:null, minVersion:"11,0,0,0"};


   var $=PluginDetect;

   if ($.getVersion){
      P.version = $.getVersion(P.name);
      docWrite("Plugin version: " + P.version);
   };

   if ($.isMinVersion){
      P.status = $.isMinVersion(P.name, P.minVersion);
      docWrite("Plugin status: " + getStatusMsg(P));
   };

   if ($.isIE)
   {
      docWrite("");
      docWrite("ActiveX enabled / ActiveX scripting enabled: " + $.ActiveXEnabled +
        (!$.ActiveXEnabled ? " [this may prevent the plugin from running in Internet Explorer]" : "")
      );
      docWrite("ActiveX Filtering enabled: " + $.ActiveXFilteringEnabled +
        ($.ActiveXFilteringEnabled ? " [this may prevent the plugin from running in Internet Explorer]" : "")
      );
   };


})();   // end of function



