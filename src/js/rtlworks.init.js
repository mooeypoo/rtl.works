( function ( $ ) {
	'use strict';
	$( document ).ready( function () {
		var $button = $( '#rtlworks-analyze-button' ),
			$input = $( '#rtlworks-url-input' );

		$button.on( 'click', function () {
			var url = $input.val();
			if ( !rtlworks.network.isUrlValid( url ) ) {
				console.log( 'Bad url: ' + url );
				return false;
			}

			rtlworks.util.setDisabled( $button, true );
			rtlworks.util.setDisabled( $input, true );
			rtlworks.network.runTests( url, 'all' )
				.then( function () {
					rtlworks.util.setDisabled( $button, false );
					rtlworks.util.setDisabled( $input, false );
				} );
		} );
	} );
} )( jQuery );
