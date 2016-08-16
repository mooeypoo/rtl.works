<?php

class HTMLParserTest extends PHPUnit_Framework_TestCase {
	protected $sample = [
		'<html>',
		'<head>',
		'<title>Some page title</title>',
		'<link href="path/to/file_one.css" rel="stylesheet">',
		'<link href="path/to/file_two.css" rel="stylesheet">',
		'<link href="path/to/file_three.css" rel="stylesheet">',
		'</head>',
		'<body dir="ltr">',
		'<h1>Title</h1>',
		'<p dir="rtl">Paragraph 1 text</p>',
		'<p dir="ltr">Paragraph 2 text</p>',
		'<p dir="rtl">Paragraph 3 text</p>',
		'<img alt="image alt" title="image title" />',
		'<input type="text" dir="ltr" placeholder="input placeholder"></input>',
		'</body></html>'
	];

	public function testNormalizeUrl () {
		$base_url = [
			'http://rtl.works/',
			'http://rtl.works'
		];
		$urls = [
			[
				'message' => 'Full URL',
				'file' => 'http://some.place.com/file.css',
				'expected' => [
					'http://rtl.works' => 'http://some.place.com/file.css',
				],
			],
			[
				'message' => 'URL starting with /',
				'file' => '/w/somefile.css',
				'expected' => [
					'http://rtl.works' => 'http://rtl.works/w/somefile.css',
					'http://rtl.works/' => 'http://rtl.works/w/somefile.css',
					'http://rtl.works/nested/path/' => 'http://rtl.works/nested/path/w/somefile.css',
				],
			],
			[
				'message' => 'Relative URL',
				'file' => 'assets/somefile.css',
				'expected' => [
					'http://rtl.works' => 'http://rtl.works/assets/somefile.css',
					'http://rtl.works/' => 'http://rtl.works/assets/somefile.css',
					'http://rtl.works/nested/path/' => 'http://rtl.works/nested/path/assets/somefile.css',
				],
			],
		];

		foreach ( $urls as $url ) {
			foreach ( $url[ 'expected' ] as $baseUrl => $expected ) {
				$this->assertEquals(
					$expected,
					RTLWORKS\HTMLParser::normalizeUrl( parse_url( $baseUrl ), $url[ 'file' ] ),
					$url[ 'message' ] . ' - ' . $baseUrl
				);
			}
		}
	}

	public function testDocumentContent () {
		$parser = new RTLWORKS\HTMLParser( implode( $this->sample ) );

		$this->assertEquals(
			'Some page titleTitleParagraph 1 textParagraph 2 textParagraph 3 text',
			$parser->getDocumentContent(),
			'Getting document content only'
		);
	}

	public function testGetAttributeForTags () {
		$parser = new RTLWORKS\HTMLParser( implode( $this->sample ) );

		$this->assertEquals(
			'rtl,ltr,rtl',
			implode( ',', $parser->getAttributeForTags( 'p', 'dir' ) ),
			'Get attribute for tag: <p>, dir'
		);

		$this->assertEquals(
			'ltr',
			implode( ',', $parser->getAttributeForTags( 'body', 'dir' ) ),
			'Get attribute for tag: <body>, dir'
		);

		$this->assertEquals(
			'input placeholder',
			implode( ',', $parser->getAttributeForTags( 'input', 'placeholder' ) ),
			'Get attribute for tag: <input>, placehloder'
		);
	}


}
