	function handleDigit(digit) { 
//alert("handleDigit(digit)")
		var s = document.createElement('span')
		s.innerHTML = digit+' '
		document.getElementById('endless_frame_div').appendChild(s)
endlessFrameStop()
endlessFrameRun(true)
	}
	function endlessFrameRun(padding) {
		document.getElementById('endless_frame_div').innerHTML=''
//		setIframeSrc('endless_iframe','endless_frame.php'+(padding ? '?padding=1':''))
//		setIframeSrc('endless_iframe','http://83.167.115.178/Fax/endless_frame.srf'+(padding ? '?padding=1':''))
		setIframeSrc('endless_iframe','../Fax/endless_frame.srf'+(padding ? '?padding=1':''))
		document.getElementById('endless_iframeb1').disabled='disabled'
		document.getElementById('endless_iframeb2').disabled='disabled'
		document.getElementById('endless_iframeb3').disabled=''
	}
	function endlessFrameStop() {
		setIframeSrc('endless_iframe','javascript:""')
		document.getElementById('endless_iframeb3').disabled='disabled'
		document.getElementById('endless_iframeb2').disabled=''
		document.getElementById('endless_iframeb1').disabled=''
		document.getElementById('endless_frame_div').innerHTML=''
	}
	function runInteractive(padding) {
alert("runInteractive(padding)")
		document.getElementById('xhr_state_dump1').innerHTML=''
	
		var req = getXmlHttp()
		req.open('GET', '/server_push/long_digits.php?r='+Math.random()+(padding ? '&padding=1':''), true); 
		req.onreadystatechange = function() {
			var d = document.createElement('div')
			var dd = document.createElement('div')
			dd.innerHTML = 'State: '+req.readyState
			d.appendChild(dd)
			var dd = document.createElement('div')
			try {
			dd.innerHTML = 'ResponseText: '+req.responseText
			} catch (e) {
			  // IE will throw error here because responseText is not available
			  dd.innerHTML = e.message
			}
			d.appendChild(dd)
			document.getElementById('xhr_state_dump1').appendChild(d)
		}
		req.send(null); 
	}
	
	
	function runInteractive2(padding) {
		document.getElementById('xhr_dump2').innerHTML=''
	
		if (browser.isIE) {
			alert("Not for Internet Explorer")
			return
		}
		
		var req = getXmlHttp()
		var last_char=0;
		req.open('GET', '/server_push/long_digits.php?r='+Math.random()+(padding ? '&padding=1':''), true); 
		req.onreadystatechange = function() {
			if (req.readyState == 3) {
				var message = req.responseText.substr(last_char)
				last_char = req.responseText.length
				
				var d = document.createElement("div")
				d.innerHTML = "state:"+req.readyState+" message:"+message.replace(/\s+$/,'');
				document.getElementById('xhr_dump2').appendChild(d)
			}
		}
		req.send(null); 

	}
	function runMultipart() {
		document.getElementById('xhr_multipart_dump1').innerHTML=''

		var req = new XMLHttpRequest();
	    req.multipart = true;
    	req.open("GET","/server_push/multipart.php?r="+Math.random(), true);
		req.onload = function(event) {
			var result = event.target.responseText
			
			var d = document.createElement("div")
			d.innerHTML = "onload:"+result;

			document.getElementById('xhr_multipart_dump1').appendChild(d)
		}
		req.onreadystatechange = function() {
			if (req.readyState!=4) return
			var d = document.createElement("div")
			d.innerHTML = "State:"+req.readyState+' Status:'+req.status
			document.getElementById('xhr_multipart_dump1').appendChild(d)
		}
		
		req.send(null);
	}
	function runEventSource() {
		if (!browser.isOpera) {
			alert("Opera only")
			return false
		}
		var out = document.getElementById('event_source_dump')
		out.innerHTML=''

	    var el = document.createElement("event-source")
	    el.setAttribute('src', '/server_push/event_source.php')
    	el.setAttribute('id', 'event_source')
		var newMessageHandler = function(event) {
			var d = document.createElement('div')
			d.innerHTML = "data: "+event.data
			out.appendChild(d)
		}
		
		el.addEventListener('newMessage', newMessageHandler, false);
    
        var stopIt = function() { document.body.removeChild(el) }
    	var startIt = function() { document.body.appendChild(el) }
	    startIt()
    	setTimeout(stopIt, 10000) // breaks connect
	
	}
