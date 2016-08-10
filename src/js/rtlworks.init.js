( function ( $ ) {
	'use strict';
	$( document ).ready( function () {
		var $button = $( '#rtlworks-analyze-button' ),
			$input = $( '#rtlworks-url-input' ),
			$resultDiv = $( '#rtlworks-result' ),
			$loading = $( '#rtlworks-loading' )
				.addClass( 'rtlworks-spinner' )
				.hide();

		$button.on( 'click', function () {
			var url = $input.val();

			$resultDiv
				.slideUp()
				.empty();

			if ( !rtlworks.network.isUrlValid( url ) ) {
				$resultDiv
					.append(
						$( '<div>' )
							.addClass( 'alert alert-warning' )
							.attr( 'role', 'alert' )
							.text( 'Please provide a valid URL.' )
						)
						.slideDown();
				return false;
			}

			$loading.show();
			rtlworks.util.setDisabled( $button, true );
			rtlworks.util.setDisabled( $input, true );

			rtlworks.network.runTests( url, 'all' )
				.then( function ( results ) {
					// Show result
					var panel = new rtlworks.ui.ResultsPanel( results );

					$resultDiv
						.append( panel.$element )
						.slideDown();

					$loading.hide();
				} )
				.then( function () {
					rtlworks.util.setDisabled( $button, false );
					rtlworks.util.setDisabled( $input, false );
				} );
		} );
	} );
} )( jQuery );
