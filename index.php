<?php

$currentPage = 'test';

include 'bootstrap.php';

$menuItems[ $currentPage ][ 'active' ] = true;

$requested_url = isset( $_GET[ 'url' ] ) ? $_GET[ 'url' ] : '';

echo $twig->render( 'test.html', array(
	'baseurl' => $baseurl,
	'requested_url' => $requested_url,
	'menu' => $menuItems,
) );
