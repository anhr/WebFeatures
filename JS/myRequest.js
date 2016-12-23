/**
 * The myRequest is Javascript object of the cross-browser XMLHttpRequest wrapper. Your request code to the server is very simple, if you are using myRequest obect.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.ucoz.net/AboutMe/
 * source: https://github.com/anhr/myRequest
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2015-09-04, : 
 *       + myRequest from var to function
 *  2015-08-28, : 
 *       + Cosmetic changes
 *
 */
 
function myRequest(data){
//	this.url = url;
	
	this.loadXMLDoc = function(){
		var req;
	
		if (window.XMLHttpRequest){
			req = new XMLHttpRequest();
			if (!req)
				throw "new XMLHttpRequest() failed!"
		}
		else if (window.ActiveXObject){
			req = this.NewActiveXObject();
			if (!req)
				throw "NewActiveXObject() failed!"
		}
		else throw "myRequest.loadXMLDoc(...) failed!";
		return req;
	}
	
	this.NewActiveXObject = function(){
	  try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
		catch(e) {}
	  try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
		catch(e) {}
	  try { return new ActiveXObject("Msxml2.XMLHTTP"); }
		catch(e) {}
	  try { return new ActiveXObject("Microsoft.XMLHTTP"); }
		catch(e) {}
	  ErrorMessage('This browser does not support XMLHttpRequest. Probably, your security settings do not allow Web sites to use ActiveX controls installed on your computer. Refresh your Web page to find out the current status of your Web page or enable the "Initialize and script ActiveX controls not marked as safe" and "Run Active X controls and plug-ins" of the Security settings of the Internet zone of your browser.');
	  return null;
	}
	
	this.XMLHttpRequestStart = function (onreadystatechange, async) {
	
		this.XMLHttpRequestStop();//For compatibility with IE Windows Phone
		
		this.req.onreadystatechange = onreadystatechange;
		
		//ATTENTION!!! do not works in IE
		if("onerror" in this.req){
			this.req.onerror = function(event){
				ErrorMessage("XMLHttpRequest error. url: " + this.url, false, false);
			}
		}
		
		this.XMLHttpRequestReStart(async);
	}
	
	this.getUrl = function(){
		if((typeof this.url == 'undefined') || (this.url == null)){
			this.url = "XMLHttpRequest.xml";
//			throw "myRequest.url = " + myRequest.url + " failed!";
		}
		return this.url + (this.params ? this.params : "");
	}
	
	this.XMLHttpRequestReStart = function (async) {
	    try {
	        if (typeof async == 'undefined')
	            async = true;
	        this.req.open("GET", this.getUrl(), async);
	        if (async) {
	            var timeout = (60 + 30) * 1000;//Внимание!!! Задержка должна быть больше CSocketWaitEvent::WaitResponse
	            if ("timeout" in this.req)//for IE6
	                this.req.timeout = timeout;
	            if ("ontimeout" in this.req)
	                this.req.ontimeout = function () {
	                    ErrorMessage('XMLHttpRequest timeout', false, false);
	                }
	            else {//for Safari, IE6
	                clearTimeout(this.timeout_id_SendReq);
	                this.timeout_id_SendReq = setTimeout(function () {
	                    ErrorMessage('XMLHttpRequest timeout 2', false, false);
	                }
				    , timeout);
	                //consoleLog("setTimeout this.req.timeout_id_SendReq = " + this.req.timeout_id_SendReq);
	            }
	        }
			this.req.send(null);
		}catch(e){
			ErrorMessage(e.message + " url: " + this.url, false, false);
		}
	}
	
	this.XMLHttpRequestStop = function(){
//consoleLog("XMLHttpRequestStop(...)");
		if(this.req == null)
			return;
		this.req.abort();
	}
	
	this.ProcessReqChange = function(processStatus200){
		var req = this.req;
if(!isIE){
//	consoleLog("processReqChange(); req.statusText: " + req.statusText + ". req.status = " + req.status + ". req.readyState = " + req.readyState + ". req.responseText: " + req.responseText);
}	
		// only if req shows "complete"
		//http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
		//http://xmlhttprequest.ru/w3c
		switch(req.readyState)
		{
		case 4://request finished and response is ready
			{
				if(typeof req.status == "unknown"){//IE5 timeout
					consoleError('typeof XMLHttpRequest status == "unknown"');
					return true;
				}
				//Я не могу вставлять switch один в другой
				if(req.status == 200)//OK)
				{
					clearTimeout(this.timeout_id_SendReq);
					return processStatus200(this);
				}//200://OK
				else{
					ErrorMessage("Invalid XMLHttpRequest status : " + req.status + " url: " + this.url);
				}
			}
			break;
		case 1://server connection established
		case 2://request received
		case 3://processing request
			break;
	//		case 404:
		case 0://request not initialized
		default:
			throw "processReqChange(); req.readyState = " + req.readyState;
			break;
		}//switch(req.readyState)
		return true;
	}
	
	this.processStatus200Error = function(){
		var error = this.GetElementText('error', true);
		if(error)
		{
			ErrorMessage(error);
			return true;
		}
		return false;
	}
	
	this.GetElementText = function(tagName, noDisplayErrorMessage){
		var xmlhttp = this.req;
		if(!xmlhttp.responseXML){
			if(noDisplayErrorMessage != true)
				ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); xmlhttp.responseXML is null.\nxmlhttp.responseText:\n' + xmlhttp.responseText);
			return null;
		}
		var element = xmlhttp.responseXML.getElementsByTagName(tagName);
		
		//ATTENTION!!! For IE set the content-type m_HttpResponse.SetContentType("text/xml");
		
		if(element.length == 0){
			if(noDisplayErrorMessage != true)
				ErrorMessage('GetXMLElementText(xmlhttp, "' + tagName + '"); element.length == ' + element.length);
			return "";
		}
		var text = "";
		for(var i = 0; i < element.length; i++){
			if(typeof(element[i].textContent) == 'undefined')
			{
				if(typeof(element[i].text) == 'undefined')
				{
					ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); element[' + i + '].text) == undefined');
					return '';
				}
				if(text != "")
					text += " ";
				text += element[i].text;//IE
			}
			else text += element[i].textContent;//Chrome
		}
		return text;
	}
	
	if(data){
		this.req = data.req;
		this.url = data.url;
		this.params = data.params;
	}else{
		try{
			this.req = this.loadXMLDoc();
		} catch(e) {
			var message;
			if(typeof e.message == 'undefined')
				message = e;
			else message = e.message;
			ErrorMessage("Your browser is too old and is not compatible with our site.\n\n"
				+ window.navigator.appName + " " + window.navigator.appVersion + "\n\n" + message);
			return;
		}
	}
	if(!this.req){
		consoleError("Invalid myRequest.req: " + this.req);
		return;
	}
}

function getSynchronousResponse(url) {
    var response;
    var request = new myRequest();
    request.url = url;
    request.XMLHttpRequestStart(function () {//onreadystatechange
        request.ProcessReqChange(function (myRequest) {//processStatus200
            if (myRequest.processStatus200Error())
                return;
            response = myRequest.req.responseText;
            return;
        });
    }
    , false//Synchronous mode
    );
    return response;
}