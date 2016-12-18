/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

//http://ckeditor.com/forums/CKEditor-3.x/How-add-custom-toolbar-item
CKEDITOR.plugins.add( 'smileys', {
	init: function( editor ) {
	    var config = CKEDITOR.instances.editor.config;
	    var images = config.smiley_imagesGif;

	    //Если я оставлю эту строку, то каждый новый день путь будет указываться неверно
	    //и для исправления приходится обновлять страницу. После чего все нормально
	    //var smiley_path = config.smiley_path;

	    var smiley_path = '/ckeditor/plugins/smiley/images/';

	    for (i = 0; i < images.length; i++) {
	        editor.ui.addButton(images[i].match(/^(.*).gif/)[1]//angel_smile
                , {
                    label: editor.lang.smiley[CKEDITOR.config.smiley_descriptions[i]],//smiley_descriptions[i],
	                click: function () { insertSmile(this); },
	                icon: smiley_path + images[i]
	            });
	    }
	}
} );

/**
 * Inserts  a smiley's image into editor
 */
function insertSmile(button) {
    var title = button.title;
    var img = CKEDITOR.instances.editor.document.createElement('img', {
        attributes: {
            src: button.icon,//"http://localhost/ckeditor/plugins/smiley/images/confused_smile.gif"
            title: title,
            alt: title
/*
            width: 20,
            height: 20
*/
/*
            width: target.$.width,
            height: target.$.height
*/
        }
    });

    CKEDITOR.instances.editor.insertElement(img);
}

/**
 * The file names for the smileys to be displayed. These files must be
 * contained inside the URL path defined with the {@link #smiley_path} setting.
 *
 *		// This is actually the default value.
 *		config.smiley_images = [
 *			'regular_smile.gif','sad_smile.gif','wink_smile.gif','teeth_smile.gif','confused_smile.gif','tongue_smile.gif',
 *			'embarrassed_smile.gif','omg_smile.gif','whatchutalkingabout_smile.gif','angry_smile.gif','angel_smile.gif','shades_smile.gif',
 *			'devil_smile.gif','cry_smile.gif','lightbulb.gif','thumbs_down.gif','thumbs_up.gif','heart.gif',
 *			'broken_heart.gif','kiss.gif','envelope.gif'
 *		];
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.smiley_imagesGif = [
	'regular_smile.gif', 'sad_smile.gif', 'wink_smile.gif', 'teeth_smile.gif', 'confused_smile.gif', 'tongue_smile.gif',
	'embarrassed_smile.gif', 'omg_smile.gif', 'whatchutalkingabout_smile.gif', 'angry_smile.gif', 'angel_smile.gif', 'shades_smile.gif',
	'devil_smile.gif', 'cry_smile.gif', 'lightbulb.gif', 'thumbs_down.gif', 'thumbs_up.gif', 'heart.gif',
	'broken_heart.gif', 'kiss.gif', 'envelope.gif'
];
