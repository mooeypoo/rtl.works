<?php

include 'vendor/autoload.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app = new \Slim\App;

$app->get( '[/]', function (Request $request, Response $response) {
	return $response
		->getBody()->write( "Welcome to rtl.works API. Documentation is coming, I promise!<br/>For now, try <a href='api.php/test/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMain_Page/'>api.php/test/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMain_Page/</a>" );
} );


$app->get( '/test[/]', function (Request $request, Response $response) {
	return $response
		->getBody()->write( 'Missing a URL' );
} );

$app->get( '/test/{url}[/[{types}]]', function (Request $request, Response $response) {

	// NOTE: If you're using apache server, the directive
	// "AllowEncodedSlashes On" must be enabled to this
	// virtual host (this directive is not inherited)
	// see https://httpd.apache.org/docs/2.4/mod/core.html#allowencodedslashes
	$url = $request->getAttribute( 'url' );
	$types = $request->getAttribute( 'types' );


	if ( !$url ) {
		return $response->getBody()->write( 'Missing parameter' );
	}

	$testSuite = createTestSuite( $url );

	$errors = array();
	$tests = array();

	if ( empty( $types ) || $types === 'all' ) {
		// Run all
		$testSuite->dirAttrTest();
		$testSuite->cssFloatTest();
		$testSuite->cssDirectionTest();
		$testSuite->cssPositioningTest();

		$tests = array(
			'dir_attr',
			'css_float',
			'css_direction',
			'css_pos'
		);
	} else {
		$testTypes = explode( ',', $types );
		foreach ( $testTypes as $type ) {
			switch ( $type ) {
				case 'dir_attr':
					$testSuite->dirAttrTest();
					break;
				case 'css_float':
					$testSuite->cssFloatTest();
					break;
				case 'css_direction':
					$testSuite->cssDirectionTest();
					break;
				case 'css_pos':
					$testSuite->cssPositioningTest();
					break;
				default:
					$errors[] = 'Test type "' . $type . '" was not recognized.';
					break;
			}
			$tests[] = $type;
		}
	}

	$result = $testSuite->getAnalysisResult();
	$result[ 'date' ] = date( 'Y-m-d H:i:s' );
	$result[ 'test_list' ] = $tests;
	if ( count( $errors ) ) {
		$result[ 'errors' ] = $errors;
	}

	return $response
		->withHeader( 'Content-type', 'application/json' )
		->withJson( $result );
} );

$app->run();

function createTestSuite( $url ) {
	$proxy = new RTLWORKS\Proxy();
	$pageContents = $proxy->fetch( $url );
	$contentParser = new RTLWORKS\HTMLParser( $pageContents );
	$cssFiles = $contentParser->getCSSFiles( $proxy->getParsedUrl() );

	$cssContents = array();
	foreach ( $cssFiles as $file ) {
		$cssContents[ $file ] = $proxy->fetch( $file );
	}

	return new RTLWORKS\TestSuite( $url, $contentParser, $cssContents );
}
