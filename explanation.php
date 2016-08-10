<?php
$currentPage = 'explanation';

include 'bootstrap.php';

$menuItems[ $currentPage ][ 'active' ] = true;

echo $twig->render( 'explanation.html', array(
	"baseurl" => $baseurl,
	"menu" => $menuItems,
) );
