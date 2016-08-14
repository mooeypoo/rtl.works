<?php

namespace RTLWORKS;

/**
 * A mini proxy for web pages.
 * Inspired and adapted from https://github.com/joshdick/miniProxy/blob/master/miniProxy.php
 */
class Proxy {

	private $userAgent;
	private $curl;
	private $parsedUrl;

	function __construct() {
		$this->userAgent = $_SERVER["HTTP_USER_AGENT"];
		if ( empty( $userAgent ) ) {
			// Fake a user-agent
			$this->userAgent = "Mozilla/5.0 (compatible; miniProxy)";
		}

	}

	public static function normalizeURL( $url ) {
		// Check if URL has scheme:
		$parsed = parse_url( $url );
		if (
			!isset( $parsed[ 'scheme' ] ) ||
			empty( $parsed[ 'scheme' ] )
		) {
			// Assume a URL without a scheme is an
			// http:// URL
			$url = 'http://' . $url;
		}

		return $url;
	}

	/**
	 * Fetch the given URL.
	 *
	 * @param string $url URL to fetch
	 * @return string The contents of the page.
	 */
	public function fetch( $url ) {
		// Normalize URL
		$url = self::normalizeURL( $url );
		// Store the parsed url
		$this->parsedUrl = parse_url( $url );
		// Open connection
		$this->startConnection( $url );
		// Request the data
		$response = curl_exec( $this->curl );

		$error = curl_error( $this->curl );

		// Close connection
		$this->closeConnection();

		// Throw an error if there is one
		if ( $error ) {
			// TODO: This should be handled better in general
			throw new Exception( $error );
		}

		// Return the response
		return $response;
	}

	/**
	 * Get the parsed URL pieces for this page.
	 *
	 * @return array Parsed url
	 */
	public function getParsedUrl() {
		return $this->parsedUrl;
	}

	/**
	 * Set up curl and its connection variables
	 */
	private function startConnection( $url ) {
		$this->curl = curl_init();
		curl_setopt( $this->curl, CURLOPT_USERAGENT, $this->userAgent );
		curl_setopt( $this->curl, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $this->curl, CURLOPT_ENCODING, "" );
		curl_setopt( $this->curl, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $this->curl, CURLOPT_URL, $url );
	}

	/**
	 * Close the curl connection and reset.
	 */
	private function closeConnection() {
		curl_close( $this->curl );
		$this->curl = null;
	}
}
