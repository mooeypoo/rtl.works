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
		return /^((https?|s?):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( url );
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
	this.numbers = {
		success: 0,
		warning: 0,
		danger: 0
	};
	this.probableSiteDir = '';

	this.results = {};
	// Analysis
	if ( this.hasTest( 'dir_attr_global' ) ) {
		// A) <html> and <body>
		this.addTestResults(
			// Name
			'dir_attr_global',
			// Status type
			'warning',
			// Status
			Number( results.analysis.dir_attr_global.html ) || Number( results.analysis.dir_attr_global.body ),
			// Messages
			results.messages.dir_attr_global,
			// Results
			results.analysis.dir_attr_global
		);
	}

	if ( this.hasTest( 'dir_attr_content' ) ) {
		// B) Directionality in other tags
		countTotal = 0;
		explanations = [];
		Object.keys( results.analysis.dir_attr_content ).forEach( function ( key ) {
			var num = Number( results.analysis.dir_attr_content[ key ] );

			countTotal += num;

			if ( num > 0 ) {
				explanations.push( num + ' ' + key + '\'s' );
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
			results.messages.dir_attr_content,
			// Results
			explanations.join( ', ' )
		);
	}

	// Number of LTR vs RTL characters
	if ( this.hasTest( 'char_dir_dist' ) ) {
		this.probableSiteDir = results.analysis.char_dir_dist.rtl > results.analysis.char_dir_dist.ltr ?
			'rtl' : 'ltr';

		this.addTestResults(
			// Name
			'char_dir_dist',
			// Status type
			'danger',
			// Status
			(
				// This test passes if there are only characters in one direction
				( results.analysis.char_dir_dist.ltr > 0 && results.analysis.char_dir_dist.rtl === 0 ) ||
				( results.analysis.char_dir_dist.ltr === 0 && results.analysis.char_dir_dist.rtl > 0 )
			),
			// Messages
			results.messages.char_dir_dist,
			// Results
			results.analysis.char_dir_dist
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
			results.messages.css_pos_absolute,
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
 * @param {boolean} passfail Test passed or failed
 * @param {[type]} messages intro and description messages
 * @param {[type]} results [description]
 */
rtlworks.dm.ResultsModel.prototype.addTestResults = function ( name, statusType, passfail, messages, results ) {
	this.results[ name ] = {
		status: !!passfail ? 'success' : statusType,
		messages: messages,
		results: results
	};

	this.numbers[ passfail ? 'success' : statusType  ]++;
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

rtlworks.dm.ResultsModel.prototype.getNumberForType = function ( status ) {
	return this.numbers[ status ];
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

rtlworks.dm.ResultsModel.prototype.getProbableDir = function () {
	return this.probableSiteDir;
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

	// Title
	this.$element
		.append(
			$( '<div>' )
				.addClass( 'panel-heading' )
				.append(
					$( '<h3>' )
						.addClass( 'panel-title' )
						// TODO: Support i18n strings
						.append( config.title || 'Results for <em>' + this.model.getUrl() + '</em>' )
				)
		);

	if ( this.model.getProbableDir() === 'rtl' ) {
		// Probably direction is already RTL
		this.$element
			.append(
				$( '<div>' )
					.addClass( 'panel-body' )
					.addClass( 'rtlworks-ui-ResultsPanel-body-intro' )
					.append(
						$( '<div>' )
							.addClass( 'alert alert-info' )
							.append(
								$( '<p>' )
									.append( 'This site is probably Right-to-Left' ),
								$( '<p>' )
									.append( 'But the results below can tell you if your site can support Left-to-Right, too!' )
							)
					)
			);
	}

	// Body
	this.$element
		.append(
			$( '<div>' )
				.addClass( 'panel-body' )
				.addClass( 'rtlworks-ui-ResultsPanel-body-intro' )
				.append(
					$( '<h1>' ).append( 'We can\'t really tell.' ),
					$( '<p>' ).append( '(No automated system can...)' ),
					$( '<h1>' ).append( 'But we <strong>can</strong> give you some pointers!' )
				)
		);

	// Summary
	summary = [];
	if ( this.model.getNumberForType( 'success' ) ) {
		summary.push( '<strong>' + this.model.getNumberForType( 'success' ) + '</strong> successfull test(s)' );
	}

	if ( this.model.getNumberForType( 'warning' ) ) {
		summary.push( '<strong>' + this.model.getNumberForType( 'warning' ) + '</strong> test(s) with warnings' );
	}

	if ( this.model.getNumberForType( 'danger' ) ) {
		summary.push( '<strong>' + this.model.getNumberForType( 'danger' ) + '</strong> issue(s) you should watch out for' );
	}

	lastItem = summary.pop();
	finalSummary = 'We found ';
	if ( summary.length > 0 ) {
		finalSummary += summary.join( ', ' ) + ' and ' + lastItem;
	} else if ( lastItem ) {
		finalSummary += lastItem;
	} else {
		finalSummary = 'Here\'s what we found:';
	}

	this.$element.append(
		$( '<div>' )
			.addClass( 'panel-body' )
			.addClass( 'rtlworks-ui-ResultsPanel-body-summary' )
			.append( $( '<p>' ).append( finalSummary ) )
	);

	// Build the table
	Object.keys( this.model.getAllResults() ).forEach( function ( name ) {
		var $result = $( '<div>' ),
			test = panel.model.getTestResults( name );

		if ( name === 'dir_attr_global' ) {
			$result.append(
				$( '<ul>' ).append(
					$( '<li>' ).text( '<html>: ' + ( test.results.html ? 'Yes' : 'No' ) ),
					$( '<li>' ).text( '<body>: ' + ( test.results.body ? 'Yes' : 'No' ) )
				)
			);
		} else if ( name === 'css_pos' ) {
			$result.append(
				$( '<p>' ).text( 'left: ' + test.results.left ),
				$( '<p>' ).text( 'right: ' + test.results.right )
			);
		} else if ( name === 'char_dir_dist' ) {
			if ( test.results.ltr > 0 && test.results.rtl === 0 ) {
				$result.append(
					$( '<p>' ).text( 'Website content is only in LTR.' )
				);
			} else if ( test.results.ltr === 0 && test.results.rtl > 0 ) {
				$result.append(
					$( '<p>' ).text( 'Website content is only in RTL.' )
				);
			} else {
				$result.append(
					$( '<p>' ).append(
						$( '<strong>' ).append( 'WATCH OUT: Website content is mixed</strong><br />' ),
						$( '<small>' ).append( 'Make sure to properly isolate or embed.' )
					),
					$( '<ul>' ).append(
						$( '<li>' ).text( test.results.ltr + ' characters in LTR' ),
						$( '<li>' ).text( test.results.rtl + ' characters in RTL' )
					)
				);
			}
		} else {
			$result.append(
				$( '<p>' ).text( 'Found in: ' + test.results )
			);
		}

		panel.getTableRow(
			$table,
			name,
			test.status,
			test.messages,
			$result.contents()
		);
	} );

	// Append the table
	this.$element.append( $table );
};

/**
 * Get a full table row to append
 *
 * @param {boolean} status The test status 'success', 'warning' or 'danger'
 * @param {string} name Title or name of the test
 * @param {Object} message Messages for the test
 * @param {string} message.intro Intro text
 * @param {string} message.description Description text
 * @param {jQuery} $result Result jQuery object
 * @return {jQuery} Table row
 */
rtlworks.ui.ResultsPanel.prototype.getTableRow = function ( $table, name, status, messages, $result ) {
	var $tr, descriptionMessage;

	if ( status === 'warning' ) {
		icon = 'exclamation-sign';
	} else if ( status === 'success' ) {
		icon = 'ok';
	} else if ( status === 'danger' ) {
		icon = 'fire';
	}

	$tr = $( '<tr>' )
				.addClass( 'alert-' + status )
				.addClass( 'rtlworks-ui-resultsPanel-table-result' )
				.append(
					// Icon
					$( '<td>' )
						.append(
							$( '<span>' )
								.addClass( 'glyphicon glyphicon-' + icon )
						),
					$( '<td>' )
						.append(
							$( '<div>' )
								.append( messages.intro )
								.contents()
						),
					$( '<td>' )
						.append( $result )
				);

	// Trigger
	$helpCell = $( '<td>' );

	$tr.append( $helpCell );
	$table.append( $tr );

	if ( messages.description ) {
		$helpCell
			.addClass( 'rtlworks-ui-resultsPanel-table-description-trigger' )
			.append(
				$( '<span>' )
					.addClass( 'glyphicon glyphicon-question-sign' )
					.data( 'name', name )
					.data( 'open', false )
					.on( 'click', function () {
						var name = $( this ).data( 'name' )
							isOpen = !!$( this ).data( 'open' ),
							$row = $( '.rtlworks-ui-resultsPanel-table-description-' + name + '-row' ),
							$content = $( '.rtlworks-ui-resultsPanel-table-description-' + name + '-content' );

						$( this ).data( 'open', !isOpen );

						if ( isOpen ) {
							$content
								.slideUp( 400, null, function () {
									$row.hide();
								} );
						} else {
							$row.show();
							$content.slideDown();
						}
					} )
			);

		$table
			.append(
				$( '<tr>' )
					.addClass( 'alert alert-info' )
					.addClass( 'rtlworks-ui-resultsPanel-table-description-content' )
					.addClass( 'rtlworks-ui-resultsPanel-table-description-' + name + '-row' )
					.append(
						$( '<td>' )
							.attr( 'colspan', 10 )
							.append(
								$( '<div>' )
									.addClass( 'rtlworks-ui-resultsPanel-table-description-' + name + '-content' )
									.append( messages.description )
									.hide()
							)
					)
					.hide()
			);
	}
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
