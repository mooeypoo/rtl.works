<?php

class LanguageDetectorTest extends PHPUnit_Framework_TestCase {
	protected $dirs = [ 'rtl', 'ltr' ];
	protected $tests = [
		[
			'message' => 'LTR only',
			'text' => 'abc',
			'expected_count' => [
				'ltr' => 3,
				'rtl' => 0,
			],
			'expected_exist' => [
				'ltr' => true,
				'rtl' => false,
			],
		],
		[
			'message' => 'Arabic only',
			'text' => 'غ',
			'expected_count' => [
				'ltr' => 0,
				'rtl' => 1,
			],
			'expected_exist' => [
				'ltr' => false,
				'rtl' => true,
			],
		],
		[
			'message' => 'Hebrew only',
			'text' => 'שלום',
			'expected_count' => [
				'ltr' => 0,
				'rtl' => 4,
			],
			'expected_exist' => [
				'ltr' => false,
				'rtl' => true,
			],
		],
		[
			'message' => 'Mixed characters',
			'text' => 'helloשלום',
			'expected_count' => [
				'ltr' => 5,
				'rtl' => 4,
			],
			'expected_exist' => [
				'ltr' => true,
				'rtl' => true,
			],
		],
		[
			'message' => 'Mixed characters and spaces',
			'text' => ' hello שלום ',
			'expected_count' => [
				'ltr' => 5,
				'rtl' => 4,
			],
			'expected_exist' => [
				'ltr' => true,
				'rtl' => true,
			],
		],
		[
			'message' => 'Mixed characters and punctuation',
			'text' => ' hello, שלום!',
			'expected_count' => [
				'ltr' => 5,
				'rtl' => 4,
			],
			'expected_exist' => [
				'ltr' => true,
				'rtl' => true,
			],
		],
		[
			'message' => 'Mixed characters with mixed word boundaries',
			'text' => ' hello, שלום eغnغgغlغiغsغh!,;foo',
			'expected_count' => [
				'ltr' => 15,
				'rtl' => 10,
			],
			'expected_exist' => [
				'ltr' => true,
				'rtl' => true,
			],
		],
	];

	public function testDirGroupsCount() {
		$this->runTests( 'count' );
	}

	public function testDirGroupsExist() {
		$this->runTests( 'exist' );
	}

	protected function runTests( $testType ) {
		foreach ( $this->tests as $test ) {
			$result = RTLWORKS\LanguageDetector::DirGroupsExist( $test[ 'text' ] );
			foreach ( $this->dirs as $dir ) {
				$this->assertEquals(
					$test[ 'expected_' . $testType ][ $dir ],
					$result[ $dir ],
					$test[ 'message' ] . ' (' . $dir . ' '. $testType .')'
				);
			}
		}
	}
}
