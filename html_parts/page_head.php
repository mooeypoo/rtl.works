<?php
$baseurl =$currentPage === 'test' ? $_SERVER['REQUEST_URI'] : dirname( $_SERVER['REQUEST_URI'] );
if ( strpos( $baseurl, '/' ) !== strlen( $baseurl ) - 1 ) {
	// HACK: Add trailing slash only if one doesn't exist.
	$baseurl .= '/';
}

$menuItems = array(
	'test' => array(
		'url' => $baseurl,
		'label' => 'Test!'
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
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<meta name="description" content="">
		<meta name="author" content="">
		<link rel="icon" href="../../favicon.ico">

		<title>rtl.works > Analyze your website's RTL support</title>

		<!-- Bootstrap core CSS -->
		<link href="assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">

		<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
		<link href="assets/bootstrap/css/ie10-viewport-bug-workaround.css" rel="stylesheet">

		<!-- Custom styles for the bootstrap template -->
		<link href="assets/bootstrap.cover.css" rel="stylesheet">

		<!-- Custom styles for rtl.works -->
		<!-- TODO: Directionality support will happen here... yes, this site should be RTL compatible... -->
		<link href="assets/rtl.works.css" rel="stylesheet">

		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->
		<script type='text/javascript'>
			// HACK: Leak the baseurl so the JS can use it
			var RTLWORKS_BASE_URL = '<?php echo $baseurl; ?>';
		</script>
	</head>

	<body dir="ltr">
		<div class="site-wrapper">

			<div class="site-wrapper-inner">

				<div class="cover-container">

					<div class="masthead clearfix">
						<div class="inner">
							<h3 class="masthead-brand">RTL.works</h3>
							<nav>
								<ul class="nav masthead-nav">
<?php
	foreach ( $menuItems as $item => $data ) {
		$class = $item === $currentPage ? ' class="active"' : '';
		echo '<li ' . $class . '><a href="' . $data[ 'url' ] . '">' . $data[ 'label' ] . '</a></li>';
	}
?>
								</ul>
							</nav>
						</div>
					</div>
