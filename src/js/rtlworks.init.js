( function ( $ ) {
	'use strict';
	$( document ).ready( function () {
		var $button = $( '#rtlworks-analyze-button' ),
			$input = $( '#rtlworks-url-input' ),
			$resultDiv = $( '#rtlworks-result' );

		$button.on( 'click', function () {
			var url = $input.val();
			if ( !rtlworks.network.isUrlValid( url ) ) {
				console.log( 'Bad url: ' + url );
				return false;
			}

			rtlworks.util.setDisabled( $button, true );
			rtlworks.util.setDisabled( $input, true );
			$resultDiv
				.slideUp()
				.empty();
			rtlworks.network.runTests( url, 'all' )
				.then( function ( results ) {
					// Show result
					var panel = new rtlworks.ui.ResultsPanel( results );
console.log( results );
					$resultDiv
						.append( panel.$element )
						.slideDown();
				} )
				.then( function () {
					rtlworks.util.setDisabled( $button, false );
					rtlworks.util.setDisabled( $input, false );
				} );
		} );
	} );
} )( jQuery );
