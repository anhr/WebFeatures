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

		        , on:
		        {//CKEditor Event List: http://diffpaste.com/#/340/
		            'instanceReady': function (event) {
		                consoleLog("CKEDITOR instanceReady");
		                //Set the focus to your editor
		                onClickToolbarButton();
		                onClickSmilesButton();
		                setTimeout(function () { toggleMenuItems(); }, 500);//Wait while g_user.id is defined
		                onresize();
		                /**
                         * The textual emoticon to be used for each of the smileys defined in the
                         * {@link CKEDITOR.config#smiley_images} setting. Each entry in this array list
                         * must match its relative pair in the {@link CKEDITOR.config#smiley_images}
                         * setting. User can type this text instead of selecting of smiley.
                         */
		                CKEDITOR.config.textual_emoticons = [
                        	':)',//0 smiley
                            ':(',//1 sad
		                    ';)',//2 wink
		                    ':D',//3 laugh
		                    ':/',//4 frown
		                    ':P',//5 cheeky
		                    ':*)',//6 blush
		                    ':-o',//7 surprise
		                    ':|',//8 indecision
		                    '>:(',//9 angry не конвертируется в смайлик если эта последовательность в начале поля ввода
		                    'o:)',//10 angel
		                    '8-)',//11 cool
		                    '>:-)',//12 devil
		                    ';(',//13 crying
		                    '',//14 enlightened

                            '(n)',//15 no or Thumbs Down https://pc.net/emoticons/smiley/thumbs_down
                            '(y)',//16 yes or Thumbs Up https://pc.net/emoticons/smiley/thumbs_up

                            //https://en.wikipedia.org/wiki/List_of_emoticons#Eastern
                        	'<3',//17 heart 
                            '</3',//18 broken heart

                            ':-*',//19 kiss
		                    ''//20 mail
		                ];
		                colorsArray(this);

		                //Если тут вызвать эту функцию то иногда g_user.id = undefined
		                //Для проверки
		                //  установить friGate в Chrome 
                        //
		                //  Открыть https://bonalink.hopto.org
		                //  Войти на IRC сервер irc.freenode.net как blink2
                        //  Войти на канал #bonalink и включть веб камеру
		                //
		                //  Открыть еще https://bonalink.hopto.org
		                //  Войти на IRC сервер irc.freenode.net как blink3
		                //  Войти на канал #bonalink. Теперь в функции onChannelPageReady() g_user.id = undefined
		                //
		                //Для решения проблемы вызываю в IRC.onClient(...)
		                //onChannelPageReady();
		            }
		            , 'change': function (event) {

		                // textual emoticon to smiley.
		                //http://stackoverflow.com/questions/4401469/how-to-select-a-text-range-in-ckeditor-programatically
		                var sel = CKEDITOR.instances.editor.getSelection();
		                var range = sel.getRanges()[0];
		                if (range.endContainer.$.nodeName != "#text")
		                    return;
		                var text = range.endContainer.getText();
		                for (var indexSmiley = CKEDITOR.config.textual_emoticons.length - 1; indexSmiley >=0 ; indexSmiley--) {
		                    var smileyTextual = CKEDITOR.config.textual_emoticons[indexSmiley];
		                    if (smileyTextual == '')
		                        continue;
		                    smileyTextual = smileyTextual.replace('(', '\\(');
		                    smileyTextual = smileyTextual.replace(')', '\\)');
		                    smileyTextual = smileyTextual.replace('*', '\\*');
		                    smileyTextual = smileyTextual.replace('|', '\\|');
		                    var Reg = new RegExp("(.*)(" + smileyTextual + ")(.*)");

		                    var smiley = text.match(Reg);
		                    if (!smiley || (smiley.length != 4))
		                        continue;
		                    consoleLog('CKEDITOR change. smiley');
		                    if ((smiley[1] == "") && (smiley[3] == "") && ("<p>" + text + "</p>\n" == CKEDITOR.instances.editor.getData()))
		                        CKEDITOR.instances.editor.getCommand("selectAll").exec(CKEDITOR.instances.editor);
		                    else {
		                        var startIndex = smiley[1].length;
		                        range.startOffset = startIndex;
		                        range.endOffset = startIndex + smiley[2].length;
		                        sel.selectRanges([range]);
		                    }

		                    setTimeout('insertSmiley("' + CKEDITOR.instances.editor.config.smiley_imagesGif[indexSmiley].match(/^(.*).gif/)[1] + '")', 0);
		                    return;
                        }
		            }
		            , 'loaded': function (event) {//calls after loading of CKEDITOR
		                consoleLog("CKEDITOR loaded");
		                displayChatBody();
		            }
		            , 'key': function (event) {//http://ckeditor.com/forums/CKEditor-3.x/Disable-Enter-Key
		                if (!isSendByEnter())
		                    return;
		                if (event.data.keyCode == 13) {//Enter
		                    consoleLog("CKEDITOR.instances.editor.on( 'key')");
		                    event.cancel();
		                    event.stop();//отключил звуковой сигнал во время нажатия клавиши ВВОД
		                    onClickSend();
		                } else editorKey(event.data.keyCode);
		            }
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
        //for compatibility with IE6
		setTimeout(function () {
		    if (isEditorReady())
		        return;
		    console.error("Load ckeditor timeout");
		}, 15000);//5000 for compatibility with Samsung S5 Chrome and 7000 for FireFox in Windows Server 2012R2
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
function displayChatBody() {
    document.getElementById("openpage").style.display = "none";
    document.getElementById("chatbody").style.visibility = "visible";

    //Speech
    setTimeout(function () {
        var openSpeech = 'openSpeech';
        if (get_cookie(openSpeech, 'true') == 'true')
            myTreeView.onclickBranch(document.getElementById('speechBranch').querySelector('.treeView'));//Open speech dialog once
        SetCookie(openSpeech, 'false');
        var cookieSpeech = get_cookie('speech');
        if ((cookieSpeech == '')//по умолчанию Speech загружается
            || (JSON.parse(cookieSpeech).speech == true))
            loadScript("Scripts/Speech/Speech.js", function () { speech.synth.cancel(); });
    }, 1000);
}
