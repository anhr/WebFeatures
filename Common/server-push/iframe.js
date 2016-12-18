function getIframeDocument(iframeNode) {
	if (iframeNode.contentDocument) return iframeNode.contentDocument
	if (iframeNode.contentWindow) return iframeNode.contentWindow.document
	return iframeNode.document
}
	  
function setIframeSrc(iframeNode, src) {
	if (typeof iframeNode == 'string') {
		iframeNode = document.getElementById(iframeNode)
	}

	var doc = getIframeDocument(iframeNode)
	doc.location.replace(src)
}

function createIFrame(fname, turi, debug){
	
	var ifrstr = browser.isIE ? '<iframe name="'+fname+'" src="'+turi+'">' : 'iframe';
	var cframe = document.createElement(ifrstr);

	with(cframe){
		name = fname;
		setAttribute("name", fname);
		id = fname;
	}
	document.getElementById('iframe_container').appendChild(cframe);

	with(cframe.style){
        if (debug) {
            height = "100px"
            width = "300px";
        } else {
            if(!browser.isSafari){
                //We can't change the src in Safari 2.0.3 if absolute position. Bizarro.
                position = "absolute";
            }
            left = top = "0px";
            height = width = "1px";
            visibility = "hidden";
        }
	}
	
	if(!browser.isIE){
		setIframeSrc(cframe, turi);
	}
	
	return cframe
}


function postToIframe(content, action, target){
    if(typeof phonyForm == 'undefined'){
        phonyForm = document.createElement("form")
        phonyForm.style.display = "none"
        phonyForm.enctype = "application/x-www-form-urlencoded"
        phonyForm.method = "POST"        
		document.body.appendChild(phonyForm)
    }

    phonyForm.action = action
    phonyForm.target = target
    phonyForm.setAttribute("target", target);

    while(phonyForm.firstChild){
        phonyForm.removeChild(phonyForm.firstChild);
    }

    for(var x in content){
        var tn;
        if(browser.isIE){
            tn = document.createElement("<input type='hidden' name='"+x+"' value='"+content[x]+"'>")
            phonyForm.appendChild(tn)
        }else{
            tn = document.createElement("input");
            phonyForm.appendChild(tn);
            tn.type = "hidden";
            tn.name = x;
            tn.value = content[x]
        }
    }
    phonyForm.submit();
}

function createIEFrame(fname, src) {
	var rcvNode = new ActiveXObject("htmlfile");
	rcvNode.open();
	rcvNode.write("<html><head><title>ActiveX</title>")
	rcvNode.write("<script src='/js/browser.js'></sc"+"ript>")
	rcvNode.write("<script src='/server_push/iframe.js'></scr"+"ipt>")
	rcvNode.write("</head><body></body></html>")
	//rcvNode.write("<html><head><title>ActiveX</title></head><body></body></html>");
	rcvNode.close();
	
	rcvNode.parentWindow.deliver = deliver
                    
	var ifrDiv = rcvNode.createElement("div");
	rcvNode.appendChild(ifrDiv);
	ifrDiv.innerHTML = "<iframe name='"+fname+"' src='"+src+"'></iframe>"
	
	IEFrameNode = ifrDiv.firstChild
	IEFrameDocument = rcvNode
}
	
	