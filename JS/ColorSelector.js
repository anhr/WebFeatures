/**
 * A Javascript object of the cross-browser Color Selector. You can use my Color Selector instead of <input type="color"> if you want open your web page in an old web browser, that does not supports HTML5, for example IE6.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: https://drive.google.com/file/d/0B5hS0tFSGjBZRXZHVXN5S0VNV28/view?usp=sharing
 * source: https://github.com/anhr/ColorSelector
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2015-06-29, : 
 *       + Fixed a bug if selectedColor function is not defined
 *
 */
 
var colorSelector = {
	idcolorSelector: "colorSelector"
	
	, getcolorSelector: function(){
		return document.getElementById(this.idcolorSelector);
	}
	
	, Create: function(color, selectedColor, elementColorID){
		if(!colourNameToHex(color))
			color = "black";
		try{
			colorSelector.AddElementColorSelector(color, function(e){
//consoleLog("ColorSelector.onmousedown(" + e + ")");
					colorSelector.Add(this);
				}
				, selectedColor, elementColorID);
	    } catch(e) {
			consoleError("Create Color Selector failed. " + e);
	    }
	}
	
	, Add: function(elementColorSelector){
		var element = this.getcolorSelector();
		if(element)
			return;
		element = document.createElement("span");
		element.style.display = 'none';
		document.body.appendChild(element);
		element.id = this.idcolorSelector;
		element.className = "downarrowcolorselector";
		colorSelector.AddElementColorA(element, elementColorSelector);
		var offsetSum = getOffsetSum(elementColorSelector);
		element.style.top = (offsetSum.top - elementColorSelector.offsetHeight) + "px";
		
		//for Internet for Android 5.0 in Samsung Galaxy S5
		setTimeout(function()
			{
				var element = colorSelector.getcolorSelector();
				element.style.display = 'block';
				element.style.top = (parseInt(element.style.top) - element.offsetHeight) + "px";
			}
			, 0
		);
		
//alert("element.style.top = " + element.style.top + " offsetSum.top = " + offsetSum.top + " elementColorSelector.offsetHeight  = " + elementColorSelector.offsetHeight + " element.offsetHeight = " + element.offsetHeight);
		element.style.left = offsetSum.left + "px";
	}
	
	, AddElementColorA: function(elementParent, elementColorSelector){
		//Color names http://www.javascripter.net/faq/colornam.htm
		colorSelector.AddElementColorTooltip(elementParent, "black"  , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "white"  , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "red"    , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "green"  , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "blue"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "yellow" , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "aqua"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "lime"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "silver" , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "maroon" , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "teal"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "navy"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "fuchsia", elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "olive"  , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "gray"   , elementColorSelector);
		colorSelector.AddElementColorTooltip(elementParent, "purple" , elementColorSelector);
	}
		
	, AddElementColor: function(elementParent, color, onmousedown, elementColorID, selectedColor){
		var elementColor;
		if(typeof elementColorID == 'undefined'){
			elementColor = document.createElement("input");
			elementParent.appendChild(elementColor);
		} else {
			elementColor = document.getElementById(elementColorID);
			if(elementColor){
				if(elementColor.type.toLowerCase() == "color"){
/*
is not works in Android  2.3.6				
					//http://www.wufoo.com/html5/types/6-color.html
					//When supported, the pattern, required, readonly and placeholder attributes are irrelevant and ignored.
					elementColor.setAttribute("pattern","#[a-f0-9]{6}");
					elementColor.setAttribute("value", "invalidcolor");
					if(elementColor.validationMessage == ""){
*/					
					//http://stackoverflow.com/questions/29567299/modinizer-test-if-color-input-type-is-available/29573260#29573260
					if(elementColor.value === ""){
						//Your browser doesn't support color input
					} else {
						consoleLog("Your browser support color input. Do not use Color Selector.");
						elementColor.value = colourNameToHex(color); 
						if(selectedColor){
							elementColor.selectedColor = selectedColor;
							if(!elementColor.onchange){
								elementColor.onchange = function(){
//consoleLog("colorSelector.elementColor.onchange()");
									if(colourNameToHex(this.value))
										this.selectedColor(this.value);
									else alert(isRussian() ?
										"Некорректное название цвета " + this.value + ". Допускается название цвета на английском языке или число а шестьнадцатеричном формате: '#rrggbb' где rr, gg, bb две шестьнадцатеричные цифры"
										: "Invalid color name: " + this.value + ". Type correct color name or '#rrggbb' where rr, gg, bb are two-digit hexadecimal numbers."
									)
								}
							}
						} else consoleError("AddElementColor(...) failed! selectedColor = " + selectedColor)
						return null;
					}
					elementColor.type = "text";
				}
			}
		}
		if(!elementColor)
			throw "Invalid id of Color Selector input element: " + elementColorID;
		elementColor.style.background = color; 
		elementColor.style.border = "1px solid #000000"; 
		elementColor.style.padding = "0px 0px"; 
		elementColor.style.display = "inline-block";
//		elementColor.style.cursor = "default";//for IE
		elementColor.style.cursor = "pointer";
		elementColor.onmousedown = onmousedown;
		elementColor.onmouseover = function(){
//consoleLog("colorSelector.elementColor.onmouseover()");
			this.style.borderColor = "white";
		}
		elementColor.onmouseout = function(){
//consoleLog("colorSelector.elementColor.onmouseout()");
			this.style.borderColor = "black";
		}
//consoleLog("colorSelector.AddElementColor(...). elementColor.onmousedown = " + elementColor.onmousedown);
		return elementColor;
	}
	
	, AddElementColorSelector: function(color, onmousedown, selectedColor, elementColorID){
		var elementColorSelector = this.AddElementColor(document.body, color, onmousedown, elementColorID, selectedColor);
		if(!elementColorSelector)
			return;
		if(elementColorSelector.tagName.toUpperCase() != "INPUT"){
			consoleError("Use input element as Color Selector");
			return;
		}
		if(elementColorSelector.type.toLowerCase() != "text"){
			consoleError("Use input text element as Color Selector");
			if(isIE)
				return;
			elementColorSelector.type = "text";
		}
		elementColorSelector.readOnly = true;
		elementColorSelector.style.width = "50px";
		colorSelector.InputValue(elementColorSelector, color);
		elementColorSelector.selectedColor = selectedColor;
		elementColorSelector.onblur = function(){
//consoleLog("colorSelector.elementColorSelector.onblur()");
			colorSelector.Remove();
		}
	}
	
	, AddElementColorTooltip: function(elementParent, color, elementColorSelector){
		var elementColorTooltip = this.AddElementColor(elementParent, color, function()
			{//onmousedown event
//consoleLog("colorSelector.selectColor(). this.selectedColor = " + this.selectedColor);
				colorSelector.Remove();
				var elementColorSelector = this.elementColorSelector;
				var color = this.style.backgroundColor;
				elementColorSelector.style.background = color;
				colorSelector.InputValue(elementColorSelector, color);
				if(elementColorSelector.selectedColor)
					elementColorSelector.selectedColor(color);
			}
		);
		elementColorTooltip.elementColorSelector = elementColorSelector;
		elementColorTooltip.style.width = "10px";
		elementColorTooltip.style.height =  "10px"; 
	}
	
	, InputValue: function(elementInput, color){
		var colorInvert = invertHex(colourNameToHex(color));
		if(colorInvert == false)
			return;
		elementInput.style.background = color;
		elementInput.style.color = colorInvert;
		elementInput.value = color;
	}
	
	, Remove: function(){
//consoleLog("colorSelector.Remove()");
		setTimeout(function()
			{
				var element = colorSelector.getcolorSelector();
				if(!element)
					return;
				document.body.removeChild(element);
			}
			, 0
		);
	}
}

