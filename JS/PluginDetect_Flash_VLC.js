/*
PluginDetect v0.8.7
www.pinlady.net/PluginDetect/license/
[ getVersion isMinVersion hasMimeType ]
[ Flash VLC ]
*/
var PluginDetect={version:"0.8.7",name:"PluginDetect",openTag:"<",hasOwnProperty:({}).constructor.prototype.hasOwnProperty,hasOwn:function(c,d){var b,a;
try{a=this.hasOwnProperty.call(c,d)
}catch(b){}return !!a
},rgx:{str:/string/i,num:/number/i,fun:/function/i,arr:/array/i,any:/Boolean|String|Number|Function|Array|Date|RegExp|Error/i},toString:({}).constructor.prototype.toString,isPlainObject:function(c){var a=this,b;
if(!c||a.rgx.any.test(a.toString.call(c))||c.window==c||a.rgx.num.test(a.toString.call(c.nodeType))){return 0
}try{if(!a.hasOwn(c,"constructor")&&!a.hasOwn(c.constructor.prototype,"isPrototypeOf")){return 0
}}catch(b){return 0
}return 1
},isDefined:function(b){return typeof b!="undefined"
},isArray:function(b){return this.rgx.arr.test(this.toString.call(b))
},isString:function(b){return this.rgx.str.test(this.toString.call(b))
},isNum:function(b){return this.rgx.num.test(this.toString.call(b))
},isStrNum:function(b){return this.isString(b)&&(/\d/).test(b)
},isFunc:function(b){return this.rgx.fun.test(this.toString.call(b))
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
},findNavPlugin:function(h){if(h.dbug){return h.dbug
}if(window.navigator){var d=this,n={Find:d.isString(h.find)?new RegExp(h.find,"i"):h.find,Find2:d.isString(h.find2)?new RegExp(h.find2,"i"):h.find2,Avoid:h.avoid?(d.isString(h.avoid)?new RegExp(h.avoid,"i"):h.avoid):0,Num:h.num?/\d/:0},f,c,g,j,m,l,b,a=navigator.mimeTypes,k=navigator.plugins,o=null;
if(h.mimes&&a){m=d.isArray(h.mimes)?[].concat(h.mimes):(d.isString(h.mimes)?[h.mimes]:[]);
for(f=0;
f<m.length;
f++){c=0;
try{if(d.isString(m[f])&&/[^\s]/.test(m[f])){c=a[m[f]].enabledPlugin
}}catch(j){}if(c){g=d.findNavPlugin_(c,n);
if(g.obj){o=g.obj
};
if(o&&!d.dbug){return o
}}}}if(h.plugins&&k){l=d.isArray(h.plugins)?[].concat(h.plugins):(d.isString(h.plugins)?[h.plugins]:[]);
for(f=0;
f<l.length;
f++){c=0;
try{if(l[f]&&d.isString(l[f])){c=k[l[f]]
}}catch(j){}if(c){g=d.findNavPlugin_(c,n);
if(g.obj){o=g.obj
};
if(o&&!d.dbug){return o
}}}b=k.length;
if(d.isNum(b)){for(f=0;
f<b;
f++){c=0;
try{c=k[f]
}catch(j){}if(c){g=d.findNavPlugin_(c,n);
if(g.obj){o=g.obj
};
if(o&&!d.dbug){return o
}}}}}}return o
},findNavPlugin_:function(f,d){var e=this,c=f.description||"",b=f.name||"",a={};
if((d.Find.test(c)&&(!d.Find2||d.Find2.test(b))&&(!d.Num||d.Num.test(RegExp.leftContext+RegExp.rightContext)))||(d.Find.test(b)&&(!d.Find2||d.Find2.test(c))&&(!d.Num||d.Num.test(RegExp.leftContext+RegExp.rightContext)))){if(!d.Avoid||!(d.Avoid.test(c)||d.Avoid.test(b))){a.obj=f
}}return a
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
},getPluginFileVersion:function(d,h){var b=this,a,c,i,j,f=-1,g;
if(!d){return h
}if(d.version){a=b.getNum(d.version+"")
};
if(!a||!h){return h||a||null
}a=b.formatNum(a);
h=b.formatNum(h);
c=h.split(b.splitNumRegx);
i=a.split(b.splitNumRegx);
for(j=0;
j<c.length;
j++){if(f>-1&&j>f&&c[j]!="0"){return h
}if(i[j]!=c[j]){if(f==-1){f=j
}if(c[j]!="0"){return h
}}}return a
},AXO:(function(){var b,a;
try{b=new window.ActiveXObject()
}catch(a){}return b?null:window.ActiveXObject
})(),getAXO:function(a){var d=null,c,b=this;
try{d=new b.AXO(a)
}catch(c){};
if(d){b.browser.ActiveXEnabled=!0
}return d
},browser:{},INIT:function(){this.init.library(this)
},init:{$:1,hasRun:0,objProperties:function(d,e,c){var a,b={};
if(e&&c){if(e[c[0]]===1&&d.hasOwn(e,c[0])&&d.isPlainObject(e)){for(a=0;
a<c.length;
a=a+2){
e[c[a]]=c[a+1];
b[c[a]]=1
}}for(a in e){if(e[a]&&e[a][c[0]]===1&&d.hasOwn(e,a)&&!d.hasOwn(b,a)){
this.objProperties(d,e[a],c)
}}}},plugin:function(a,c){var d=this,b=d.$;
if(b.isPlainObject(a)&&b.isFunc(a.getVersion)){if(!b.isDefined(a.getVersionDone)){
a.installed=null;
a.version=null;
a.version0=null;
a.getVersionDone=null;
a.pluginName=c
}d.objProperties(b,a,["$",b,"$$",a])}},detectIE:function(){var init=this,$=init.$,browser=$.browser,doc=document,e,x,tmp,userAgent=window.navigator?navigator.userAgent||"":"",progid,progid1,progid2;
browser.ActiveXFilteringEnabled=!1;
browser.ActiveXEnabled=!1;
try{browser.ActiveXFilteringEnabled=!!window.external.msActiveXFilteringEnabled()
}catch(e){}progid1=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","TDCCtl.TDCCtl","Shell.UIHelper","HtmlDlgSafeHelper.HtmlDlgSafeHelper","Scripting.Dictionary"];
progid2=["WMPlayer.OCX","ShockwaveFlash.ShockwaveFlash","AgControl.AgControl"];
progid=progid1.concat(progid2);
for(x=0;
x<progid.length;
x++){if($.getAXO(progid[x])&&!$.dbug){break
}}if(browser.ActiveXEnabled&&browser.ActiveXFilteringEnabled){for(x=0;
x<progid2.length;
x++){if($.getAXO(progid2[x])){browser.ActiveXFilteringEnabled=!1;
break
}}};
tmp=doc.documentMode;
try{doc.documentMode=""
}catch(e){}browser.isIE=browser.ActiveXEnabled||$.isNum(doc.documentMode)||eval("/*@cc_on!@*/!1");
try{doc.documentMode=tmp
}catch(e){};
browser.verIE=null;
if(browser.isIE){browser.verIE=($.isNum(doc.documentMode)&&doc.documentMode>=7?doc.documentMode:0)||((/^(?:.*?[^a-zA-Z])??(?:MSIE|rv\s*\:)\s*(\d+\.?\d*)/i).test(userAgent)?parseFloat(RegExp.$1,10):7)
}},detectNonIE:function(){var f=this,d=this.$,a=d.browser,e=window.navigator?navigator:{},c=a.isIE?"":e.userAgent||"",g=e.vendor||"",b=e.product||"";
a.isGecko=(/Gecko/i).test(b)&&(/Gecko\s*\/\s*\d/i).test(c);
a.verGecko=a.isGecko?d.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(c)?RegExp.$1:"0.9"):null;
a.isChrome=(/(Chrome|CriOS)\s*\/\s*(\d[\d\.]*)/i).test(c);
a.verChrome=a.isChrome?d.formatNum(RegExp.$2):null;
a.isSafari=!a.isChrome&&((/Apple/i).test(g)||!g)&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(c);
a.verSafari=a.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(c)?d.formatNum(RegExp.$1):null;
a.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(c);
a.verOpera=a.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(c)||1)?parseFloat(RegExp.$1,10):null},detectPlatform:function(){var e=this,d=e.$,b,a=window.navigator?navigator.platform||"":"";
d.OS=100;
if(a){var c=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];
for(b=c.length-2;
b>=0;
b=b-2){if(c[b]&&new RegExp(c[b],"i").test(a)){d.OS=c[b+1];
break
}}}},library:function(b){var d=this,c=document,a;
d.objProperties(b,b,["$",b]);
for(a in b.Plugins){if(b.hasOwn(b.Plugins,a)){d.plugin(b.Plugins[a],a)
}};
b.PUBLIC.init();

b.win.init();
b.head=c.getElementsByTagName("head")[0]||c.getElementsByTagName("body")[0]||c.body||null;
d.detectPlatform();
d.detectIE();
d.detectNonIE();
d.hasRun=1}},ev:{$:1,handler:function(d,c,b,a){return function(){d(c,b,a)
}
},fPush:function(b,a){var c=this,d=c.$;
if(d.isArray(a)&&(d.isFunc(b)||(d.isArray(b)&&b.length>0&&d.isFunc(b[0])))){a.push(b)
}},call0:function(d){var b=this,c=b.$,a=c.isArray(d)?d.length:-1;
if(a>0&&c.isFunc(d[0])){
d[0](c,a>1?d[1]:0,a>2?d[2]:0,a>3?d[3]:0)
}else{if(c.isFunc(d)){
d(c)
}}},callArray0:function(a){var b=this,d=b.$,c;
if(d.isArray(a)){while(a.length){c=a[0];
a.splice(0,1);
b.call0(c)
}}},call:function(b){var a=this;
a.call0(b);
a.ifDetectDoneCallHndlrs()
},callArray:function(a){var b=this;
b.callArray0(a);
b.ifDetectDoneCallHndlrs()
},allDoneHndlrs:[],ifDetectDoneCallHndlrs:function(){var c=this,d=c.$,a,b;
if(!c.allDoneHndlrs.length){return
}if(d.win){if(!d.win.loaded||d.win.loadPrvtHndlrs.length||d.win.loadPblcHndlrs.length){return
}}if(d.Plugins){for(a in d.Plugins){b=d.Plugins[a];
if(d.hasOwn(d.Plugins,a)&&b&&d.isFunc(b.getVersion)){if(b.OTF==3||(b.DoneHndlrs&&b.DoneHndlrs.length)){return
}}}};
c.callArray0(c.allDoneHndlrs)}},PUBLIC:{$:1,init:function(){var c=this,b=c.$,a;
for(a in c){if(a!=="init"&&b.hasOwn(c,a)&&b.isFunc(c[a])){b[a]=c[a](b)
}}},isMinVersion:function(b){var a=function(j,h,e,d){var f=b.findPlugin(j),g,c=-1;
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
},hasMimeType:function(b){var a=function(h){if(h&&window.navigator&&navigator.mimeTypes){var l,k,d,j,g,c=navigator.mimeTypes,f=b.isArray(h)?[].concat(h):(b.isString(h)?[h]:[]);
g=f.length;
for(d=0;
d<g;
d++){l=0;
try{if(b.isString(f[d])&&/[^\s]/.test(f[d])){l=c[f[d]]
}}catch(j){}k=l?l.enabledPlugin:0;
if(k&&(k.name||k.description)){
return l
}}};
return null
};

return a
},z:0},codebase:{$:1,isDisabled:function(){var b=this,c=b.$,a=c.browser;
return a.ActiveXEnabled&&a.isIE&&a.verIE>=7?0:1
},pluginMayBeHanging:function(b){var c=this,d=c.$,a;
if(!c.isDisabled()&&b&&d.isDefined(d.getPROP(b,"readyState"))&&d.getPROP(b.firstChild,"object")){a=d.getPROP(b.firstChild,"readyState");
if(d.isNum(a)&&a!=4){
return 1
}}return 0
},emptyNode:function(b){var a=this,c=a.$,d;
try{b.innerHTML=""
}catch(d){}},emptyGarbage:function(){var c=this,d=c.$,f,a,g=c.HTML,b=0;
if(!g.length){return
};
for(a=g.length-1;
a>=c.len;
a--){
if(g[a]&&g[a].span&&c.pluginMayBeHanging(g[a].span)){c.emptyNode(g[a].span);
g[a].span=null;
b=1
}}c.len=g.length;
if(b){
try{window.CollectGarbage()
}catch(f){}}},HTML:[],len:0,onDone:function(c,b){var a,f=b.HTML,d;
for(a=0;
a<f.length;
a++){if(f[a]&&f[a].span){b.emptyNode(f[a].span);
f[a].span=null
}}},init:function(e){if(!e.init){e.init=1;
var c=this,d=c.$,a,b;
d.ev.fPush([c.onDone,c],d.win.unloadHndlrs);
e.tagA='<object width="1" height="1" style="display:none;" codebase="#version=';
b=e.classID||e.$$.classID||"";
e.tagB='" '+((/clsid\s*:/i).test(b)?'classid="':'type="')+b+'">'+d.openTag+"/object>";
for(a=0;
a<e.Lower.length;
a++){e.Lower[a]=d.formatNum(e.Lower[a]);
e.Upper[a]=d.formatNum(e.Upper[a])}}},isActiveXObject:function(i,b){var f=this,g=f.$,a=0,h,d=i.$$,c=document.createElement("span");
if(i.min&&g.compareNums(b,i.min)<=0){return 1
}if(i.max&&g.compareNums(b,i.max)>=0){return 0
}
c.innerHTML=i.tagA+b+i.tagB;
if(g.getPROP(c.firstChild,"object")){a=1
};
if(a){i.min=b;
f.HTML.push({span:c})
}else{i.max=b;
c.innerHTML=""
}return a
},convert_:function(f,a,b,e){var d=f.convert[a],c=f.$;
return d?(c.isFunc(d)?c.formatNum(d(b.split(c.splitNumRegx),e).join(",")):b):d
},convert:function(h,c,g){var e=this,f=h.$,b,a,d;
c=f.formatNum(c);
a={v:c,x:-1};
if(c){for(b=0;
b<h.Lower.length;
b++){d=e.convert_(h,b,h.Lower[b]);
if(d&&f.compareNums(c,g?d:h.Lower[b])>=0&&(!b||f.compareNums(c,g?e.convert_(h,b,h.Upper[b]):h.Upper[b])<0)){a.v=e.convert_(h,b,c,g);
a.x=b;
break
}}}return a
},isMin:function(g,f){var d=this,e=g.$,c,b,a=0;

if(!e.isStrNum(f)||d.isDisabled()){return a
}d.init(g);
if(!g.L){g.L={};
for(c=0;
c<g.Lower.length;
c++){if(d.isActiveXObject(g,g.Lower[c])){g.L=d.convert(g,g.Lower[c]);
break
}}}if(g.L.v){b=d.convert(g,f,1);
if(b.x>=0){a=(g.L.x==b.x?d.isActiveXObject(g,b.v):e.compareNums(f,g.L.v)<=0)?1:-1
}};

return a
},search:function(g){var k=this,h=k.$,i=g.$$,b=0,c;

c=g.searchHasRun||k.isDisabled()?1:0;
g.searchHasRun=1;
if(c){return g.version||null
}k.init(g);
var o,n,m,j=function(q,t){var r=[].concat(f),s;
r[q]=t;
s=k.isActiveXObject(g,r.join(","));
if(s){
b=1;
f[q]=t
}else{p[q]=t
}return s
},d=g.DIGITMAX,e,a,l=99999999,f=[0,0,0,0],p=[0,0,0,0];
for(o=0;
o<p.length;
o++){f[o]=Math.floor(g.DIGITMIN[o])||0;
e=f.join(",");
a=f.slice(0,o).concat([l,l,l,l]).slice(0,f.length).join(",");
for(m=0;
m<d.length;
m++){if(h.isArray(d[m])){d[m].push(0);
if(d[m][o]>p[o]&&h.compareNums(a,g.Lower[m])>=0&&h.compareNums(e,g.Upper[m])<0){p[o]=Math.floor(d[m][o])
}}}for(n=0;
n<30;
n++){if(p[o]-f[o]<=16){for(m=p[o];
m>=f[o]+(o?1:0);
m--){if(j(o,m)){break
}}break
}j(o,Math.round((p[o]+f[o])/2))
}if(!b){break
}p[o]=f[o]}if(b){g.version=k.convert(g,f.join(",")).v
};

return g.version||null
}},win:{$:1,loaded:false,hasRun:0,init:function(){var b=this,a=b.$;
if(!b.hasRun){b.hasRun=1;
b.onLoad=a.ev.handler(b.$$onLoad,a);
b.onUnload=a.ev.handler(b.$$onUnload,a);
b.addEvent("load",b.onLoad);
b.addEvent("unload",b.onUnload)
}},addEvent:function(c,b){var e=this,d=e.$,a=window;
if(d.isFunc(b)){if(a.addEventListener){a.addEventListener(c,b,false)
}else{if(a.attachEvent){a.attachEvent("on"+c,b)
}else{a["on"+c]=e.concatFn(b,a["on"+c])
}}}},concatFn:function(d,c){return function(){d();
if(typeof c=="function"){c()
}}
},loadPrvtHndlrs:[],loadPblcHndlrs:[],unloadHndlrs:[],$$onUnload:function(b){if(b&&b.win){b.ev.callArray(b.win.unloadHndlrs);
for(var a in b){b[a]=0
}b=0
}},count:0,countMax:1,intervalLength:10,$$onLoad:function(a){if(!a||a.win.loaded){return
}var b=a.win;
if(b.count<b.countMax&&b.loadPrvtHndlrs.length){
setTimeout(b.onLoad,b.intervalLength)
}else{b.loaded=true;
a.ev.callArray(b.loadPrvtHndlrs);
a.ev.callArray(b.loadPblcHndlrs)}b.count++
}},DOM:{$:1,isEnabled:{$:1,objectTag:function(){var a=this.$;
return a.browser.isIE?a.browser.ActiveXEnabled:1
},objectTagUsingActiveX:function(){return this.$.browser.ActiveXEnabled
},objectProperty:function(){var a=this.$;
return a.browser.isIE&&a.browser.verIE>=7?1:0
}},div:null,divID:"plugindetect",divWidth:300,getDiv:function(){var a=this;
return a.div||document.getElementById(a.divID)||null
},initDiv:function(){var b=this,c=b.$,a;
if(!b.div){a=b.getDiv();
if(a){b.div=a}else{b.div=document.createElement("div");
b.div.id=b.divID;
b.setStyle(b.div,b.getStyle.div());
b.insertDivInBody(b.div)
}c.ev.fPush([b.onWinUnloadEmptyDiv,b],c.win.unloadHndlrs)
}},pluginSize:1,altHTML:"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",emptyNode:function(c){var b=this,d=b.$,a,f;
if(c&&(/div|span/i).test(c.tagName||"")){
if(d.browser.isIE){b.setStyle(c,["display","none"])
}try{c.innerHTML=""
}catch(f){}}},onWinUnloadEmptyDiv:function(f,d){var b=d.getDiv(),a,c,g;
if(b){
if(b.childNodes){for(a=b.childNodes.length-1;
a>=0;
a--){c=b.childNodes[a];
d.emptyNode(c)}try{b.innerHTML=""
}catch(g){}}if(b.parentNode){
try{b.parentNode.removeChild(b)
}catch(g){}b=null;
d.div=null
}}},width:function(){var g=this,e=g.DOM,f=e.$,d=g.span,b,c,a=-1;
b=d&&f.isNum(d.scrollWidth)?d.scrollWidth:a;
c=d&&f.isNum(d.offsetWidth)?d.offsetWidth:a;
return c>0?c:(b>0?b:Math.max(c,b))
},obj:function(b){var d=this,c=d.span,a=c&&c.firstChild?c.firstChild:null;
return a
},readyState:function(){var b=this,a=b.DOM.$;
return a.browser.isIE&&a.isDefined(a.getPROP(b.span,"readyState"))?a.getPROP(b.obj(),"readyState"):b.undefined
},objectProperty:function(){var d=this,b=d.DOM,c=b.$,a;
if(b.isEnabled.objectProperty()){a=c.getPROP(d.obj(),"object")
}return a
},getTagStatus:function(b,m,r,p,f,h){var s=this,d=s.$,q;
if(!b||!b.span){return -2
}var k=b.width(),c=b.readyState(),a=b.objectProperty();
if(a){return 1.5
}var g=/clsid\s*\:/i,o=r&&g.test(r.outerHTML||"")?r:(p&&g.test(p.outerHTML||"")?p:0),i=r&&!g.test(r.outerHTML||"")?r:(p&&!g.test(p.outerHTML||"")?p:0),l=b&&g.test(b.outerHTML||"")?o:i;
if(!m||!m.span||!l||!l.span){return 0
}var j=l.width(),n=m.width(),t=l.readyState();
if(k<0||j<0||n<=s.pluginSize){return 0
}if(h&&!b.pi&&d.isDefined(a)&&d.browser.isIE&&b.tagName==l.tagName&&b.time<=l.time&&k===j&&c===0&&t!==0){b.pi=1
}if(j<n){return b.pi?-0.1:0
}if(k>=n){if(!b.winLoaded&&d.win.loaded){return b.pi?-0.5:-1
}if(d.isNum(f)){if(!d.isNum(b.count2)){b.count2=f
}if(f-b.count2>0){return b.pi?-0.5:-1
}}}try{if(k==s.pluginSize&&(!d.browser.isIE||c===4)){if(!b.winLoaded&&d.win.loaded){return 1
}if(b.winLoaded&&d.isNum(f)){if(!d.isNum(b.count)){b.count=f
}if(f-b.count>=5){return 1
}}}}catch(q){}return b.pi?-0.1:0
},setStyle:function(b,h){var c=this,d=c.$,g=b.style,a,f;
if(g&&h){for(a=0;
a<h.length;
a=a+2){try{g[h[a]]=h[a+1]
}catch(f){}}}},getStyle:{$:1,span:function(){var a=this.$.DOM;
return[].concat(this.Default).concat(["display","inline","fontSize",(a.pluginSize+3)+"px","lineHeight",(a.pluginSize+3)+"px"])
},div:function(){var a=this.$.DOM;
return[].concat(this.Default).concat(["display","block","width",a.divWidth+"px","height",(a.pluginSize+3)+"px","fontSize",(a.pluginSize+3)+"px","lineHeight",(a.pluginSize+3)+"px","position","absolute","right","9999px","top","-9999px"])
},plugin:function(b){var a=this.$.DOM;
return"background-color:transparent;background-image:none;vertical-align:baseline;outline-style:none;border-style:none;padding:0px;margin:0px;visibility:"+(b?"hidden;":"visible;")+"display:inline;font-size:"+(a.pluginSize+3)+"px;line-height:"+(a.pluginSize+3)+"px;"
},Default:["backgroundColor","transparent","backgroundImage","none","verticalAlign","baseline","outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"]},insertDivInBody:function(a,h){var j=this,d=j.$,g,b="pd33993399",c=null,i=h?window.top.document:window.document,f=i.getElementsByTagName("body")[0]||i.body;
if(!f){try{i.write('<div id="'+b+'">.'+d.openTag+"/div>");
c=i.getElementById(b)
}catch(g){}}f=i.getElementsByTagName("body")[0]||i.body;
if(f){f.insertBefore(a,f.firstChild);
if(c){f.removeChild(c)
}}},insert:function(b,i,g,h,c,p,n){var r=this,f=r.$,q,s=document,u,l,o=s.createElement("span"),j,a;
if(!f.isDefined(h)){h=""
}if(f.isString(b)&&(/[^\s]/).test(b)){b=b.toLowerCase().replace(/\s/g,"");
u=f.openTag+b+" ";
u+='style="'+r.getStyle.plugin(p)+'" ';
var k=1,t=1;
for(j=0;
j<i.length;
j=j+2){if(/[^\s]/.test(i[j+1])){u+=i[j]+'="'+i[j+1]+'" '
}if((/width/i).test(i[j])){k=0
}if((/height/i).test(i[j])){t=0
}}u+=(k?'width="'+r.pluginSize+'" ':"")+(t?'height="'+r.pluginSize+'" ':"");
u+=">";
for(j=0;
j<g.length;
j=j+2){if(/[^\s]/.test(g[j+1])){u+=f.openTag+'param name="'+g[j]+'" value="'+g[j+1]+'" />'
}}u+=h+f.openTag+"/"+b+">"
}else{b="";
u=h
}if(!n){r.initDiv()
}var m=n||r.getDiv();
l={span:null,winLoaded:f.win.loaded,tagName:b,outerHTML:u,DOM:r,time:new Date().getTime(),width:r.width,obj:r.obj,readyState:r.readyState,objectProperty:r.objectProperty};
if(m&&m.parentNode){
r.setStyle(o,r.getStyle.span());
m.appendChild(o);
try{o.innerHTML=u
}catch(q){};
l.span=o;
l.winLoaded=f.win.loaded
}return l
}},Plugins:{flash:{$:1,mimeType:"application/x-shockwave-flash",setPluginStatus:function(c,a){var b=this,d=b.$;
b.installed=a?1:(c?0:-1);
b.version=d.formatNum(a);
b.getVersionDone=b.installed==-1||b.axo.version||b.instance.version?1:0
},getVersion:function(f,b){var c=this,e=c.$,a=null,d=0;
if((!d||e.dbug)&&c.navPlugin.query().installed){d=1
}if((!a||e.dbug)&&c.navPlugin.query().version){a=c.navPlugin.version
}if((!d||e.dbug)&&c.axo.query().installed){d=1
}if((!a||e.dbug)&&c.axo.query().version){a=c.axo.version
};
if(((!d&&!a)||b||e.dbug)&&c.instance.query().version){d=1;
a=c.instance.version
}c.setPluginStatus(d,a)
},navPlugin:{$:1,hasRun:0,installed:0,version:null,getNum:function(b){if(!b){return null
}var a=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(b);
return a?a[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null
},query:function(){var e=this,d=e.$,b=e.$$,a,f,c=e.hasRun||!d.hasMimeType(b.mimeType);
e.hasRun=1;
if(c){return e
};
f=d.findNavPlugin({find:"Shockwave.*Flash",mimes:b.mimeType,plugins:["Shockwave Flash"]});
if(f){e.installed=1;
if(f.description){a=e.getNum(f.description)
}}if(a){a=d.getPluginFileVersion(f,a)
}if(a){e.version=a
};
return e
}},axo:{$:1,hasRun:0,installed:0,version:null,progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",query:function(){var d=this,g=d.$,c=d.$$,b,a,i,h,f=d.hasRun;
d.hasRun=1;
if(f){return d
};
for(a=0;
a<10;
a++){i=g.getAXO(d.progID+(a?"."+a:""));
if(i){d.installed=1;
b=0;
try{b=g.getNum(i.GetVariable("$version")+"")}catch(h){}if(b){d.version=b;
if(!g.dbug){break
}}}};
return d
}},instance:{$:1,hasRun:0,version:null,HTML:null,isEnabled:function(){var b=this,d=b.$,c=b.$$,a=1;
if(b.hasRun||d.DOM.isEnabled.objectTagUsingActiveX()||!d.hasMimeType(c.mimeType)){a=0
}return a
},query:function(){var a=this,f=a.$,d=a.$$,b,g,c=a.isEnabled();
a.hasRun=1;
if(c){
a.HTML=f.DOM.insert("object",["type",d.mimeType],["play","false","menu","false"],"",d);
try{a.version=f.getNum(a.HTML.obj().GetVariable("$version")+"")}catch(g){}}return a
}}},vlc:{$:1,compareNums:function(e,d){var c=this.$,k=e.split(c.splitNumRegx),i=d.split(c.splitNumRegx),h,b,a,g,f,j;
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
},setPluginStatus:function(e,a,f){var d=this,c=d.$,b=d.installed;
d.installed=a?1:(f?(f>0?0.7:-0.1):(e?0:-1));
if(a){d.version=c.formatNum(a)
}d.getVersionDone=d.installed==0.7||d.installed==-0.1?0:1;
c.codebase.emptyGarbage()},getVersion:function(d){var f=this,e=f.$,c,a=null,b;
if((!c||e.dbug)&&f.nav.query().installed){c=1
}if((!a||e.dbug)&&f.nav.query().version){a=f.nav.version
}if((!c||e.dbug)&&f.axo.query().installed){c=1
}if((!a||e.dbug)&&f.axo.query().version){a=f.axo.version
}if(!a||e.dbug){b=f.codebase.isMin(d);
if(b){f.setPluginStatus(0,0,b);
return
}}if(!a||e.dbug){b=f.codebase.search();
if(b){c=1;
a=b
}}f.setPluginStatus(c,a,0)
},nav:{$:1,hasRun:0,installed:0,version:null,mimeType:["application/x-vlc-plugin","application/x-google-vlc-plugin","application/mpeg4-muxcodetable","application/x-matroska","application/xspf+xml","video/divx","video/webm","video/x-mpeg","video/x-msvideo","video/ogg","audio/x-flac","audio/amr","audio/amr"],find:"VLC.*Plug-?in",find2:"VLC|VideoLAN",avoid:"Totem|Helix",plugins:["VLC Web Plugin","VLC Multimedia Plug-in","VLC Multimedia Plugin","VLC multimedia plugin"],query:function(){var e=this,c=e.$,a,d,b=e.hasRun||!c.hasMimeType(e.mimeType);
e.hasRun=1;
if(b){return e
};
d=c.findNavPlugin({find:e.find,avoid:e.avoid,mimes:e.mimeType,plugins:e.plugins});
if(d){e.installed=1;
if(d.description){a=c.getNum(d.description+"","[\\d][\\d\\.]*[a-z]*")
}if(a){e.version=a
}};
return e
}},axo:{$:1,hasRun:0,installed:0,version:null,progID:"VideoLAN.VLCPlugin",query:function(){var b=this,e=b.$,d=b.$$,f,a,c=b.hasRun;
b.hasRun=1;
if(c){return b
};
f=e.getAXO(b.progID);
if(f){b.installed=1;
a=e.getNum(e.getPROP(f,"VersionInfo"),"[\\d][\\d\\.]*[a-z]*");
if(a){b.version=a
}};
return b
}},codebase:{$:1,classID:"clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921",isMin:function(a){return this.$.codebase.isMin(this,a)
},search:function(){return this.$.codebase.search(this)
},DIGITMAX:[[11,11,16]],DIGITMIN:[0,0,0,0],Upper:["999"],Lower:["0"],convert:[1]}},zz:0}};
PluginDetect.INIT();
