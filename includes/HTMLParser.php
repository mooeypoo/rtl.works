<?php

namespace RTLWORKS;

/**
 * A small parser for rtl.works
 */
class HTMLParser {
	private $doc;
	private $originalHtml;

	function __construct( $html ) {
		$this->originalHtml = $html;
		$this->doc = new \PHPHtmlParser\Dom();
		$success = $this->doc->load( $html );

		// $success = @$this->doc->loadHTML( $html );
		$this->setErrorState( $success );
	}

	/**
	 * Look for stylesheets and collect their URLs
	 * for fetching.
	 *
	 * @param array $parsedUrl Parsed URL pieces
	 *  of the overall site
	 * @return [type] An array of urls for the
	 *  stylesheets
	 */
	public function getCSSFiles( $parsedUrl ) {
		$linkNodes = $this->doc->find( 'link[rel="stylesheet"]' );

		$cssurls = array();

		foreach ( $linkNodes as $node ) {
			$href = htmlspecialchars_decode( $node->getAttribute( 'href' ) );

			$cssurls[] = self::normalizeUrl( $parsedUrl, $href );
		}

		return $cssurls;
	}

	/**
	 * Return a normalized URL
	 *
	 * @param array $parsedUrl Parsed URL pieces
	 * @param string $link Original link to normalize
	 * @return string Normalized link
	 */
	public static function normalizeUrl( $parsedUrl, $link ) {
		// Normalize urls.
		// Adapted from http://stackoverflow.com/questions/14258708/how-to-get-contents-of-page-stylesheets-using-php-dom/14258882#14258882
		if ( substr( $link, 0, 4) === 'http' ) {
			// Good as-is
			$link = $link;
		} else if ( substr( $link, 0, 1 ) === '/' ) {
			$link = $parsedUrl[ 'scheme' ] . '://' . $parsedUrl[ 'host' ] . self::getUrlPath( $parsedUrl, true ) . $link;
		} else {
			$path = self::getUrlPath( $parsedUrl );
			$link = $parsedUrl[ 'scheme' ] . '://' .
				$parsedUrl[ 'host' ] . ( substr( $path, 0, 1 ) == '/' ? '' : '/' ) .
				self::getUrlPath( $parsedUrl ) .
				$link;
		}
		return $link;
	}

	/**
	 * Get a normalized path piece of a URL.
	 *
	 * @param array $parsedUrl Parsed URL pieces
	 * @param boolean $removeTrailingSlash Remove trailing slashes
	 * @return string Normalized path
	 */
	private static function getUrlPath ( $parsedUrl, $removeTrailingSlash = false ) {
		$path = isset( $parsedUrl[ 'path' ] ) && !empty( $parsedUrl[ 'path' ] ) && $parsedUrl[ 'path' ] !== '/' ?
				$parsedUrl[ 'path' ] : '';

		if ( $removeTrailingSlash && substr( $path, strlen( $path ) - 1 ) == '/' ) {
			$path = substr( $path, 0, strlen( $path ) - 1 );
			echo "cut path\n";
		}
		return $path;
	}

	/**
	 * Get the raw, original HTML
	 * @return string Original HTML
	 */
	public function getDocumentHtml() {
		return $this->originalHtml;
	}

	/**
	 * Get the content of the HTML page, minus
	 * HTML tags.
	 *
	 * @return string Content
	 */
	public function getDocumentContent() {
		return $this->doc->root->text( true );
	}

	/**
	 * Collect the values of a specific attribute for
	 * a given tag.
	 *
	 * @param string $tag Requested tag name
	 * @param string $attr Requested attribute name
	 * @return array An array of all values that were
	 *  found for the given attribute in the given tags.
	 */
	public function getAttributeForTags( $tag, $attr ) {
		$values = array();

		$tags = $this->doc->find( $tag );
		foreach ( $tags as $tag ) {
			$value = $tag->getAttribute( $attr );
			if ( !empty( $value ) ) {
				$values[] = $value;
			}
		}

		return $values;
	}

	/**
	 * Check whether there was an error parsing
	 * the page.
	 *
	 * @return boolean
	 */
	public function isError() {
		return $this->error;
	}

	/**
	 * Set the error state for parsing this page.
	 *
	 * @param boolean $isError There is an error
	 *  parsing this page.
	 */
	private function setErrorState( $isError ) {
		$this->error = (bool) $isError;
	}
}
