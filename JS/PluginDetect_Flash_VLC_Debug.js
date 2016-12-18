/*
PluginDetect v0.8.2
www.pinlady.net/PluginDetect/license/
[ getVersion isMinVersion hasMimeType ShowMessages ]
[ Flash VLC ]
*/
var PluginDetect={version:"0.8.2",name:"PluginDetect",debug:{$:1,enable:function(){var a=this.$;
a.message.write("[ ]");
a.message.write("[ *** WARNING. DEBUG MODE IS ON. All detection modules for a given plugin will be called during plugin detection. ]");
a.message.write("[ *** WARNING. This only works if the plugin is set up for debug mode. ]");
a.message.write("[ *** WARNING. Initializing script again. ]");
a.dbug=1;
a.INIT()
},disable:function(){var a=this.$;
a.message.write("[ ]");
a.message.write("[ *** WARNING. DEBUG MODE IS OFF. ]");
a.dbug=0
}},message:{$:1,div:null,doc:window.top.document,enable:function(){this.isDisabled=0
},disable:function(){this.isDisabled=1
},toBeRemoved_newRegExp:function(){return new RegExp(this.RegExp.toBeRemoved,"g")
},detectAny_newRegExp:function(){return new RegExp(this.RegExp.detectAny,"g")
},time:function(c,b){var d="date0000",a="";
if(c){if(!c[d]||b){c[d]=new Date()
}else{a=(new Date().getTime()-c[d].getTime())+" millisec"
}}return a
},addBR:function(){var a=this;
a.div.appendChild(a.doc.createElement("br"))
},addText:function(h,a,f){var e=this,g=e.$,d=null,c=e.doc.createTextNode(h);
if(e.div){if(a||f){d=e.doc.createElement("span")
}if(a){g.DOM.setStyle(d,["fontWeight","bold"])
}if(f){g.DOM.setStyle(d,["color","#BB0000"])
}if(d){e.div.appendChild(d);
d.appendChild(c)
}else{e.div.appendChild(c)
}}},RegExp:{badInputString:"(\\)[\\s\\n\\r]*;|\\)[\\s\\n\\r]*\\})",toBeRemoved:"([\\d\\.\\_\\$a-zA-Z]+\\.message\\.(write|init)[\\s\\n\\r]*\\([\\s\\S]*?\\)[\\s\\n\\r]*)(?=;|\\})",detectAny:"\\.message\\.",z:0},checkString:function(a){var b=this,c=b.$;
if((new RegExp(b.RegExp.badInputString)).test(a)){b.addText(" [ *** ERROR: "+c.name+'.message.write( ) not allowed to have "'+RegExp.$1+'" within input string ]',1,1)
}},storage:[],writeOneItem:function(b){var e=this,f=e.$,a,c,d=200;
for(a=0;
a<b.length;
a++){if(a==b.length-1&&!b[a]){e.addBR()
}else{if(f.isString(b[a])){c=(/\[.*\*.*error|\[.*\*.*warning/i).test(b[a]);
e.addText(b[a],1,c);
e.checkString(b[a])
}else{if(b[a]&&b[a].message){c=b[a].message;
if(c.length>d){c=c.substring(0,d)+"..."
}e.addText(c)
}}}}},write:function(b,c){var d=this,e=d.$,a;
if(!b||!e||!e.message){return
}if(!e.isArray(b)){b=[b]
}b.push(c?1:0);
if(d.isDisabled){d.storage.push(b);
return
}if(!d.div){d.div=d.doc.createElement("div");
e.DOM.setStyle(d.div,["color","black","border","solid blue 2px","padding","5px","width","98%","fontSize","18px","margin","5px","backgroundColor","#B3AAAA"]);
e.DOM.insertDivInBody(d.div,1);
d.addText("This box displays STATUS/ERROR messages for "+e.name+" v"+e.version,1);
d.addBR();
d.addText('This box is visible when you select the "Show status/error messages" option in the '+e.name+" download page.",1);
d.addBR();
d.addBR()
}if(d.storage.length){d.storage.push(b);
for(a=0;
a<d.storage.length;
a++){d.writeOneItem(d.storage[a])
}d.storage=[];
return
}d.writeOneItem(b)
},args2String:function(c){var e=this,f=e.$,a,b=[],d;
if(f.isDefined(c)){if(!f.isArray(c)){c=[c]
}for(a=0;
a<c.length;
a++){if(f.isString(c[a])){b[a]='"'+c[a]+'"'
}else{if(c[a]===null){b[a]="null"
}else{if(f.isFunc(c[a])){if((/(function[^\(]*?\()/i).test(c[a].toString())&&(RegExp.$1).length<100){b[a]=RegExp.$1+" ){ }"
}else{b[a]="function F( ){ }"
}}else{if(f.isArray(c[a])){b[a]="["+e.args2String(c[a])+"]"
}else{if(f.isNum(c[a])){b[a]=c[a].toString()
}else{if(!f.isDefined(c[a])){break
}else{if(c[a]&&c[a]!==true&&c[a].toString){b[a]="object{ }"
}else{b[a]="???"
}}}}}}}}}return b.length?b.join(", "):""
},z:0},openTag:"<",isDefined:function(b){return typeof b!="undefined"
},isArray:function(b){return(/array/i).test(Object.prototype.toString.call(b))
},isFunc:function(b){return typeof b=="function"
},isString:function(b){return typeof b=="string"
},isNum:function(b){return typeof b=="number"
},isStrNum:function(b){return(typeof b=="string"&&(/\d/).test(b))
},getNumRegx:/[\d][\d\.\_,\-]*/,splitNumRegx:/[\.\_,\-]/g,getNum:function(b,c){var d=this,a=d.isStrNum(b)?(d.isDefined(c)?new RegExp(c):d.getNumRegx).exec(b):null;
return a?a[0]:null
},compareNums:function(h,f,d){var e=this,c,b,a,g=parseInt;
if(e.isStrNum(h)&&e.isStrNum(f)){if(e.isDefined(d)&&d.compareNums){return d.compareNums(h,f)
}c=h.split(e.splitNumRegx);
b=f.split(e.splitNumRegx);
for(a=0;
a<Math.min(c.length,b.length);
a++){if(g(c[a],10)>g(b[a],10)){return 1
}if(g(c[a],10)<g(b[a],10)){return -1
}}}return 0
},formatNum:function(b,c){var d=this,a,e;
if(!d.isStrNum(b)){return null
}if(!d.isNum(c)){c=4
}c--;
e=b.replace(/\s/g,"").split(d.splitNumRegx).concat(["0","0","0","0"]);
for(a=0;
a<4;
a++){if(/^(0+)(.+)$/.test(e[a])){e[a]=RegExp.$2
}if(a>c||!(/\d/).test(e[a])){e[a]="0"
}}return e.slice(0,4).join(",")
},getPROP:function(d,b,a){var c;
try{if(d){a=d[b]
}}catch(c){this.message.write('[ WARNING: Accessing object["'+b+'"] causes an error. ]')
}return a
},findNavPlugin:function(l,e,c){var j=this,h=new RegExp(l,"i"),d=(!j.isDefined(e)||e)?/\d/:0,k=c?new RegExp(c,"i"):0,a=navigator.plugins,g="",f,b,m;
for(f=0;
f<a.length;
f++){m=a[f].description||g;
b=a[f].name||g;
if((h.test(m)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))||(h.test(b)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))){if(!k||!(k.test(m)||k.test(b))){return a[f]
}}}return null
},getMimeEnabledPlugin:function(k,m,c){var e=this,f,b=new RegExp(m,"i"),h="",g=c?new RegExp(c,"i"):0,a,l,d,j=e.isString(k)?[k]:k;
for(d=0;
d<j.length;
d++){if((f=e.hasMimeType(j[d]))&&(f=f.enabledPlugin)){l=f.description||h;
a=f.name||h;
if(b.test(l)||b.test(a)){if(!g||!(g.test(l)||g.test(a))){return f
}}}}return 0
},getVersionDelimiter:",",findPlugin:function(d){var c=this,b,d,a={status:-3,plugin:0};
if(!c.isString(d)){c.message.write("[ ***** ERROR ***** Bad input argument. Plugin name should be a string. ]");
return a
}if(d.length==1){c.getVersionDelimiter=d;
return a
}d=d.toLowerCase().replace(/\s/g,"");
b=c.Plugins[d];
if(!b||!b.getVersion){c.message.write("[ ***** ERROR ***** Bad input argument. Unrecognized plugin name: "+c.message.args2String(d)+" ]");
return a
}a.plugin=b;
a.status=1;
return a
},getPluginFileVersion:function(f,b){var h=this,e,d,g,a,c=-1;
if(h.OS>2||!f||!f.version||!(e=h.getNum(f.version))){return b
}if(!b){return e
}e=h.formatNum(e);
b=h.formatNum(b);
d=b.split(h.splitNumRegx);
g=e.split(h.splitNumRegx);
for(a=0;
a<d.length;
a++){if(c>-1&&a>c&&d[a]!="0"){return b
}if(g[a]!=d[a]){if(c==-1){c=a
}if(d[a]!="0"){return b
}}}return e
},AXO:window.ActiveXObject,getAXO:function(a){var d=null,c,b=this;
b.message.write(b.message.time(b.getAXO,1));
try{d=new b.AXO(a)
}catch(c){}b.message.write((d?"[ created ActiveXObject(":"[ Unable to create ActiveXObject(")+b.message.args2String(a)+") in "+b.message.time(b.getAXO)+" ]");
return d
},INIT:function(){this.init.library(this)
},init:{$:1,hasRun:0,objProperties:function(d,e,b){var a,c={};
if(e&&b){if(e[b[0]]===1&&!d.isArray(e)&&!d.isFunc(e)&&!d.isString(e)&&!d.isNum(e)){for(a=0;
a<b.length;
a=a+2){d.message.write(a>0&&d.isDefined(e[b[a]])&&e[b[a]]!==b[a+1]?"[ *** WARNING: object."+b[a]+" should not be defined. ]":0);
e[b[a]]=b[a+1];
c[b[a]]=1
}}for(a in e){if(!c[a]&&e[a]&&e[a][b[0]]===1){this.objProperties(d,e[a],b)
}}}},publicMethods:function(c,f){var g=this,b=g.$,a,d;
b.message.write("[ ]");
if(c&&f){for(a in c){try{if(b.isFunc(c[a])){f[a]=c[a](f)
}b.message.write(b.isFunc(c[a])?"[ Initializing public method "+(f.name?f.name+".":"")+a+"( ) ]":0)
}catch(d){b.message.write(d)
}}}},plugin:function(a,c){var d=this,b=d.$;
if(a){d.objProperties(b,a,["$",b,"$$",a]);
if(!b.isDefined(a.getVersionDone)){a.installed=null;
a.version=null;
a.version0=null;
a.getVersionDone=null;
a.pluginName=c
}}},detectIE:function(){var init=this,$=init.$,doc=document,e,x,userAgent=navigator.userAgent||"",progid,progid1,progid2;
$.message.write("[ ]");
$.message.write("[ START Detect Internet Explorer ]");
$.isIE=eval("/*@cc_on!@*/!1");
$.message.write("[ "+$.name+".isIE: "+$.isIE+" ]");
$.verIE=$.isIE?((/MSIE\s*(\d+\.?\d*)/i).test(userAgent)?parseFloat(RegExp.$1,10):7):null;
$.message.write("[ "+$.name+".verIE: "+$.verIE+" ]");

$.message.write("[ ]");
$.message.write("[ START ActiveX detection ]");
$.ActiveXEnabled=!1;
$.ActiveXFilteringEnabled=!1;
if($.isIE){try{$.ActiveXFilteringEnabled=window.external.msActiveXFilteringEnabled()
}catch(e){}progid1=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","TDCCtl.TDCCtl","Shell.UIHelper","HtmlDlgSafeHelper.HtmlDlgSafeHelper","Scripting.Dictionary"];
progid2=["WMPlayer.OCX","ShockwaveFlash.ShockwaveFlash","AgControl.AgControl",];
progid=progid1.concat(progid2);
for(x=0;
x<progid.length;
x++){if($.getAXO(progid[x])){$.ActiveXEnabled=!0;
if(!$.dbug){break
}}}if($.ActiveXEnabled&&$.ActiveXFilteringEnabled){for(x=0;
x<progid2.length;
x++){if($.getAXO(progid2[x])){$.ActiveXFilteringEnabled=!1;
break
}}}}$.message.write("[ "+$.name+".ActiveXEnabled: "+$.ActiveXEnabled+" ]");
$.message.write("[ "+$.name+".ActiveXFilteringEnabled: "+$.ActiveXFilteringEnabled+" ]");
$.message.write("[ END ActiveX detection ]");
$.message.write("[ END Detect Internet Explorer ]")
},detectNonIE:function(){var e=this,c=this.$,d=navigator,b=c.isIE?"":d.userAgent||"",f=d.vendor||"",a=d.product||"";
c.message.write("[ ]");
c.message.write("[ START Detect non-IE browsers ]");
c.isGecko=(/Gecko/i).test(a)&&(/Gecko\s*\/\s*\d/i).test(b);
c.verGecko=c.isGecko?c.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(b)?RegExp.$1:"0.9"):null;
c.message.write("[ "+c.name+".isGecko: "+c.isGecko+" ]");
c.message.write("[ "+c.name+".verGecko: "+c.verGecko+" ]");
c.isChrome=(/(Chrome|CriOS)\s*\/\s*(\d[\d\.]*)/i).test(b);
c.verChrome=c.isChrome?c.formatNum(RegExp.$2):null;
c.message.write("[ "+c.name+".isChrome: "+c.isChrome+" ]");
c.message.write("[ "+c.name+".verChrome: "+c.verChrome+" ]");
c.isSafari=!c.isChrome&&((/Apple/i).test(f)||!f)&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(b);
c.verSafari=c.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(b)?c.formatNum(RegExp.$1):null;
c.message.write("[ "+c.name+".isSafari: "+c.isSafari+" ]");
c.message.write("[ "+c.name+".verSafari: "+c.verSafari+" ]");
c.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(b);
c.verOpera=c.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(b)||1)?parseFloat(RegExp.$1,10):null;
c.message.write("[ "+c.name+".isOpera: "+c.isOpera+" ]");
c.message.write("[ "+c.name+".verOpera: "+c.verOpera+" ]");
c.message.write("[ END Detect non-IE browsers ]")
},detectPlatform:function(){var e=this,d=e.$,b,a=navigator.platform||"";
d.message.write("[ ]");
d.message.write("[ START Detect Platform ]");
d.OS=100;
if(a){var c=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];
for(b=c.length-2;
b>=0;
b=b-2){if(c[b]&&new RegExp(c[b],"i").test(a)){d.OS=c[b+1];
break
}}}d.message.write("[ "+d.name+".OS: "+d.OS+" ("+(c[b])+") ]");
d.message.write("[ END Detect Platform ]")
},library:function(c){var e=this,d=document,b,a;
c.init.objProperties(c,c,["$",c]);
c.message.write(!c.init.hasRun?c.message.time(c,1):0);
c.message.write(c.message.time(e.library,1));
c.message.write("[ START Initializing "+c.name+" Library ]");
for(a in c.Plugins){c.init.plugin(c.Plugins[a],a)
}e.publicMethods(c.PUBLIC,c);

c.win.init();

c.message.write("[ ]");
c.message.write("[ navigator.userAgent: "+(navigator.userAgent||"")+" ]");
c.message.write("[ navigator.vendor: "+(navigator.vendor||"")+" ]");
c.message.write("[ navigator.product: "+(navigator.product||"")+" ]");
c.message.write("[ navigator.platform: "+(navigator.platform||"")+" ]");
c.head=d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]||d.body||null;
e.detectPlatform();
e.detectIE();
e.detectNonIE();
c.init.hasRun=1;
c.message.write("[ END Initializing "+c.name+" Library in "+c.message.time(e.library)+" ]")
}},ev:{$:1,handler:function(c,b,a){return function(){c(b,a)
}
},fPush:function(b,a){var c=this,d=c.$;
if(d.isArray(a)&&(d.isFunc(b)||(d.isArray(b)&&b.length>0&&d.isFunc(b[0])))){a.push(b)
}},callArray:function(b){var c=this,d=c.$,a,e;
if(d.isArray(b)){e=[].concat(b);
for(a=0;
a<e.length;
a++){c.call(e[a]);
b.splice(0,1)
}}},call:function(d){var b=this,c=b.$,a=c.isArray(d)?d.length:-1;
if(a>0&&c.isFunc(d[0])){c.message.write("[ executing "+((((/(function[^\(]*?\()/i).test(d[0].toString())&&(RegExp.$1).length<100)?RegExp.$1+" ){ }":"function F( ){ }"))+" ]");
d[0](c,a>1?d[1]:0,a>2?d[2]:0,a>3?d[3]:0)
}else{if(c.isFunc(d)){c.message.write("[ executing "+((((/(function[^\(]*?\()/i).test(d.toString())&&(RegExp.$1).length<100)?RegExp.$1+" ){ }":"function F( ){ }"))+" ]");
d(c)
}}}},PUBLIC:{isMinVersion:function(b){var a=function(j,h,e,d){var f=b.findPlugin(j),g,c=-1;
b.message.write(b.message.time(b.isMinVersion,1));
if(f.status<0){return f.status
}g=f.plugin;
h=b.formatNum(b.isNum(h)?h.toString():(b.isStrNum(h)?b.getNum(h):"0"));
b.message.write("[ ]");
b.message.write("[ START "+b.name+".isMinVersion("+b.message.args2String([j,h,e,d])+") ]");
if(g.getVersionDone!=1){g.getVersion(h,e,d);
if(g.getVersionDone===null){g.getVersionDone=1
}}if(g.installed!==null){c=g.installed<=0.5?g.installed:(g.installed==0.7?1:(g.version===null?0:(b.compareNums(g.version,h,g)>=0?1:-0.1)))
}b.message.write("[ END "+b.name+".isMinVersion("+b.message.args2String([j,h,e,d])+") == "+c+" in "+b.message.time(b.isMinVersion)+" ]");
b.message.write("[ "+b.message.time(b)+" after script initialization ]");
b.message.write("[ ]");
return c
};

return a
},getVersion:function(b){var a=function(h,e,d){var f=b.findPlugin(h),g,c;
b.message.write(b.message.time(b.getVersion,1));
if(f.status<0){return null
}b.message.write("[ ]");
b.message.write("[ START "+b.name+".getVersion("+b.message.args2String([h,e,d])+") ]");
g=f.plugin;
if(g.getVersionDone!=1){g.getVersion(null,e,d);
if(g.getVersionDone===null){g.getVersionDone=1
}}c=(g.version||g.version0);
c=c?c.replace(b.splitNumRegx,b.getVersionDelimiter):c;
b.message.write("[ END "+b.name+".getVersion("+b.message.args2String([h,e,d])+") == "+b.message.args2String(c)+" in "+b.message.time(b.getVersion)+" ]");
b.message.write("[ "+b.message.time(b)+" after script initialization ]");
b.message.write("[ ]");
return c
};

return a
},hasMimeType:function(b){var a=function(d){if(!b.isIE&&d&&navigator&&navigator.mimeTypes){var g,f,c,e=b.isArray(d)?d:(b.isString(d)?[d]:[]);
for(c=0;
c<e.length;
c++){if(b.isString(e[c])&&/[^\s]/.test(e[c])){g=navigator.mimeTypes[e[c]];
f=g?g.enabledPlugin:0;
if(f&&(f.name||f.description)){return g
}}}}return null
};

return a
},z:0},win:{$:1,loaded:false,hasRun:0,init:function(){var b=this,a=b.$;
if(!b.hasRun){b.hasRun=1;
b.addEvent("load",a.ev.handler(b.runFuncs,a));
b.addEvent("unload",a.ev.handler(b.cleanup,a))
}},addEvent:function(c,b){var e=this,d=e.$,a=window;
if(d.isFunc(b)){if(a.addEventListener){a.addEventListener(c,b,false)
}else{if(a.attachEvent){a.attachEvent("on"+c,b)
}else{a["on"+c]=e.concatFn(b,a["on"+c])
}}}},concatFn:function(d,c){return function(){d();
if(typeof c=="function"){c()
}}
},funcs0:[],funcs:[],cleanup:function(b){for(var a in b){b[a]=0
}b=0
},runFuncs:function(a){a.win.loaded=true;
a.message.write("[ ]");
a.message.write("[ window.onload event has fired "+a.message.time(a)+" after script initialization ]");
a.message.write(a.message.time(a.win.runFuncs,1));
a.message.write("[ START event handlers for "+(a.onWindowLoaded?a.name+".onWindowLoaded( )":"window.onload")+" ]");
a.ev.callArray(a.win.funcs0);
a.ev.callArray(a.win.funcs);
a.message.write("[ END event handlers for "+(a.onWindowLoaded?a.name+".onWindowLoaded( )":"window.onload")+" in "+a.message.time(a.win.runFuncs)+" ]");
if(a.DOM){a.DOM.onDoneEmptyDiv()
}},z:0},DOM:{$:1,isEnabled:{$:1,objectTag:function(){var a=this.$;
return a.isIE?a.ActiveXEnabled:1
},objectProperty:function(){var a=this.$;
return a.isIE&&a.verIE>=7?1:0
}},div:null,divID:"plugindetect",divWidth:50,pluginSize:1,altHTML:"&nbsp;&nbsp;&nbsp;&nbsp;",emptyNode:function(c){var b=this,d=b.$,a,f;
if(c&&c.childNodes){for(a=c.childNodes.length-1;
a>=0;
a--){d.message.write(c.childNodes[a].tagName?"[ removing <"+c.childNodes[a].tagName+"> tag ]":0);
if(d.isIE){b.setStyle(c.childNodes[a],["display","none"])
}c.removeChild(c.childNodes[a])
}}},LASTfuncs:[],onDoneEmptyDiv:function(){var f=this,g=f.$,b,d,c,a,h;
if(!g.win.loaded||g.win.funcs0.length||g.win.funcs.length){return
}for(b in g.Plugins){d=g.Plugins[b];
if(d){if(d.OTF==3||(d.funcs&&d.funcs.length)){return
}}}g.ev.callArray(f.LASTfuncs);
g.message.write("[ ]");
g.message.write("[ START removing HTML tags from the DOM that were inserted by "+g.name+" ]");
if(f.div&&f.div.childNodes){for(b=f.div.childNodes.length-1;
b>=0;
b--){c=f.div.childNodes[b];
f.emptyNode(c);
g.message.write(c.tagName?"[ removing <"+c.tagName+"> tag ]":0)
}try{f.div.innerHTML=""
}catch(h){}}if(!f.div){a=document.getElementById(f.divID);
if(a){f.div=a
}}if(f.div&&f.div.parentNode){g.message.write('[ removing <div id="'+f.divID+'">'+g.openTag+"/div> tag ]");
try{f.div.parentNode.removeChild(f.div)
}catch(h){}f.div=null
}g.message.write("[ END removing HTML tags from the DOM that were inserted by "+g.name+" ]");
g.message.write("[ ]");
g.message.write("[ Array of window.onload event handlers, $.win.funcs0.length: "+g.win.funcs0.length+" ]");
g.message.write("[ Array of window.onload event handlers, $.win.funcs.length: "+g.win.funcs.length+" ]");
g.message.write("[ Array of very last handlers, $.DOM.LASTfuncs.length: "+f.LASTfuncs.length+" ]");
g.message.write("[ ]");
g.message.write("[ "+g.message.time(g)+" after script initialization ]")
},width:function(){var g=this,e=g.DOM,f=e.$,d=g.span,b,c,a=-1;
b=d&&f.isNum(d.scrollWidth)?d.scrollWidth:a;
c=d&&f.isNum(d.offsetWidth)?d.offsetWidth:a;
return c>0?c:(b>0?b:Math.max(c,b))
},obj:function(b){var g=this,d=g.DOM,c=g.span,f,a=c&&c.firstChild?c.firstChild:null;
try{if(a&&b){d.div.focus()
}}catch(f){d.$.message.write(["[ Unable to use focus() method on $.DOM.div ] ",f])
}return a
},readyState:function(){var b=this,a=b.DOM.$;
return a.isIE?a.getPROP(b.obj(),"readyState"):b.undefined
},objectProperty:function(){var d=this,b=d.DOM,c=b.$,a;
if(b.isEnabled.objectProperty()){a=c.getPROP(d.obj(),"object")
}return a
},getTagStatus:function(b,m,r,p,f,h){var g=/clsid\s*\:/i,o=r&&g.test(r.outerHTML||"")?r:(p&&g.test(p.outerHTML||"")?p:0),i=r&&!g.test(r.outerHTML||"")?r:(p&&!g.test(p.outerHTML||"")?p:0),l=b&&g.test(b.outerHTML||"")?o:i;
if(!b||!b.span||!m||!m.span||!l||!l.span){return -2
}var s=this,d=s.$,q,k=b.width(),j=l.width(),n=m.width(),c=b.readyState(),a=b.objectProperty(),t=l.readyState();
d.message.write("[ ]");
d.message.write("[ TagToTestHTML is an <"+b.tagName+"> tag ]");
d.message.write("[ TagToTestHTML.tagName: "+b.tagName+" ]");
d.message.write("[ TagToTestHTML.object: "+(a?"object{ }":a)+" ]");
d.message.write("[ TagToTestHTML.time: "+b.time+" ]");
d.message.write("[ TagToTestHTML.width: "+k+" ]");
d.message.write("[ TagToTestHTML.readyState: "+c+" ]");
d.message.write("[ DummyObjTagHTML is an <"+l.tagName+"> tag ]");
d.message.write("[ DummyObjTagHTML.tagName: "+l.tagName+" ]");
d.message.write("[ DummyObjTagHTML.object: "+(l.objectProperty()?"object{ }":l.objectProperty())+" ]");
d.message.write("[ DummyObjTagHTML.time: "+l.time+" ]");
d.message.write("[ DummyObjTagHTML.width: "+j+" ]");
d.message.write("[ DummyObjTagHTML.readyState: "+t+" ]");
if(k<0||j<0||n<=s.pluginSize){return 0
}if(a){return 1.5
}if(h&&!b.pi&&d.isDefined(a)&&d.isIE&&b.tagName==l.tagName&&b.time<=l.time&&k===j&&c===0&&t!==0){b.pi=1
}if(j<n){return b.pi?-0.1:0
}if(k>=n){if(!b.winLoaded&&d.win.loaded){return b.pi?-0.5:-1
}if(d.isNum(f)){if(!d.isNum(b.count2)){b.count2=f
}if(f-b.count2>0){return b.pi?-0.5:-1
}}}try{if(k==s.pluginSize&&(!d.isIE||c===4)){if(!b.winLoaded&&d.win.loaded){return 1
}if(b.winLoaded&&d.isNum(f)){if(!d.isNum(b.count)){b.count=f
}if(f-b.count>=5){return 1
}}}}catch(q){d.message.write(q)
}return b.pi?-0.1:0
},setStyle:function(b,h){var c=this,d=c.$,g=b.style,a,f;
if(g&&h){for(a=0;
a<h.length;
a=a+2){try{g[h[a]]=h[a+1]
}catch(f){}}}},insertDivInBody:function(a,h){var j=this,d=j.$,g,b="pd33993399",c=null,i=h?window.top.document:window.document,f=i.getElementsByTagName("body")[0]||i.body;
if(!f){try{i.write('<div id="'+b+'">.'+d.openTag+"/div>");
c=i.getElementById(b)
}catch(g){d.message.write(["[ Unable to use document.write? ] ",g])
}}f=i.getElementsByTagName("body")[0]||i.body;
if(f){f.insertBefore(a,f.firstChild);
if(c){f.removeChild(c)
}}},insert:function(b,i,g,h,c,p,n){var r=this,f=r.$,q,s=document,u,m,o=s.createElement("span"),l,a,v=["outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"],k="outline-style:none;border-style:none;padding:0px;margin:0px;visibility:"+(p?"hidden;":"visible;")+"display:inline;";
f.message.write(f.message.time(r.insert,1));
if(!f.isDefined(h)){h=""
}if(f.isString(b)&&(/[^\s]/).test(b)){b=b.toLowerCase().replace(/\s/g,"");
u=f.openTag+b+" ";
u+='style="'+k+'" ';
var j=1,t=1;
for(l=0;
l<i.length;
l=l+2){if(/[^\s]/.test(i[l+1])){u+=i[l]+'="'+i[l+1]+'" '
}if((/width/i).test(i[l])){j=0
}if((/height/i).test(i[l])){t=0
}}u+=(j?'width="'+r.pluginSize+'" ':"")+(t?'height="'+r.pluginSize+'" ':"");
u+=">";
for(l=0;
l<g.length;
l=l+2){if(/[^\s]/.test(g[l+1])){u+=f.openTag+'param name="'+g[l]+'" value="'+g[l+1]+'" />'
}}u+=h+f.openTag+"/"+b+">"
}else{b="";
u=h
}if(!n&&!r.div){a=s.getElementById(r.divID);
if(a){r.div=a
}else{r.div=s.createElement("div");
r.div.id=r.divID
}r.setStyle((n||r.div),v.concat(["verticalAlign","baseline","display","block"]).concat(n?[]:["width",r.divWidth+"px","height",(r.pluginSize+3)+"px","fontSize",(r.pluginSize+3)+"px","lineHeight",(r.pluginSize+3)+"px"]));
if(!n&&!a){r.setStyle(r.div,["position","absolute","right","0px","top","0px"]);
r.insertDivInBody(r.div)
}}m={span:null,winLoaded:f.win.loaded,tagName:b,outerHTML:u,DOM:r,time:new Date().getTime(),width:r.width,obj:r.obj,readyState:r.readyState,objectProperty:r.objectProperty};
if((n||r.div)&&(n||r.div).parentNode){
r.setStyle(o,v.concat(["verticalAlign","baseline","display","inline"]).concat(n?[]:["fontSize",(r.pluginSize+3)+"px","lineHeight",(r.pluginSize+3)+"px"]));
(n||r.div).appendChild(o);
f.message.write("[ inserting HTML tag: <span>"+u+f.openTag+"/span> ]");
try{o.innerHTML=u
}catch(q){f.message.write(["[ Unable to set span.innerHTML? ] ",q])
}f.message.write("[ HTML tag has been inserted in "+f.message.time(r.insert)+" ]");
m.span=o;
m.winLoaded=f.win.loaded
}return m
}},Plugins:{flash:{$:1,mimeType:"application/x-shockwave-flash",progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",getVersion:function(){var b=function(i){if(!i){return null
}var e=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(i);
return e?e[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null
};
var j=this,g=j.$,k,h,l=null,c=null,a=null,f,m,d;
if(!g.isIE){m=g.hasMimeType(j.mimeType);
if(m&&g.DOM.isEnabled.objectTag()){f=g.DOM.insert("object",["type",j.mimeType],[],"",j).obj();
try{l=g.getNum(f.GetVariable("$version"))
}catch(k){}}if(!l){d=m?m.enabledPlugin:null;
if(d&&d.description){l=b(d.description)
}if(l){l=g.getPluginFileVersion(d,l)
}}}else{for(h=15;
h>2;
h--){c=g.getAXO(j.progID+"."+h);
if(c){a=h.toString();
break
}}if(!c){c=g.getAXO(j.progID)
}if(a=="6"){try{c.AllowScriptAccess="always"
}catch(k){return"6,0,21,0"
}}try{l=b(c.GetVariable("$version"))
}catch(k){}if(!l&&a){l=a
}}j.installed=l?1:-1;
j.version=g.formatNum(l);
return true
}},vlc:{$:1,mimeType:"application/x-vlc-plugin",progID:"VideoLAN.VLCPlugin",classID:"clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921",compareNums:function(e,d){var c=this.$,k=e.split(c.splitNumRegx),i=d.split(c.splitNumRegx),h,b,a,g,f,j;
for(h=0;
h<Math.min(k.length,i.length);
h++){j=/([\d]+)([a-z]?)/.test(k[h]);
b=parseInt(RegExp.$1,10);
g=(h==2&&RegExp.$2.length>0)?RegExp.$2.charCodeAt(0):-1;
j=/([\d]+)([a-z]?)/.test(i[h]);
a=parseInt(RegExp.$1,10);
f=(h==2&&RegExp.$2.length>0)?RegExp.$2.charCodeAt(0):-1;
if(b!=a){return(b>a?1:-1)
}if(h==2&&g!=f){return(g>f?1:-1)
}}return 0
},getVersion:function(){var c=this,b=c.$,d,a=null;
if(!b.isIE){if(b.hasMimeType(c.mimeType)){d=b.findNavPlugin("VLC.*Plug-?in",0,"Totem");
if(d&&d.description){a=b.getNum(d.description,"[\\d][\\d\\.]*[a-z]*")
}}c.installed=a?1:-1
}else{d=b.getAXO(c.progID);
if(d){a=b.getNum(b.getPROP(d,"VersionInfo"),"[\\d][\\d\\.]*[a-z]*")
}c.installed=a?1:(d?0:-1)
}c.version=b.formatNum(a)
}},zz:0}};
PluginDetect.INIT();
