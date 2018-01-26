//See http://www.webmascon.com/topics/technologies/13a.asp for details
/**
 * JavaScript source code
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.github.io/AboutMe/
 * source: https://github.com/anhr/JS
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2017-11-23, : 
 *       + init.
 *
 */

var req = null;
var url = "XMLHttpRequest.srf";
var tab = 0;//outbox

var g_strInternetProblem = " Probably you have internet connection problem.";

function GetElementData(response, tag) 
{
	var element = response.getElementsByTagName(tag);
	if(element == null)
		return null;
	var data = element[0];
	if(data == null)
		return null;
	var firstChild = data.firstChild;
	if(firstChild == null)
		return '';
	return firstChild.data;
}

function ValueID(tag, elementIdName) 
{
	var element = response.getElementsByTagName(tag);
	if(element == null)
		return;
	for(i=0; i<element.length; i++)
	{
		var data = element[i];
		if(data == null)
		{
			alert('ERROR: ValueID(' + tag + ', ' + elementIdName + '); i=' + i + '. data == null');
			return;
		}

		var valueAll = data.getElementsByTagName('value');
		if(valueAll == null)
		{
			alert('ERROR: ValueID(' + tag + ', ' + elementIdName + '); i=' + i + ', valueAll: ' + valueAll);
			return;
		}
		
		var valueFirst = valueAll[0];
		if(valueFirst == null)
		{
			alert('ERROR: ValueID(' + tag + ', ' + elementIdName + '); i=' + i + ', valueFirst: ' + valueFirst);
			return;
		}
		
		var value;
		
		var valueFirstChild = valueFirst.firstChild;
		if(valueFirstChild == null)
		{
			value = '';
		}
		else value = valueFirstChild.data;
		if(value == null)
		{
			alert('ERROR: ValueID(' + tag + ', ' + elementIdName + '); i=' + i + ', value: ' + value);
			return;
		}
		
		var id = data.getElementsByTagName('id')[0].firstChild.data;
		if(id == null)
		{
			alert('ERROR: ValueID(' + tag + ', ' + elementIdName + '); i=' + i + ', id: ' + id);
			return;
		}
		var elementID = document.getElementById(elementIdName + id);
		if(elementID != null)
		{
			elementID.innerHTML = value;
		}
	}//for(i=0; i<element.length; i++)
}

function GetResponseItem(responseName) 
{
	var elementResponse = response.getElementsByTagName(responseName);
	if(elementResponse == null)
	{
		alert('ERROR: elementResponse ' + responseName + ' == null');
		return;
	}
	var message = "";
	var messageZero = elementResponse[0];
	if(messageZero == null)
		message = "";
	else
	{
		var messageZeroFirst = messageZero.firstChild;
		if(messageZeroFirst == null)
			message = "";
		else
		{
			message = messageZeroFirst.data;
			if(message == null)
				message = "";
		}
	}
	return message;
}

function UpdateElement(elementName, responseName) 
{
	var element = document.getElementById(elementName);
	if(element == null)
	{
		alert('ERROR: element ' + elementName + '== null');
		return;
	}
	var message = GetResponseItem(responseName);
	if(message != "")
		element.innerHTML = message;
}

function processReqChange1(req1) 
{
//alert("processReqChange(); req.statusText: " + req.statusText + ". req.status = " + req.status + ". req.readyState = " + req.readyState + ". responseText: " + req.responseText);
	// only if req shows "complete"
	//http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
	switch(req1.readyState)
	{
	case 4://request finished and response is ready
		{
			var status;
			//Я не могу вставлять switch один в другой
			if(req1.status == 200)//OK)
			{
				clearTimeout(g_timeout_id_SendReq);
				return processStatus200(req1);
			}//200://OK
			else if(req1.status == 0)//Close web page
				return false;
			else if(req1.status == 12002)//ERROR_INTERNET_TIMEOUT
			{
				status = 'The request has timed out.';
				ErrorMessage("There was a problem retrieving the XML data:\n req.status: "  + req.status + " " + status);
				XMLHttpRequestStop();
				XMLHttpRequestStart("");//url + "?guid=" + guid + "&tab=" + tab);
				return false;
			}
			else if(req1.status == 12029)//ERROR_INTERNET_CANNOT_CONNECT
				status = 'The attempt to connect to the server failed.';
			else if(req1.status == 12031)//ERROR_INTERNET_CONNECTION_RESET
				status = 'The connection with the server has been reset.';
			else
				status = req1.statusText;
				ErrorMessage("There was a problem retrieving the XML data:\n req1.status: "  + req1.status + " " + status);
		}
		break;
	case 1://server connection established
	case 2://request received
	case 3://processing request
		break;
//		case 404:
	case 0://request not initialized
	default:
		ErrorMessage("ERROR: processReqChange(); req1.readyState = " + req1.readyState);
		break;
	}//switch(req.readyState)
	return true;
}

var g_arguments = '';

function XMLHttpRequestStart(arguments)
{
	if(typeof(guid) == 'undefined')
	{//сюда попадает при открытии OnlineTV. Remote Control
		return;
	}
	if(guid == "")
	{
		ErrorMessage("XMLHttpRequestStart(" + arguments + "); guid = " + guid);
		return;
	}
	if(req == null)
	{
		ErrorMessage("XMLHttpRequestStart(" + arguments + ") failed! req == null");
		return;
	}
	if(guid)
	{
		g_arguments = guid;
		g_arguments += arguments;
	} else g_arguments = arguments;
	SendReq();
}

var g_timeout_id_SendReq = null;

function SendReq()
{
//ErrorMessage("SendReq()");
	XMLHttpRequestStop();
	
	//Таймаут нужен для Firefox для того, что бы корректно закрывался запрос AJAX на веб сервер.
	//Иначе в окне консоли отладчика Firebug со временем появится множество не закрытых запросов (будут видны крутящиеся кружочки)
	setTimeout("SendReq2()", 0);
	
//	SendReq2();
}

function SendReq2()
{
	req.onreadystatechange = processReqChange;
//	req.open("GET", url + "?guid=" + g_arguments, true);
	req.open("GET", url + g_arguments, true);
	try{
		//http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_1.html
		xmlhttp.overrideMimeType('text/xml');//Do not support in IE.
		//for testing use XMLHttpRequest.htm instead of XMLHttpRequest.srf
	} catch(ex){//IE exception
//	ErrorMessage(ex);
	}
	req.send(null);
	clearTimeout(g_timeout_id_SendReq);
	g_timeout_id_SendReq = setTimeout("SendReqTimeout()", (60 + 30) * 1000);//Внимание!!! Задержка должна быть больше CSocketWaitEvent::WaitResponse
}

function SendReqTimeout()
{//Сюда попадает когда не дождался ответа сервера. Обычно это происходит при аварийном разрыве соединения
	ErrorMessage("SendReqTimeout()");
//	XMLHttpRequestStop();
	SendReq();
}

function processReqChange() 
{
	processReqChange1(req);
/*
	var res = processReqChange1(req);
//ErrorMessage("processReqChange(). res = " + res);
	if(res)
		return;
	ErrorMessage("processReqChange() failed!" + g_strInternetProblem);
	setTimeout("SendReq()", 0);
*/	
}

function XMLHttpRequestStop()
{
	if(req == null)
		return;
//	setTimeout("req.abort()", 0);
	req.abort();
}

function NewActiveXObject()
{
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

function loadXMLDoc(guidLoad, start, arguments)
{
	guid = guidLoad;
	req = loadXMLDoc1();//start);
	if (req && start)
		XMLHttpRequestStart(arguments);//url + "?guid=" + guidLoad);
}

function loadXMLDoc1()
{
	var req1 = null;
	if (window.XMLHttpRequest)
	{
alert("loadXMLDoc2 new XMLHttpRequest()");
		req1 = new XMLHttpRequest();
		if (req1)
		{
		}
		else alert("ERROR: Microsoft.XMLHTTP ActiveX object failed!");
	}
	else if (window.ActiveXObject)
	{
alert("loadXMLDoc2 NewActiveXObject()");
		req1 = NewActiveXObject();
alert("loadXMLDoc2 NewActiveXObject() req1 = " + req1);
		if (req1)
			MessageElement('');
	}
	else alert("ERROR: loadXMLDoc() failed!");
	return req1;
}

function get_cookie ( cookie_name )
{
	//http://ruseller.com/lessons.php?rub=28&id=593
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

function SetCookie(name, value)
{
	//http://ruseller.com/lessons.php?rub=28&id=593
	var cookie_date = new Date ( );  // Текущая дата и время
	cookie_date.setTime ( cookie_date.getTime() + 1000 * 60 * 60 * 24 * 365);
	document.cookie = name + "=" + value + "; expires=" + cookie_date.toGMTString();
}

function GetXMLElementText(xmlhttp, tagName, noDisplayErrorMessage)
{
/*
	for(i = 0; i < 2; i++){
		var element = xmlhttp.responseXML.getElementsByTagName(tagName);
		if((i > 0) || (element.length != 0))
			break;//good
		//problem
		if(!isIE)
			break;
		//Сюда попадает если в IE открыть http://pc2014/Scoreboard/ вместо http://localhost/Scoreboard/

		var myResponse = {
				responseXML: null
		}

		var text = xmlhttp.responseText;
		xmlhttp = myResponse;
		//http://help.dottoro.com/ljadewkq.php
		xmlhttp.responseXML = BuildXMLFromString(text);
		if(xmlhttp.responseXML == null)
			break;
	}
*/	
	var element = xmlhttp.responseXML.getElementsByTagName(tagName);
	
	//ATTENTION!!! For IE set the content-type m_HttpResponse.SetContentType("text/xml");
	
	if(element.length == 0){
		if(noDisplayErrorMessage != true)
			ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); element.length == ' + element.length);
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

//ATTENTION!!! Deprecated function. Uncompatible with IE. Use GetXMLElementText instead
function GetElementText(elementParent, tagName, noDisplayErrorMessage)
{
	if(!elementParent)
	{
		ErrorMessage('GetElementText(elementParent, ' + tagName + ') failed! elementParent = null');
		return '';
	}
	var element = elementParent.getElementsByTagName(tagName);
//	if(element.length != 1)
	if(element.length == 0)
	{
		if(noDisplayErrorMessage != true)
			ErrorMessage('GetElementText(elementParent, ' + tagName + '); element.length == ' + element.length);
		return '';
	}
	var text = "";
	for(var i = 0; i < element.length; i++){
		if(typeof(element[i].textContent) == 'undefined')
		{
			if(typeof(element[i].text) == 'undefined')
			{
				ErrorMessage('GetElementText(elementParent, ' + tagName + '); element[' + i + '].text) == undefined');
				return '';
			}
			text += element[i].text;//IE
		}
		else text += element[i].textContent;//Chrome
		text += " ";
	}
	return text;
}

//http://www.rsdn.ru/forum/web/337962.flat
function FormatString (sText, oArgArr)
{
   var sResult = new String ();
   var nTmpIndex = 0;
   var nCounter = 0;
   
   sResult = sText;
   do
   {
      nTmpIndex = sResult.indexOf ("{%}");
      if (nTmpIndex > -1)
      {
         sResult = sResult.substring (0, nTmpIndex) + oArgArr[nCounter] + sResult.substring (nTmpIndex + 3, sResult.length);
         nCounter++;
      }
   } while (nTmpIndex > -1)
   
   return sResult;
}

function getChildElementById(parentTag, id)
{
	var children = parentTag.children;
	for(var j = 0; j < children.length; j++)
	{
		var tag = children[j];
		if(tag.id == id)
			return tag;
	}
	return null;
}
/*
function consoleLog(msg)
{
	try//for IE
	{
		console.log(msg);
	}
	catch(e) {}
}

function consoleError(msg)
{
	try//for IE
	{
		console.error(msg);
	}
	catch(e) {}
}
*/
//http://help.dottoro.com/ljadewkq.php
function CreateMSXMLDocumentObject () {
    if (typeof (ActiveXObject) != "undefined") {
        var progIDs = [
                        "Msxml2.DOMDocument.6.0", 
                        "Msxml2.DOMDocument.5.0", 
                        "Msxml2.DOMDocument.4.0", 
                        "Msxml2.DOMDocument.3.0", 
                        "MSXML2.DOMDocument", 
                        "MSXML.DOMDocument"
                      ];
        for (var i = 0; i < progIDs.length; i++) {
            try { 
                return new ActiveXObject(progIDs[i]); 
            } catch(e) {
//                            console.log('new ActiveXObject(' + progIDs[i] + ') failed! ' + e);
            };
        }
    }
    ErrorMessage ('Cannot create XMLDocument object.'
        + ' Go to Tools-->Internet Options.'
        + ' Select security tab.'
        + ' Click on Trusted Sites and add this site (or Local Intranet depending on whether your site is trusted or not).'
        + ' Click on Custom Level.'
        + ' Ensure that "Initialize and script active x controls is not marked safe for scripting" is enabled - this comes under Activex controls and plug-ins section towards 1/4th of the scroll bar.'
        + ' Click OK, OK.'
        );
    return null;
}

//http://help.dottoro.com/ljadewkq.php
function BuildXMLFromString (text) {
	if(typeof text == 'undefined') {
        ErrorMessage ("BuildXMLFromString (" + text + ")");
        return null;
	}
    var message = "";
    if (window.DOMParser) { // all browsers, except IE before version 9
        var parser = new DOMParser();
        try {
            xmlDoc = parser.parseFromString (text, "text/xml");
        } catch (e) {
                // if text is not well-formed, 
                // it raises an exception in IE from version 9
            ErrorMessage ("XML parsing error.");
            return null;
        };
    }
    else {  // Internet Explorer before version 9
        xmlDoc = CreateMSXMLDocumentObject ();
        if (!xmlDoc) {
            return null;
        }

        xmlDoc.loadXML (text);
    }

    var errorMsg = null;
    if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
        errorMsg = "XML Parsing Error: " + xmlDoc.parseError.reason
                  + " at line " + xmlDoc.parseError.line
                  + " at position " + xmlDoc.parseError.linepos;
    }
    else {
        if (xmlDoc.documentElement) {
            if (xmlDoc.documentElement.nodeName == "parsererror") {
                errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
            }
        }
        else {
            errorMsg = "XML Parsing Error!";
        }
    }

    if (errorMsg) {
        ErrorMessage (errorMsg);
        return null;
    }

//                alert ("Parsing was successful!");
    return xmlDoc;
}

