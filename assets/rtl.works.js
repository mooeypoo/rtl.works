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

rtlworks.dm = {};

/**
 * Model storing and analyzing the results
 *
 * @param {Object} results Results object
 */
rtlworks.dm.ResultsModel = function ( results ) {
	var num, explanations;

	this.tests = results.test_list;
	this.url = results.url;

	this.results = {};
	// Analysis
	if ( this.hasTest( 'dir_attr' ) ) {
		// A) <html> and <body>
		this.addTestResults(
			// Name
			'dir_attr_head',
			// Status type
			'warning',
			// Status
			Number( results.analysis.dir_attr.html ) || Number( results.analysis.dir_attr.body ),
			// Messages
			results.messages.dir_attr.head,
			// Results
			{
				html: results.analysis.dir_attr.html,
				body: results.analysis.dir_attr.body
			}
		);

		// B) Directionality in other tags
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

		this.addTestResults(
			// Name
			'dir_attr_content',
			// Status type
			'warning',
			// Status
			countTotal > 0,
			// Messages
			results.messages.dir_attr.content,
			// Results
			explanations.join( ', ' )
		);
	}

	// CSS: Float
	if ( this.hasTest( 'css_float' ) ) {
		this.addTestResults(
			// Name
			'css_float',
			// Status type
			'warning',
			// Status
			( results.analysis.css_float === 0 ),
			// Messages
			results.messages.css_float,
			// Results
			results.analysis.css_float + ' elements'
		);
	}

	// CSS: Absolute positioning
	if ( this.hasTest( 'css_pos_absolute' ) ) {
		this.addTestResults(
			// Name
			'css_pos_absolute',
			// Status type
			'warning',
			// Status
			( results.analysis.css_pos_absolute === 0 ),
			// Messages
			results.messages.css_pos,
			// Results
			results.analysis.css_pos_absolute + ' rules'
		);
	}

	// CSS: Explicit positioning (left/right)
	if ( this.hasTest( 'css_pos' ) ) {
		this.addTestResults(
			// Name
			'css_pos',
			// Status type
			'warning',
			// Status
			( results.analysis.css_pos_left === 0 && results.analysis.css_pos_right === 0 ),
			// Messages
			results.messages.css_pos,
			// Results
			{
				left: results.analysis.css_pos_left,
				right: results.analysis.css_pos_right
			}
		);
	}
};

/**
 * Add a test result to the object
 *
 * @param {[type]} name Test name
 * @param {[type]} statusType Status type, defining whether the test
 *  failure is 'warning' or 'danger'.
 * @param {boolean} status Test status: Pass or fail
 * @param {[type]} messages intro and description messages
 * @param {[type]} results [description]
 */
rtlworks.dm.ResultsModel.prototype.addTestResults = function ( name, statusType, status, messages, results ) {
	this.results[ name ] = {
		status: !!status ? 'success' : statusType,
		messages: messages,
		results: results
	};
};

/**
 * Get test results
 *
 * @param {string} name Test name
 * @return {Object} Results object
 */
rtlworks.dm.ResultsModel.prototype.getTestResults = function ( name ) {
	return this.results[ name ];
};

rtlworks.dm.ResultsModel.prototype.getAllResults = function () {
	return this.results;
};

/**
 * Get the test list for this analysis
 *
 * @return {string[]} Test names
 */
rtlworks.dm.ResultsModel.prototype.getTests = function () {
	return this.tests;
};

rtlworks.dm.ResultsModel.prototype.getUrl = function () {
	return this.url;
};

/**
 * Check if a test exists in the list
 *
 * @param {string} testName Test name
 * @return {boolean} Test exists
 */
rtlworks.dm.ResultsModel.prototype.hasTest = function ( testName ) {
	return this.tests.indexOf( testName ) > -1;
};

rtlworks.ui = {};

/**
 * Bootstrap panel for displaying the results
 *
 * TODO: Might be better to analyze and store the data
 * better before letting the widget work with it.
 *
 * @param {rtlworks.dm.ResultsModel} model Results model
 * @param {Object} config Configuration object
 * @cfg {string} [title] Panel title
 * @cfg {string} [type='primary'] Panel type. Affects styling
 */
rtlworks.ui.ResultsPanel = function ( model, config ) {
	var $title, $body, countTotal, explanations,
		panel = this,
		$table = $( '<table>' )
			.addClass( 'table' )
			.addClass( 'rtlworks-ui-ResultsPanel-table' );

	config = config || {};

	this.model = model;

	this.$element = $( '<div>' )
		.addClass( 'panel panel-' + ( config.type || 'primary' ) )
		.addClass( 'rtlworks-ui-ResultsPanel' );

	$title = $( '<div>' )
		.addClass( 'panel-heading' )
		.append(
			$( '<h3>' )
				.addClass( 'panel-title' )
				// TODO: Support i18n strings
				.append( config.title || 'Results for <em>' + this.model.getUrl() + '</em>' )
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
	Object.keys( this.model.getAllResults() ).forEach( function ( name ) {
		var $result = $( '<div>' ),
			test = panel.model.getTestResults( name );

		if ( name === 'dir_attr_head' ) {
			$result.append(
				$( '<p>' ).text( '&lt;html&gt: ' + test.results.html ? 'Yes' : 'No' ),
				$( '<p>' ).text( '&lt;body&gt: ' + test.results.body ? 'Yes' : 'No' )
			);
		} else if ( name === 'css_pos' ) {
			$result.append(
				$( '<p>' ).text( 'left: ' + test.results.left ),
				$( '<p>' ).text( 'right: ' + test.results.right )
			);
		} else {
			$result.append(
				$( '<p>' ).text( 'Found in: ' + test.results )
			);
		}

		$table.append(
			panel.getTableRow(
				test.status,
				test.messages,
				$result.contents()
			)
		);
	} );

	// Append the table
	this.$element.append( $table );
};

/**
 * Get a full table row to append
 *
 * @param {boolean} status The test status 'ok', 'warning' or 'danger'
 * @param {string} name Title or name of the test
 * @param {Object} message Messages for the test
 * @param {string} message.intro Intro text
 * @param {string} message.description Description text
 * @param {jQuery} $result Result jQuery object
 * @return {jQuery} Table row
 */
rtlworks.ui.ResultsPanel.prototype.getTableRow = function ( status, messages, $result ) {
	icon = status;
	if ( status === 'warning' ) {
		icon = 'exclamation-sign';
	} else if ( status === 'danger' ) {
		icon = 'thumbs-down';
	}

	return $( '<tr>' )
		.addClass( 'alert-' + status )
		.append(
			// Icon
			$( '<td>' )
				.append(
					$( '<span>' )
						.addClass( 'glyphicon glyphicon-' + ( status === 'ok' ? 'ok' : 'exclamation-sign' ) )
				),
			$( '<td>' )
				.append(
					$( '<div>' )
						.append( messages.intro )
						.contents()
				),
			$( '<td>' )
				.append( $result )
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
					var model = new rtlworks.dm.ResultsModel( results ),
						panel = new rtlworks.ui.ResultsPanel( model );

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
