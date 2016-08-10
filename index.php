<?php
$currentPage = 'test';
$scripts[] = 'assets/rtl.works.js';
include_once 'html_parts/page_head.php'
?>
	<div class="inner cover">
		<h1 class="cover-heading">Does my site work with Right-to-Left?<a href="explanation.php">*</a></h1>
		<p></p>
		<p class="lead centered">

		<!-- FORM -->
		<div class="input-group">
			<input type="text" id="rtlworks-url-input" class="form-control" placeholder="Website...">
			<span class="input-group-btn">
				<button id="rtlworks-analyze-button" class="btn btn-primary" type="button">Analyze!</button>
			</span>
		</div><!-- /input-group -->
		<!-- /FORM -->
		</p>

		<div id="rtlworks-loading"></div>
		<div id="rtlworks-result"></div>
	</div>
<?php
include_once 'html_parts/page_foot.php'
?>
