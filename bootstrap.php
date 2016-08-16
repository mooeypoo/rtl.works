<?php

include 'vendor/autoload.php';

$twigLoader = new Twig_Loader_Filesystem( __DIR__ . '/templates');
$twig = new Twig_Environment( $twigLoader, array(
    'cache' => __DIR__ . '/cache',
) );

$baseurl = '';
if ( isset( $_SERVER['REQUEST_URI'] ) ) {
	$baseurl = isset( $currentPage ) && $currentPage === 'test' ?
		$_SERVER['REQUEST_URI'] : dirname( $_SERVER['REQUEST_URI'] );
}

if ( strpos( $baseurl, '/' ) !== strlen( $baseurl ) - 1 ) {
	// HACK: Add trailing slash only if one doesn't exist.
	$baseurl .= '/';
}

$menuItems = array(
	'test' => array(
		'url' => $baseurl,
		'label' => 'Analyze!'
	),
	'explanation' => array(
		'url' => 'explanation.php',
		'label' => 'Explanation',
	),
	'rtl.wtf' => array(
		'url' => 'http://rtl.wtf',
		'label' => 'rtl.wtf'
	)
);
