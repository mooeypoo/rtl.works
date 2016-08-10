var rtlworks = {};

rtlworks.util = {
	/**
	 * Set an element to a disabled state in bootstrap
	 *
	 * @param {jQuery} $element jQuery element
	 * @param {boolean} isDisabled The element is disabled
	 */
	setDisabled: function ( $element, isDisabled ) {
		$element
			.toggleClass( 'disabled', isDisabled );

		if ( isDisabled ) {
			$element.attr( 'disabled', 'disabled' );
		} else {
			$element.removeAttr( 'disabled' );
		}
	}
};

rtlworks.network = {
	/**
	 * Checks whether the given URL is valid.
	 * Taken from https://github.com/jzaefferer/jquery-validation/blob/f37c2d8131ca0e3c2af0093f6fd9d2c40c282663/src/core.js#L1159
	 *
	 * @method
	 * @param {string} url Given URL
	 * @return {boolean} URL is valid
	 */
	isUrlValid: function ( url ) {
		return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( url );
	},
	/**
	 * Send the URL to the API for a test suite result
	 *
	 * @method
	 * @param {string} url Valid URL
	 * @param {string|string[]} [tests] A string for a test name or an
	 *  array of test names
	 * @return {jQuery.Promise} Promise that is resolved when the
	 *  server returns with the reply analysis.
	 */
	runTests: function ( url, tests ) {
		tests = Array.isArray( tests ) ? tests : [ tests ];
		return $.ajax( {
			url: 'api.php/test/', // Local API endpoint
			dataType: 'json',
			data: {
				url: url,
				tests: tests.join( ',' )
			}
		} );
	}
};

rtlworks.ui = {};

/**
 * Bootstrap panel for displaying the results
 *
 * TODO: Might be better to analyze and store the data
 * better before letting the widget work with it.
 *
 * @param {Object} results Results object
 * @param {Object} config Configuration object
 * @cfg {string} [title] Panel title
 * @cfg {string} [type='primary'] Panel type. Affects styling
 */
rtlworks.ui.ResultsPanel = function ( results, config ) {
	var $title, $body, countTotal, explanations,
		$table = $( '<table>' )
			.addClass( 'table' )
			.addClass( 'rtlworks-ui-ResultsPanel-table' );

	config = config || {};

	this.tests = results.test_list;

	this.$element = $( '<div>' )
		.addClass( 'panel panel-' + ( config.type || 'primary' ) )
		.addClass( 'rtlworks-ui-ResultsPanel' );

	$title = $( '<div>' )
		.addClass( 'panel-heading' )
		.append(
			$( '<h3>' )
				.addClass( 'panel-title' )
				// TODO: Support i18n strings
				.append( config.title || 'Results for <em>' + results.url + '</em>' )
		);

	this.$element.append( $title );

	if ( config.body ) {
		$body = $( '<div>' )
			.addClass( 'panel-body' )
			.addClass( 'rtlworks-ui-ResultsPanel-body' )
			.append( config.body );

		this.$element.append( $body );
	}

	// Build the table
	// TODO: Seriously, this needs to be done better. Say, in a model <grumble grumble>
	// TODO: Add explanations for why these tests matter,
	// what they mean, and what people should pay attention to

	if ( this.tests.indexOf( 'dir_attr' ) > -1 ) {
		// Test a: Content; directionality in html/body
		$table.append(
			this.getTableRow(
				( results.analysis.dir_attr.html || results.analysis.dir_attr.body ),
				'Explicit directionality in &lt;html&gt; or &lt;body&gt; tags.',
				$( '<div>' )
					.append(
						$( '<p>' )
							.append( 'html tag: ' + this.getStringBoolean( results.analysis.dir_attr.html ) ),
						$( '<p>' )
							.append( 'body tag: ' + this.getStringBoolean( results.analysis.dir_attr.body ) )
					).contents()
			)
		);

		// Test b: Content; directionality in content blocks
		countTotal = 0;
		explanations = [];
		Object.keys( results.analysis.dir_attr ).forEach( function ( key ) {
			var num;
			if ( key !== 'html' && key !== 'body' ) {
				num = Number( results.analysis.dir_attr[ key ] );
				countTotal += num;

				if ( num > 0 ) {
					explanations.push( num + ' ' + key + '\'s' );
				}
			}
		} );
		$table.append(
			this.getTableRow(
				countTotal > 0,
				'Explicit directionality in content blocks.',
				explanations.join( ', ' )
			)
		);
	}

	// Test CSS; float
	if ( this.tests.indexOf( 'css_float' ) > -1 ) {
		$table.append(
			this.getTableRow(
				( results.analysis.css_float === 0 ),
				'Using floating elements',
				results.analysis.css_float + ' elements defined with \'float\''
			)
		);
	}

	// Test CSS; absolute positioning
	if ( this.tests.indexOf( 'css_pos_absolute' ) > -1 > -1 ) {
		$table.append(
			this.getTableRow(
				( results.analysis.css_pos_absolute === 0 ),
				'Using absolute positioning',
				results.analysis.css_pos_absolute + ' elements absolutely positioned'
			)
		);
	}

	// Test CSS; explicit positioning (left/right)
	if ( this.tests.indexOf( 'css_pos' ) > -1 ) {
		$table.append(
			this.getTableRow(
				( results.analysis.css_pos_left === 0 && results.analysis.css_pos_right === 0 ),
				'Explicit positioning (left/right)',
				$( '<div>' )
					.append(
						$( '<p>' )
							.append( results.analysis.css_pos_left + ' positioned \'left\'' ),
						$( '<p>' )
							.append( results.analysis.css_pos_right + ' positioned \'right\'' )
					).contents()
			)
		);
	}

	// Append the table
	this.$element.append( $table );
};

/**
 * Get a full table row to append
 *
 * @param {boolean} isOkay The test passed
 * @param {string} name Title or name of the test
 * @param {string} description Details of the test
 * @return {jQuery} Table row
 */
rtlworks.ui.ResultsPanel.prototype.getTableRow = function ( isOkay, name, details ) {
	return $( '<tr>' )
		.addClass( 'alert-' + ( isOkay ? 'success' : 'warning' ) )
		.append(
			// Icon
			$( '<td>' )
				.append(
					$( '<span>' )
						.addClass( 'glyphicon glyphicon-' + ( isOkay ? 'ok' : 'exclamation-sign' ) )
				),
			$( '<td>' )
				.append( name ),
			$( '<td>' )
				.append( details )
			// TODO: Append an 'explanation' / 'help' icon
			// with an actual explanation about what's going on
			// with the results
		);
};

/**
 * Help translate a boolean into language. This should really be using i18n message.
 *
 * @param {boolean} condition Condition to test
 * @return {string} Yes or no strings
 */
rtlworks.ui.ResultsPanel.prototype.getStringBoolean = function ( condition ) {
	return condition ? 'yes' : 'no';
};

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
