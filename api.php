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
	$testSuite->runTests( explode( ',', $types ) );

	$result = $testSuite->getAnalysisResult();

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
