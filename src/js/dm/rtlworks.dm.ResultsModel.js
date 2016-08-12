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
			[
				'html: ' + ( Number( results.analysis.dir_attr_global.html ) > 0 ? 'Yes' : 'No' ),
				'body: ' + ( Number( results.analysis.dir_attr_global.body ) > 0 ? 'Yes' : 'No' ),
			].join( ', ' )
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

/**
 * Check if a test exists in the list
 *
 * @param {string} testName Test name
 * @return {boolean} Test exists
 */
rtlworks.dm.ResultsModel.prototype.hasTest = function ( testName ) {
	return this.tests.indexOf( testName ) > -1;
};
