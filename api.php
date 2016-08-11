<?php

include 'vendor/autoload.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app = new \Slim\App;

$app->get( '[/]', function (Request $request, Response $response) {
	return $response
		->getBody()->write( "Welcome to rtl.works API. Documentation is coming, I promise!<br/>For now, try <a href='api.php/test/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMain_Page/'>api.php/test/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMain_Page/</a>" );
} );


$app->get( '/test[/]', function (Request $request, Response $response) use ( $app ) {
	// This is a fallback; if the server doesn't support
	// AllowEncodedSlashes, this is to enable us to use
	// regular GET parameters in ?url=...&tests=... format
	$params = $request->getQueryParams();
	$url = isset( $params[ 'url' ] ) ? $params[ 'url' ] : null;
	$tests = isset( $params[ 'tests' ] ) ? $params[ 'tests' ] : 'all';

	if ( !$url ) {
		return $response->getBody()->write( 'Missing a URL' );
	}

	return getResponseForTests( $response, $url, $tests );
} );

$app->get( '/test/{url}[/[{tests}]]', function (Request $request, Response $response) {

	// NOTE: If you're using apache server, the directive
	// "AllowEncodedSlashes On" must be enabled to this
	// virtual host (this directive is not inherited)
	// see https://httpd.apache.org/docs/2.4/mod/core.html#allowencodedslashes
	$url = $request->getAttribute( 'url' );
	$tests = $request->getAttribute( 'tests' );

	if ( !$url ) {
		// This is a fallback; if the server doesn't support
		// AllowEncodedSlashes, this is to enable us to use
		// regular GET parameters in ?url=...&tests=... format
		$params = $request->getQueryParams();
		$url = isset( $params[ 'url' ] ) ? $params[ 'url' ] : null;
		$tests = isset( $params[ 'tests' ] ) ? $params[ 'tests' ] : 'all';

		if ( !$url ) {
			return $response->getBody()->write( 'Missing parameter' );
		}
	}

	return getResponseForTests( $response, $url, $tests );

} );


$app->run();

function getResponseForTests( &$response, $url, $tests ) {

	$proxy = new RTLWORKS\Proxy();
	$pageContents = $proxy->fetch( $url );
	$contentParser = new RTLWORKS\HTMLParser( $pageContents );
	$cssFiles = $contentParser->getCSSFiles( $proxy->getParsedUrl() );

	$cssContents = array();
	foreach ( $cssFiles as $file ) {
		$cssContents[ $file ] = $proxy->fetch( $file );
	}

	$twigLoader = new Twig_Loader_Filesystem( __DIR__ . '/templates');
	$twig = new Twig_Environment( $twigLoader, array(
	    'cache' => __DIR__ . '/cache',
	) );

	$testSuite = new RTLWORKS\TestSuite( $twig, $url, $contentParser, $cssContents );

	$testSuite->runTests( explode( ',', $tests ) );

	$result = $testSuite->getAnalysisResult();

	return $response
		->withHeader( 'Content-type', 'application/json' )
		->withJson( $result );
}
