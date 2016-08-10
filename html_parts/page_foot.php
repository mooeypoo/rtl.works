
<div class="mastfoot">
	<div class="inner">
		<p>Another <a href="http://rtl.wtf">rtl.wtf</a> product by <a href="http://moriel.smarterthanthat.com">Moriel Schottlender</a>. <a href="http://github.com/mooeypoo/rtl.works">Pull requests welcome!</a> | Loading animation from <a href="http://loading.io/">loading.io</a> | Cover template for <a href="http://getbootstrap.com">Bootstrap</a>, by <a href="https://twitter.com/mdo">@mdo</a>.</p>
	</div>
</div>
				</div>

			</div>

		</div>

		<!-- Bootstrap core JavaScript
		================================================== -->
		<!-- Placed at the end of the document so the pages load faster -->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="../../assets/js/vendor/jquery.min.js"><\/script>')</script>
		<script src="assets/bootstrap/js/bootstrap.min.js"></script>
		<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
		<script src="assets/bootstrap/js/ie10-viewport-bug-workaround.js"></script>
<?php
	if ( isset( $scripts ) && count( $scripts ) > 0 ) {
		foreach ( $scripts as $script ) {
			echo '<script src="' . $script . '"></script>';
		}
	}
?>
	</body>
</html>
