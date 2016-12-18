//Copy this file to \Inetpub\wwwroot\JSCommon
//ATTENTION!!! I see the problem of alert in Russian language.
//Save this file in utf-8 only.
//Notepad/File/Save As .../Encoding:UTF-8

function digitOnly(obj, language)//, theParent)
{
//	btnSubmit = document.getElementById("Submit12");
//alert(typeof(btnSubmit));
//	btnSubmit.enable(false);
//	text = document.getElementById("Submit12");
//	theParent = document.getElementById("spanCreditError");
/*
	var theP = document.createElement("p");
	theP.innerHTML="<p>111</p>";
	theParent.appendChild(theP);
*/	
	
	currentText=obj.value;
	newText = "";
	boDetected = false;
	boDetectedDecimal = false;
	for(var i=0;i<currentText.length;i++)
	{
		var c = currentText.charAt(i);
		if(
					 ((c == ".") && !boDetectedDecimal)
				|| ((c == ",") && !boDetectedDecimal)
				|| (("0123456789").indexOf(c) > -1)
/*
				|| (c == "1")
				|| (c == "2")
				|| (c == "3")
				|| (c == "4")
				|| (c == "5")
				|| (c == "6")
				|| (c == "7")
				|| (c == "8")
				|| (c == "9")
				|| (c == "0")
*/				
			)
		{
			newText += c;
			if((c == ".") || (c == ","))
				boDetectedDecimal = true;
		}
		else
		{
			message = "";
			if(language == "ru")
				message = "Допустимы только цифры, точка или запятая";
			else
				message = "Digits, dot or comma is allowed only";
			alert(message);
			boDetected = true;
		}
	}
	if(boDetected)
		obj.value=newText;
}