/*
PluginDetect v0.8.2
www.pinlady.net/PluginDetect/license/
[ getVersion isMinVersion hasMimeType ]
[ Flash VLC ]
*/
var PluginDetect={version:"0.8.2",name:"PluginDetect",openTag:"<",isDefined:function(b){return typeof b!="undefined"
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
}}catch(c){}return a
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
if(!c.isString(d)){
return a
}if(d.length==1){c.getVersionDelimiter=d;
return a
}d=d.toLowerCase().replace(/\s/g,"");
b=c.Plugins[d];
if(!b||!b.getVersion){
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
try{d=new b.AXO(a)
}catch(c){};
return d
},INIT:function(){this.init.library(this)
},init:{$:1,hasRun:0,objProperties:function(d,e,b){var a,c={};
if(e&&b){if(e[b[0]]===1&&!d.isArray(e)&&!d.isFunc(e)&&!d.isString(e)&&!d.isNum(e)){for(a=0;
a<b.length;
a=a+2){
e[b[a]]=b[a+1];
c[b[a]]=1
}}for(a in e){if(!c[a]&&e[a]&&e[a][b[0]]===1){this.objProperties(d,e[a],b)
}}}},publicMethods:function(c,f){var g=this,b=g.$,a,d;
if(c&&f){for(a in c){try{if(b.isFunc(c[a])){f[a]=c[a](f)
}}catch(d){}}}},plugin:function(a,c){var d=this,b=d.$;
if(a){d.objProperties(b,a,["$",b,"$$",a]);
if(!b.isDefined(a.getVersionDone)){a.installed=null;
a.version=null;
a.version0=null;
a.getVersionDone=null;
a.pluginName=c
}}},detectIE:function(){var init=this,$=init.$,doc=document,e,x,userAgent=navigator.userAgent||"",progid,progid1,progid2;
$.isIE=eval("/*@cc_on!@*/!1");
$.verIE=$.isIE?((/MSIE\s*(\d+\.?\d*)/i).test(userAgent)?parseFloat(RegExp.$1,10):7):null;
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
}}}}},detectNonIE:function(){var e=this,c=this.$,d=navigator,b=c.isIE?"":d.userAgent||"",f=d.vendor||"",a=d.product||"";
c.isGecko=(/Gecko/i).test(a)&&(/Gecko\s*\/\s*\d/i).test(b);
c.verGecko=c.isGecko?c.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(b)?RegExp.$1:"0.9"):null;
c.isChrome=(/(Chrome|CriOS)\s*\/\s*(\d[\d\.]*)/i).test(b);
c.verChrome=c.isChrome?c.formatNum(RegExp.$2):null;
c.isSafari=!c.isChrome&&((/Apple/i).test(f)||!f)&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(b);
c.verSafari=c.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(b)?c.formatNum(RegExp.$1):null;
c.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(b);
c.verOpera=c.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(b)||1)?parseFloat(RegExp.$1,10):null},detectPlatform:function(){var e=this,d=e.$,b,a=navigator.platform||"";
d.OS=100;
if(a){var c=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];
for(b=c.length-2;
b>=0;
b=b-2){if(c[b]&&new RegExp(c[b],"i").test(a)){d.OS=c[b+1];
break
}}}},library:function(c){var e=this,d=document,b,a;
c.init.objProperties(c,c,["$",c]);
for(a in c.Plugins){c.init.plugin(c.Plugins[a],a)
}e.publicMethods(c.PUBLIC,c);

c.win.init();
c.head=d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]||d.body||null;
e.detectPlatform();
e.detectIE();
e.detectNonIE();
c.init.hasRun=1}},ev:{$:1,handler:function(c,b,a){return function(){c(b,a)
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
if(a>0&&c.isFunc(d[0])){
d[0](c,a>1?d[1]:0,a>2?d[2]:0,a>3?d[3]:0)
}else{if(c.isFunc(d)){
d(c)
}}}},PUBLIC:{isMinVersion:function(b){var a=function(j,h,e,d){var f=b.findPlugin(j),g,c=-1;
if(f.status<0){return f.status
}g=f.plugin;
h=b.formatNum(b.isNum(h)?h.toString():(b.isStrNum(h)?b.getNum(h):"0"));
if(g.getVersionDone!=1){g.getVersion(h,e,d);
if(g.getVersionDone===null){g.getVersionDone=1
}}if(g.installed!==null){c=g.installed<=0.5?g.installed:(g.installed==0.7?1:(g.version===null?0:(b.compareNums(g.version,h,g)>=0?1:-0.1)))
};
return c
};

return a
},getVersion:function(b){var a=function(h,e,d){var f=b.findPlugin(h),g,c;
if(f.status<0){return null
};
g=f.plugin;
if(g.getVersionDone!=1){g.getVersion(null,e,d);
if(g.getVersionDone===null){g.getVersionDone=1
}}c=(g.version||g.version0);
c=c?c.replace(b.splitNumRegx,b.getVersionDelimiter):c;
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
a.ev.callArray(a.win.funcs0);
a.ev.callArray(a.win.funcs);
if(a.DOM){a.DOM.onDoneEmptyDiv()
}},z:0},DOM:{$:1,isEnabled:{$:1,objectTag:function(){var a=this.$;
return a.isIE?a.ActiveXEnabled:1
},objectProperty:function(){var a=this.$;
return a.isIE&&a.verIE>=7?1:0
}},div:null,divID:"plugindetect",divWidth:50,pluginSize:1,altHTML:"&nbsp;&nbsp;&nbsp;&nbsp;",emptyNode:function(c){var b=this,d=b.$,a,f;
if(c&&c.childNodes){for(a=c.childNodes.length-1;
a>=0;
a--){
if(d.isIE){b.setStyle(c.childNodes[a],["display","none"])
}c.removeChild(c.childNodes[a])
}}},LASTfuncs:[],onDoneEmptyDiv:function(){var f=this,g=f.$,b,d,c,a,h;
if(!g.win.loaded||g.win.funcs0.length||g.win.funcs.length){return
}for(b in g.Plugins){d=g.Plugins[b];
if(d){if(d.OTF==3||(d.funcs&&d.funcs.length)){return
}}}g.ev.callArray(f.LASTfuncs);
if(f.div&&f.div.childNodes){for(b=f.div.childNodes.length-1;
b>=0;
b--){c=f.div.childNodes[b];
f.emptyNode(c)}try{f.div.innerHTML=""
}catch(h){}}if(!f.div){a=document.getElementById(f.divID);
if(a){f.div=a
}}if(f.div&&f.div.parentNode){
try{f.div.parentNode.removeChild(f.div)
}catch(h){}f.div=null
}},width:function(){var g=this,e=g.DOM,f=e.$,d=g.span,b,c,a=-1;
b=d&&f.isNum(d.scrollWidth)?d.scrollWidth:a;
c=d&&f.isNum(d.offsetWidth)?d.offsetWidth:a;
return c>0?c:(b>0?b:Math.max(c,b))
},obj:function(b){var g=this,d=g.DOM,c=g.span,f,a=c&&c.firstChild?c.firstChild:null;
try{if(a&&b){d.div.focus()
}}catch(f){}return a
},readyState:function(){var b=this,a=b.DOM.$;
return a.isIE?a.getPROP(b.obj(),"readyState"):b.undefined
},objectProperty:function(){var d=this,b=d.DOM,c=b.$,a;
if(b.isEnabled.objectProperty()){a=c.getPROP(d.obj(),"object")
}return a
},getTagStatus:function(b,m,r,p,f,h){var g=/clsid\s*\:/i,o=r&&g.test(r.outerHTML||"")?r:(p&&g.test(p.outerHTML||"")?p:0),i=r&&!g.test(r.outerHTML||"")?r:(p&&!g.test(p.outerHTML||"")?p:0),l=b&&g.test(b.outerHTML||"")?o:i;
if(!b||!b.span||!m||!m.span||!l||!l.span){return -2
}var s=this,d=s.$,q,k=b.width(),j=l.width(),n=m.width(),c=b.readyState(),a=b.objectProperty(),t=l.readyState();
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
}}}}catch(q){}return b.pi?-0.1:0
},setStyle:function(b,h){var c=this,d=c.$,g=b.style,a,f;
if(g&&h){for(a=0;
a<h.length;
a=a+2){try{g[h[a]]=h[a+1]
}catch(f){}}}},insertDivInBody:function(a,h){var j=this,d=j.$,g,b="pd33993399",c=null,i=h?window.top.document:window.document,f=i.getElementsByTagName("body")[0]||i.body;
if(!f){try{i.write('<div id="'+b+'">.'+d.openTag+"/div>");
c=i.getElementById(b)
}catch(g){}}f=i.getElementsByTagName("body")[0]||i.body;
if(f){f.insertBefore(a,f.firstChild);
if(c){f.removeChild(c)
}}},insert:function(b,i,g,h,c,p,n){var r=this,f=r.$,q,s=document,u,m,o=s.createElement("span"),l,a,v=["outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"],k="outline-style:none;border-style:none;padding:0px;margin:0px;visibility:"+(p?"hidden;":"visible;")+"display:inline;";
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
try{o.innerHTML=u
}catch(q){};
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
