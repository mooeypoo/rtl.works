( function ( $ ) {
	'use strict';
	$( document ).ready( function () {
		var $button = $( '#rtlworks-analyze-button' ),
			$input = $( '#rtlworks-url-input' ),
			$resultDiv = $( '#rtlworks-result' ),
			$loading = $( '#rtlworks-loading' )
				.addClass( 'rtlworks-spinner' )
				.hide(),
			runAnalysis = function runAnalysis () {
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
						var model = new rtlworks.dm.ResultsModel( results ),
							panel = new rtlworks.ui.ResultsPanel( model );

						$resultDiv
							.append( panel.$element )
							.slideDown();

						$loading.hide();
					} )
					.fail( function () {
						$loading.hide();

						$resultDiv
							.append(
								$( '<div>' )
									.addClass( 'alert alert-warning' )
									.attr( 'role', 'alert' )
									.text( 'Could not load this page. Please check the URL.' )
								)
								.slideDown();
					} )
					.always( function () {
						rtlworks.util.setDisabled( $button, false );
						rtlworks.util.setDisabled( $input, false );
					} );

				return false;
			};

		if ( RTLWORKS_REQUESTED_URL ) {
			// Place the URL in the input box and activate
			// the analysis
			$input.val( RTLWORKS_REQUESTED_URL );
			runAnalysis();
		}

		$button.on( 'click', runAnalysis );
		$input.on( 'keypress', function ( e ) {
			if ( e.which === 13 ) {
				runAnalysis();
				return false;
			}
		} );
	} );
} )( jQuery );
