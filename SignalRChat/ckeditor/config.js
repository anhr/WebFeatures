/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
    config.plugins = 'dialogui,dialog,about,a11yhelp,dialogadvtab,basicstyles,bidi,blockquote,clipboard,button,panelbutton,panel,floatpanel,colorbutton,colordialog,templates,menu,contextmenu,div,resize,toolbar,elementspath,enterkey,entities,popup,filebrowser,find,fakeobjects,flash,floatingspace,listblock,richcombo,font,forms,format,horizontalrule,htmlwriter,iframe,wysiwygarea,image,indent,indentblock,indentlist,smiley,smileys,justify,menubutton,language,link,list,liststyle,magicline,maximize,newpage,pagebreak,pastetext,pastefromword,preview,print,removeformat,save,selectall,showblocks,showborders,sourcearea,specialchar,scayt,stylescombo,tab,table,tabletools,undo,wsc';

	config.skin = 'myskin';
	// %REMOVE_END%

	// Define changes to default configuration here. For example:
	// config.language = 'fr';
    // config.uiColor = '#AADC6E';

    //http://ckeditor.com/addon/autogrow
    //http://sdk.ckeditor.com/samples/autogrow.html
	config.extraPlugins = 'autogrow';
	config.autoGrow_minHeight = 0;
	config.autoGrow_maxHeight = 200;
//	config.autoGrow_bottomSpace = 50;

    // The trick to keep the editor in the sample quite small
    // unless user specified own height.
	config.height = 50;
	config.width = 'auto';
	ckeditorToolbar(config);
};
