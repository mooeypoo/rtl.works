/**
 * Share buttons for the results
 *
 * @param {Object} config Configuration object
 * @cfg {string] [intro='Share results!'] Introduction text to the buttons.
 * @cfg {Object} [text] Sharing text for the social sites
 * @cfg {stirng} [text.default] Default text for sharing action
 * @cfg {string} [text.twitter] Text for the shared tweet
 * @cfg {string} [text.facebook] Text for the shared facebook post
 */
rtlworks.ui.SharingPanel = function ( config ) {
	config = config || {};

	this.text = config.text || {};

	this.text.default = this.text.default || 'Analyze your site\'s right-to-left support';
	this.$element = $( '<div>' )
		.addClass( 'rtlworks-ui-sharingPanel' )
		.append(
			$( '<div>' )
				.addClass( 'rtlworks-ui-sharingPanel-intro' )
				.append( config.intro || 'Share results!' ),
			$( '<div>' )
				.addClass( 'rtlworks-ui-sharingPanel-buttons' )
				.addClass( 'ssk-lg ssk-group' )
				.append(
					$( '<a>' ).addClass( 'ssk ssk-twitter' ),
					$( '<a>' ).addClass( 'ssk ssk-facebook' ),
					$( '<a>' ).addClass( 'ssk ssk-linkedin' ),
					$( '<a>' ).addClass( 'ssk ssk-email' )
				)
		);
};

rtlworks.ui.SharingPanel.prototype.init = function () {
	SocialShareKit.init( {
		title: 'I just analyzed my site\'s right-to-left support',
		text: this.text.default,
		twitter: {
			// social-share-kit automatically prepends the title and a dash
			// to the text if it exists, so we will leave it empty by default,
			// trusting that title is the only thing needed
			text: this.text.twitter || ''
		},
		facebook: {
			text: this.text.facebook || ''
		},
		linkedin: {
			text: this.text.linkedin || 'Check out the results: ' + window.location.href
		},
		email: {
			text: this.text.email || 'Check out the results: ' + window.location.href
		}
	} );

};
