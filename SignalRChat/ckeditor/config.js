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

    //http://www.uas.alaska.edu/a_assets/ckeditor/samples/plugins/toolbar/toolbar.html 
    // Toolbar configuration generated automatically by the editor based on config.toolbarGroups.
	config.toolbar = [
        { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source'] },//, '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
//        { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
        {
            name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: [//'Find', 'Replace', '-', 'SelectAll', '-',
              'Scayt']
        },
//        { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
//        '/',
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
        { name: 'links', items: ['Link', 'Unlink'] },//, 'Anchor'] },
        {
            name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley',
              'SpecialChar']
        },//, 'PageBreak', 'Iframe'] },
//        '/',
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
        { name: 'others', items: ['-'] },
        {
            name: 'Smileys', items: ['regular_smile', 'sad_smile', 'wink_smile', 'teeth_smile', 'confused_smile', 'tongue_smile',
	        'embarrassed_smile', 'omg_smile', 'whatchutalkingabout_smile', 'angry_smile', 'angel_smile', 'shades_smile',
	        'devil_smile', 'cry_smile', 'lightbulb', 'thumbs_down', 'thumbs_up', 'heart',
	        'broken_heart', 'kiss', 'envelope'
            ]
        },
        { name: 'about', items: ['About'] }
    ];
};
