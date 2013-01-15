/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

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

    test_vars: {
      name: 'grunt-contrib-compress',
      version: '0.1.0'
    },

    files: {
      compress_test: 'folder_one'
    },

    // Configuration to be run (and then tested).
    compress: {
      mainZip: {
        options: {
          archive: 'tmp/compress_test_files.zip'
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['*']}
        ]
      },
      mainTar: {
        options: {
          archive: 'tmp/compress_test_files.tar'
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['*']}
        ]
      },
      mainTarGz: {
        options: {
          archive: 'tmp/compress_test_files.tgz'
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['*']}
        ]
      },
      mainGz: {
        options: {
          archive: 'tmp/compress_test_file.js.gz'
        },
        src: ['test/fixtures/test.js']
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
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'compress', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);

};