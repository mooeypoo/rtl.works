/*!
 * Grunt file
 *
 * @package TemplateData
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-csslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	// grunt.loadNpmTasks( 'grunt-cssjanus' );
	// grunt.loadNpmTasks( 'grunt-banana-checker' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: {
				jshintrc: true
			},
			files: {
				src: [
					'src/js/rtlworks.js',
					'src/js/rtlworks.util.js',
					'src/js/rtlworks.network.js',
					'src/js/rtlworks.init.js'
				]
			}
		},
		jscs: {
			src: '<%= jshint.files.src %>'
		},
		less: {
			site: {
				files: {
					'assets/rtl.works.css': 'src/less/rtl.works.less'
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			site: [
				'assets/rtl.works.css'
			]
		},
		// cssjanus: {
		// 	options: {
		// 		generateExactDuplicates: true
		// 	},
		// 	site: {
		// 		files: {
		// 			'assets/rtl.works.rtl.css': 'assets/rtl.works.css'
		// 		}
		// 	}
		// },
		// banana: {
		// 	all: 'i18n/'
		// },
		concat: {
			files: {
				src: '<%= jshint.files.src %>',
				dest: 'assets/rtl.works.js'
			}
		}
	} );

	grunt.registerTask( 'default', [ 'lint', 'build' ] );
	grunt.registerTask( 'lint', [ 'csslint', 'jshint', 'jscs' ] );
	grunt.registerTask( 'build', [ 'less', 'concat' ] );
};
