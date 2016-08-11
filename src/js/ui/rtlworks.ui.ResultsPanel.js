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
