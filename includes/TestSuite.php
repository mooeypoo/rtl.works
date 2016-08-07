<?php

namespace RTLWORKS;

class TestSuite {
	private $contentParser;
	private $cssFiles;
	private $analysis = array();

	function __construct( $url, $parsedContent, $cssFiles = array() ) {
		$this->contentParser = $parsedContent;
		$this->cssFiles = $cssFiles;
		$this->analysis = array(
			'url' => $url
		);
	}

	public function getAnalysisResult() {
		return $this->analysis;
	}

	/**
	 * Test whether there are dir attributes set on
	 * the content related nodes in the document.
	 */
	public function dirAttrTest() {
		$content_tags = array( 'html', 'body', 'div', 'span', 'p', 'ul' );

		// Look for dir tags in the content tags
		foreach ( $content_tags as $tag ) {
			$results = $this->contentParser->getAttributeForTags( $tag, 'dir' );

			$this->analysis[ 'analysis' ][ 'dir_attr' ][ $tag ] = count( $results );

			if ( count( $results ) > 0 ) {
				$this->analysis[ 'raw_results' ][ 'dir_attr' ][ $tag ] = implode( ',', $results );
			}
		}
	}

	/**
	 * Test whether there are float: rules in
	 * the CSS files
	 */
	public function cssFloatTest() {
		$this->cssTermExistenceTest( 'float', 'css_float', true );
	}

	/**
	 * Test whether there are direction: rules in
	 * the CSS files
	 */
	public function cssDirectionTest() {
		$this->cssTermExistenceTest( 'direction', 'css_direction', true );
	}

	/**
	 * Test whether there are literal positioning values
	 * within the css file.
	 */
	public function cssPositioningTest() {
		$this->cssTermExistenceTest( 'right', 'css_pos_right' );
		$this->cssTermExistenceTest( 'left', 'css_pos_left' );
	}

	/**
	 * Test whether a term exists in any of the CSS files
	 * and log the results.
	 *
	 * @param [type] $term Term to look for
	 * @param string [$testName] Test name. If not given, defaults to
	 *  the attribute name prefixed with 'css_'
	 * @param boolean $isAttribute Set the term as an attribute; adds
	 *  a colon after it, and logs the results. If not an attribute, the
	 *  results will log the entire line this was found in
	 */
	private function cssTermExistenceTest( $term, $testName = '', $isAttribute = false ) {
		// Look through all css files
		$count = 0;

		if ( empty( $testName ) ) {
			$testName = 'css_' . $term;
		}

		foreach ( $this->cssFiles as $file => $content ) {
			if ( $isAttribute ) {
				preg_match_all( '/' . $term . ': ?(\w+)/', $content, $results );
			} else {
				preg_match_all( '/(\w+):(\w+)? ?\b' . $term . '\b((\w+)? ?)/m', $content, $results );
			}

			$count += count( $results[ 1 ] );

			$this->analysis[ 'raw_results' ][ 'css' ][ $file ][ $testName ] = array(
				"count" => count( $results[ 1 ] ),
				"values" => implode( ',', $results[ 1 ] ),
			);
		}

		$this->analysis[ 'analysis' ][ $testName ] = $count;
	}
}
