<?php

$currentPage = 'test';

include 'bootstrap.php';

$menuItems[ $currentPage ][ 'active' ] = true;

echo $twig->render( 'test.html', array(
	"baseurl" => $baseurl,
	"menu" => $menuItems,
	"scripts" => array( 'assets/rtl.works.js' ),
) );
