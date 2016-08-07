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

	public function fetch( $url ) {
		// Store the parsed url
		$this->parsedUrl = parse_url( $url );
		// Open connection
		$this->startConnection( $url );
		// Request the data
		$response = curl_exec( $this->curl );
		// Close connection
		$this->closeConnection();

		// Return the response
		return $response;
	}

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
		curl_setopt( $this->curl, CURLOPT_URL, $url );
	}

	private function closeConnection() {
		curl_close( $this->curl );
		$this->curl = null;
	}
}
