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
		summary.push( '<strong>' + this.model.getNumberForType( 'success' ) + '</strong> successfull tests' );
	}

	if ( this.model.getNumberForType( 'warning' ) ) {
		summary.push( '<strong>' + this.model.getNumberForType( 'warning' ) + '</strong> tests with warnings' );
	}

	if ( this.model.getNumberForType( 'danger' ) ) {
		summary.push( '<strong>' + this.model.getNumberForType( 'danger' ) + '</strong> failed tests' );
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
