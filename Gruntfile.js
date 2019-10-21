/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      test: ['tmp']
    },

    copy: {
      gzipSrcEqualDest: {
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: '**/*.js',
          dest: 'tmp/gzipSrcEqualDest'
        }]
      },
      brotliSrcEqualDest: {
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: '**/*.js',
          dest: 'tmp/brotliSrcEqualDest'
        }]
      }
    },

    // Configuration to be run (and then tested).
    compress: {
      zip: {
        options: {
          archive: function () {
            return 'tmp/compress_test_files.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['**/*']
        }]
      },
      zipWithFolders: {
        options: {
          archive: 'tmp/compress_test_folder.zip'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['**'],
          dest: './'
        }]
      },
      zipCreateEmptyArchiveTrue: {
        options: {
          createEmptyArchive: true,
          archive: function () {
            return 'tmp/zip_must_be_created_1.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['NotExistentFilePath.js']
        }]
      },
      zipCreateEmptyArchiveFalse: {
        options: {
          createEmptyArchive: false,
          archive: function () {
            return 'tmp/zip_should_not_be_created.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['NotExistentFilePath.js']
        }]
      },
      zipNoCreateEmptyArchiveOption: {
        options: {
          archive: function () {
            return 'tmp/zip_must_be_created_2.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/',
          src: ['NotExistentFilePath.js']
        }]
      },
      tar: {
        options: {
          archive: 'tmp/compress_test_files.tar'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['**/*']
        }]
      },
      tgz: {
        options: {
          archive: 'tmp/compress_test_files.tgz'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['**/*']
        }]
      },
      gzipCustomExt: {
        options: {
          mode: 'gzip'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['**/*.js'],
          dest: 'tmp/gzipCustomExt/',
          ext: '.gz.js'
        }]
      },
      gzipSrcEqualDest: {
        options: {
          mode: 'gzip'
        },
        files: [{
          expand: true,
          cwd: 'tmp/gzipSrcEqualDest',
          src: ['**/*.js'],
          dest: 'tmp/gzipSrcEqualDest/',
          ext: '.js'
        }]
      },
      gzip: {
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*.{css,html,js}'],
        dest: 'tmp/gzip/',
        options: {
          mode: 'gzip'
        }
      },
      deflate: {
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*.{css,html,js}'],
        dest: 'tmp/deflate/',
        options: {
          mode: 'deflate'
        }
      },
      deflateRaw: {
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*.{css,html,js}'],
        dest: 'tmp/deflateRaw/',
        options: {
          mode: 'deflateRaw'
        }
      },
      gzipWithFolders: {
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*'],
        dest: 'tmp/gzip/',
        options: {
          mode: 'gzip'
        }
      },
      brotli: {
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*.{css,html,js}'],
        dest: 'tmp/brotli/',
        options: {
          mode: 'brotli',
          pretty: true
        }
      },
      brotliCustomExt: {
        options: {
          mode: 'brotli',
          brotli: {
            mode: 0,
            quality: 11,
            lgwin: 22,
            lgblock: 0
          }
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['**/*.js'],
          dest: 'tmp/brotliCustomExt/',
          ext: '.br.js'
        }]
      },
      brotliSrcEqualDest: {
        options: {
          mode: 'brotli',
          brotli: {
            mode: 0,
            quality: 11,
            lgwin: 22,
            lgblock: 0
          }
        },
        files: [{
          expand: true,
          cwd: 'tmp/brotliSrcEqualDest',
          src: ['**/*.js'],
          dest: 'tmp/brotliSrcEqualDest/',
          ext: '.js'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['jshint', 'clean', 'copy', 'compress', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test', 'contrib-ci:skipIfExists', 'build-contrib']);

};
