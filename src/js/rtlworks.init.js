( function ( $ ) {
	'use strict';
	$( document ).ready( function () {
		var $button = $( '#rtlworks-analyze-button' ),
			$input = $( '#rtlworks-url-input' ),
			$resultDiv = $( '#rtlworks-result' ),
			$loading = $( '#rtlworks-loading' )
				.addClass( 'rtlworks-spinner' )
				.hide(),
			onAnalyzeButtonClick = function onAnalyzeButtonClick () {
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

		$button.on( 'click', onAnalyzeButtonClick );
		$input.on( 'keypress', function ( e ) {
			if ( e.which === 13 ) {
				onAnalyzeButtonClick();
				return false;
			}
		} );
	} );
} )( jQuery );
