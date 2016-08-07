<?php

namespace RTLWORKS;

/**
 * A small parser for rtl.works
 */
class HTMLParser {
	private $doc;
	private $xpath;

	function __construct( $html ) {
		$this->doc = new \DomDocument();
		$success = @$this->doc->loadHTML( $html );
		$this->setErrorState( $success );
		$this->xpath = new \DOMXPath( $this->doc );
	}

	public function getCSSFiles( $parsedUrl ) {
		$stylesheetNodes = $this->xpath->query( '//link[@rel="stylesheet"]' );

		$cssurls = array();

		foreach ( $stylesheetNodes as $node ) {
			$href = $node->getAttribute( 'href' );

			// Normalize urls.
			// Adapted from http://stackoverflow.com/questions/14258708/how-to-get-contents-of-page-stylesheets-using-php-dom/14258882#14258882
			if ( substr( $href, 0, 4) === 'http' ) {
				// Good as-is
				$link = $href;
			} else if ( substr( $href, 0, 1 ) === '/' ) {
				$link = $parsedUrl[ 'scheme' ] . '://' . $parsedUrl[ 'host' ] . '/' . $href;
			} else {
				$link = $parsedUrl[ 'scheme' ] . '://' . $parsedUrl[ 'host' ] . '/' . $parsedUrl[ 'path' ] . '/' . $href;
			}

			$cssurls[] = $link;
		}

		return $cssurls;
	}

	public function getAttributeForTags( $tag, $attr ) {
		$values = array();

		$tags = $this->doc->getElementsByTagName( $tag );
		foreach ( $tags as $tag ) {
			$value = $tag->getAttribute( $attr );
			if ( !empty( $value ) ) {
				$values[] = $value;
			}
		}

		return $values;
	}

	public function isError() {
		return $this->error;
	}

	private function setErrorState( $isError ) {
		$this->error = (bool) $isError;
	}

	private function reset() {
		$this->setErrorState( false );
		$this->doc = new \DomDocument();
		$this->xpath = null;
	}
}
