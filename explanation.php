<?php
$currentPage = 'explanation';
include_once 'html_parts/page_head.php'
?>
<div class="inner cover">
	<h1 class="cover-heading">Does my site support Right to Left?</h1>
	<p>Probably not. Not to judge you, specifically, of course - but that's just the reality of the web. Most websites don't have proper right-to-left support, and only a few even try. But there are <a href="http://ltr.wtf/">many reasons</a> why you <strong>should</strong> consider right-to-left support, despite <a href="http://ltr.wtf/explained/rtl-support-history/">how challenging it may be.</a></p>
	<p>Testing for real right-to-left and language support is, of course, a lot more complicated than a series of automated tests. The best way to verify that your site supports right-to-left is to let right-to-left users use it and to listen to their inputs.</p>
	<p>The purpose of this analysis tool is not to tell you whether your site is working in right to left (we can't really know) -- it's to point out potential issues you should beware of when designing with internationalization in mind.</p>
	<h1 class="cover-heading">What do you look for?</h1>
	<p>The tests in this tool are trying to identify a couple of areas where right-to-left support may be challenging, or require extra care.</p>
	<ul>
		<li>Searching for the existence of 'dir' attributes in html and body tags</li>
		<li>Searching stylesheets for:
			<ul>
				<li>The existence of direction: style attributes</li>
				<li>The existence of float rules</li>
				<li>The existence of explicit positioning, like 'right' or 'left' values</li>
			</ul>
		</li>
	</ul>
	<p>Think there's a missing test or analysis? <a href="https://github.com/mooeypoo/rtl.works/issues">Please suggest it!</a></p>
	<p><em>COMING SOON is a full explanation about what the tests mean and how they are counted. (Please be patient, it's coming!)</em></p>
<p class="lead">
		<a href="<?php echo $baseurl; ?>" class="btn btn-lg btn-default">Test your site!</a>
	</p>
</div>

<?php
include_once 'html_parts/page_foot.php'
?>
