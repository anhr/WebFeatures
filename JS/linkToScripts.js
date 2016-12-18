/*

    linkToScripts.js v0.2
    Print out links to detection scripts in a web page

*/


(function(){

  // find script elements in a node
  var find = function(node){
     var tmp, childNodes, tagName, x, length, scripts,src, a,href;

     if (!node || !node.getElementsByTagName) return;
     
     scripts = node.getElementsByTagName('script');
     length = scripts.length;
     for (x=0;x<length;x++){
        src = scripts[x].src;
        if (src) saveLink(src);
     };
     
     a = node.getElementsByTagName('a');
     length = a.length;
     for (x=0;x<length;x++){
         href = a[x].href;
         if (href) saveLink(href);
     };


  };  // end of function
  
  var saveLink = function(link){
      var tmp;
      if (link){

           tmp = link.split("/").pop();
           
           if ((/^(.*)(\?)(.*)$/).test(link)) link=RegExp.$1;

           // If has url variable ?showLink=..., then show a link to that item
           // on the web page.
           if ((/^(.*)(\?)(.*)$/).test(tmp) && (RegExp.$3).indexOf("showLink")!=-1)
              names.push("<a href='" + link + "'>" + RegExp.$1 + "</a>");

        };
  };

  var outDivID = "link2Scripts", outDiv;

  var searchIframes = function(){
       var iframes = document.getElementsByTagName('iframe'), x, doc, e, obj;
       if (iframes && iframes.length){
           for (x=0;x<iframes.length;x++){
              
              doc=null;
              try{doc = iframes[x].contentDocument;}
              catch(e){};

              if (doc){
                
                // We have to use try-catch here.
                // When iframe contains a pdf document, for example, we get
                // an error in Firefox 6 when trying to access doc.head or doc.body

                obj = null;
                try{obj = (doc.getElementsByTagName ? doc.getElementsByTagName('head')[0] : 0) || doc.head;}
                catch(e){};
                if (obj) find(obj);

                obj = null;
                try{obj = (doc.getElementsByTagName ? doc.getElementsByTagName('body')[0] : 0) || doc.body;}
                catch(e){};
                if (obj) find(obj);

              };
           };
       };

       outDiv = document.getElementById(outDivID);
       if (outDiv){
            outDiv.innerHTML = message();
       };

  };
  
  // Return the output message.
  // We are assuming here that the first script is PluginDetect.js, and any 
  // additional scripts are the detectors for specific plugins
  // (JavaDetect.js, FlashDetect.js, QuickTimeDetect.js, etc...)
  var message = function(){
       var numScripts = names.length>1 ? "s" : "";
       var numDetectors = names.length>2 ? "s" : "";
       var numUse = names.length>2 ? "" : "s";
       return "<div style='width:99%;'><br>[ The plugin detector(s)" +
         " in this web page use the following" +
         ": " + (names.join(", &nbsp;")) + " ]<br></div>";
  };


  var names=[], doc=document;

  // Search head,body of parent window for scripts
  find( (doc.getElementsByTagName ? doc.getElementsByTagName('head')[0] : 0) || doc.head);
  find( (doc.getElementsByTagName ? doc.getElementsByTagName('body')[0] : 0) || doc.body);

  // Search iframes for scripts
  var iframes = doc.getElementsByTagName('iframe'), t;
  if (iframes && iframes.length){
       outDiv = document.getElementById(outDivID);
       if (!outDiv) doc.write("<div id='" + outDivID + "'></div>");
       t = window.onload;
       window.onload = function(){
          if (typeof t == 'function') t();
          searchIframes();
       };
  }
  // If there are no iframes then just show the results
  else if (names.length){
     outDiv = document.getElementById(outDivID);
     if (outDiv){outDiv.innerHTML = message();}
     else doc.write(message());
  };

})();   // end of function

