/**
 * Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/* exported initSample */

if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
	CKEDITOR.tools.enableHtml5Elements( document );

var initSample = ( function() {
	var wysiwygareaAvailable = isWysiwygareaAvailable(),
		isBBCodeBuiltIn = !!CKEDITOR.plugins.get( 'bbcode' );

	return function() {
		// Depending on the wysiwygare plugin availability initialize classic or inline editor.
		if ( wysiwygareaAvailable ) {
		    CKEDITOR.replace('editor', {

		        //http://drupal.stackexchange.com/questions/62406/how-to-remove-the-status-bar-from-ckeditor
		        removePlugins: 'elementspath'
		        , resize_enabled: false

//		        , blockedKeystrokes: [13, CKEDITOR.SHIFT + 13]

		        , on:
		        {//CKEditor Event List: http://diffpaste.com/#/340/
		            'instanceReady': function (event) {
		                consoleLog("CKEDITOR instanceReady");
		                //Set the focus to your editor
		                onClickToolbarButton();
		                onClickSmilesButton();
		                setTimeout(function () { toggleMenuItems(); }, 500);//Wait while g_user.id is defined
		                onresize();
//		                CKEDITOR.instances.editor.focus();
		            }
		            , 'change': function (event) {
		                /*
                            *		// Use textual emoticons as description.
                            *		config.smiley_descriptions = [
                            *			':)', ':(', ';)', ':D', ':/', ':P', ':*)', ':-o',
                            *			':|', '>:(', 'o:)', '8-)', '>:-)', ';(', '', '', '',
                            *			'', '', ':-*', ''
                            *		];
                        */

		                //call before :\\)
		                if (textualToSmiley("o:\\)", 10))//angel
		                    return;

		                if (textualToSmiley(":\\)", 0))//smiley
		                    return;

		                //call before :\\(
		                if (textualToSmiley(">:\\(", 9))//angry
		                    return;

		                if (textualToSmiley(":\\(", 1))//sad
		                    return;
		                if (textualToSmiley(";\\)", 2))//wink
                            return;
                        if (textualToSmiley(":D", 3))//laugh
                            return;

		                //call before :/
                        if (textualToSmiley("://"))
                            return;//ignore "://"

                        if (textualToSmiley(":/", 4))//frown
                            return;
                        if (textualToSmiley(":P", 5))//cheeky
                            return;
                        if (textualToSmiley(":\\*\\)", 6))//blush
                            return;
                        if (textualToSmiley(":-o", 7))//surprise
                            return;
		                if (textualToSmiley(":\\|", 8))//indecision
		                    return;
		                if (textualToSmiley("8-\\)", 11))//cool
		                    return;
		                if (textualToSmiley(">:-\\)", 12))//devil
		                    return;
		                if (textualToSmiley(";\\(", 13))//crying
		                    return;
                        /*
		                , ''
		                if (textualToSmiley("", 14))//enlightened
		                    return;
		                , ''
		                if (textualToSmiley("", 15))//no
		                    return;
		                , '',
                        if (textualToSmiley("", 16))//yes
		                return;
		                *			''
		                if (textualToSmiley("", 17))//heart
		                    return;
		                , ''
		                if (textualToSmiley("", 18))//broken_heart
		                    return;
                        */
		                if (textualToSmiley(":-\\*", 19))//kiss
		                    return;
                        /*
		                , ''
		                if (textualToSmiley("", 20))//mail
		                    return;
                        */
//                        }
		            }
		            , 'loaded': function (event) {//calls after loading of CKEDITOR
		                consoleLog("CKEDITOR loaded");
		                displayChatBody();
		            }
		            , 'key': function (event) {//http://ckeditor.com/forums/CKEditor-3.x/Disable-Enter-Key
		                if (!isToolbarHide())
		                    return;
		                if (event.data.keyCode == 13) {//Enter
		                    consoleLog("CKEDITOR.instances.editor.on( 'key')");
		                    event.cancel();
		                    event.stop();//отключил звуковой сигнал во время нажатия клавиши ВВОД
		                    onClickSend();
		                } else $.connection.chatHub.server.editorKey(g_chatRoom.RoomName, g_user.id, event.data.keyCode);
		            }
/*
		            , 'keydown': function (event) {//http://stackoverflow.com/questions/11123417/key-code-in-ck-editor
		                consoleLog('CKEDITOR.instances.editor.on("keydown") Keystroke: "' + event.data.getKeystroke() + '", key: "' + event.data.getKey());
		            }
*/
		            , 'setData': function (event) {
		                consoleLog('CKEDITOR.instances.editor.on("setData")');
		                CKEDITOR.instances.editor.focus();
		            }
		            , 'resize': function (event) {
		                consoleLog('CKEDITOR.instances.editor.on("resize")');
		                onresize();
		            }
		        }
		    }); 
		} else {
			editorElement.setAttribute( 'contenteditable', 'true' );
			CKEDITOR.inline( 'editor' );

			// TODO we can consider displaying some info box that
			// without wysiwygarea the classic editor may not work.
		}
/*
	    //http://ckeditor.com/forums/CKEditor/Key-Event
		var editor = CKEDITOR.instances.editor;
		editor.on('contentDom', function (event) {
*/
/*
		    editor.document.on('key', function (event) {
		        consoleLog('my key');
		    });
		    editor.document.on('keyup', function (event) {
		        consoleLog('my keyup');
		    });
*/
/*
		    editor.document.on('keydown', function (event) {
//		        consoleLog('my keydown');
		        var keystroke = event.data.getKeystroke();
//		        consoleLog('editor.document.on("keydown") Keystroke: "' + keystroke + '", key: "' + event.data.getKey());
		        if (keystroke == (CKEDITOR.CTRL + 13)) {
		            if (isToolbarHide())
		                return;
		            consoleLog('editor.document.on("keydown") Ctrl + Enter');
		            event.cancel();
		            event.stop();//отключил звуковой сигнал во время нажатия клавиши ВВОД
		            onClickSend();
                }
		    });
*/
/*
		    editor.on('keyup', function (event) {
		        consoleLog('raw keyup');
		    });
		    editor.on('keydown', function (event) {
		        consoleLog('raw keydown');
		    });
		    editor.document.on('mouseup', function (event) {
		        consoleLog('mouseup');
		    });
*/
//		});
/*
	    //http://stackoverflow.com/questions/11123417/key-code-in-ck-editor
		CKEDITOR.instances.editor.on('keydown', function (event) {
		    consoleLog('CKEDITOR.instances.editor.document.on("keydown") Keystroke: "' + event.data.getKeystroke() + '", key: "' + event.data.getKey());
		});
*/
        //for compatibility with IE6
		setTimeout(function () {
		    if (isEditorReady())
		        return;

		    CKEDITOR.remove(CKEDITOR.instances.editor);
		    document.getElementById("editor").style.visibility = "visible";
		    document.getElementById("toolbarButton").style.display = "none";
		    document.getElementById("smilesButton").style.display = "none";

		    displayChatBody();
//		    onresize();
		    
		    alert(lang.incompatibleBrowser);//'Unfortunately your web browser is not compatible with our web page.'
		}, 7000);//5000 for compatibility with Samsung S5 Chrome and 7000 for FireFox in Windows Server 2012R2
	};

	function isWysiwygareaAvailable() {
		// If in development mode, then the wysiwygarea must be available.
		// Split REV into two strings so builder does not replace it :D.
		if ( CKEDITOR.revision == ( '%RE' + 'V%' ) ) {
			return true;
		}

		return !!CKEDITOR.plugins.get( 'wysiwygarea' );
	}
} )();

function displayChatBody() {
//    MessageElement("");
    document.getElementById("openpage").style.display = "none";
    document.getElementById("chatbody").style.visibility = "visible";
}

function isEditorReady() {
    //CKeditor is not ready in IE6
    if (typeof CKEDITOR.instances.editor == 'undefined')
        return false;
    return CKEDITOR.instances.editor.status == 'ready';
}

function insertSmiley(smileyName) {

    var range = CKEDITOR.instances.editor.getSelection().getRanges()[0];
    if (range.endOffset == range.startOffset)
        return;

    insertSmile(CKEDITOR.instances.editor.ui.get(smileyName));
}

function textualToSmiley(smileyTextual, indexSmiley) {

    //http://stackoverflow.com/questions/4401469/how-to-select-a-text-range-in-ckeditor-programatically
    var sel = CKEDITOR.instances.editor.getSelection();
    var range = sel.getRanges()[0];
    if (range.endContainer.$.nodeName != "#text")
        return;

//    var Reg = new RegExp("(.*)( " + smileyTextual + ")( |&nbsp;)(.*)");
    var Reg = new RegExp("(.*)(" + smileyTextual + ")(.*)");

    //Uncompatible with IE5
    //var text = range.endContainer.$.wholeText;
    var text = range.endContainer.getText();
    var smiley = text.match(Reg);
    if (!smiley || (smiley.length != 4))
        return false;

    if (typeof indexSmiley == 'undefined')
        return true;//ignore smileyTextual

    consoleLog('CKEDITOR change. smiley');
    if ((smiley[1] == "") && (smiley[3] == "") && ("<p>" + text + "</p>\n" == CKEDITOR.instances.editor.getData()))
        CKEDITOR.instances.editor.getCommand("selectAll").exec(CKEDITOR.instances.editor);
    else{
        var startIndex = smiley[1].length;
        range.startOffset = startIndex;
        range.endOffset = startIndex + smiley[2].length;// + smiley[3].length;
        sel.selectRanges([range]);
//        selectRangesSmiley(sel, [range]);
    }

    setTimeout('insertSmiley("' + CKEDITOR.instances.editor.config.smiley_imagesGif[indexSmiley].match(/^(.*).gif/)[1] + '")', 0);
    return true;
}

