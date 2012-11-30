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
      main: {
        options: {
          cwd: 'test/fixtures'
        },
        files: {
          'tmp/compress_test_files.zip': ['*'],
          'tmp/compress_test_v<%= test_vars.version %>.zip': ['**'],
          'tmp/compress_test_files_template.zip': ['<%= files.compress_test %>/**'],

          'tmp/compress_test_files.tar': ['*'],
          'tmp/compress_test_v<%= test_vars.version %>.tar': ['**'],
          'tmp/compress_test_files_template.tar': ['<%= files.compress_test %>/**'],

          'tmp/compress_test_files.tgz': ['*'],
          'tmp/compress_test_v<%= test_vars.version %>.tgz': ['**'],
          'tmp/compress_test_files_template.tgz': ['<%= files.compress_test %>/**'],

          'tmp/compress_test_file.gz': ['test.js'],
          'tmp/compress_test_file2.gz': ['folder_one/one.js']
        }
      },

      flatten: {
        options: {
          cwd: 'test/fixtures',
          flatten: true
        },
        files: {
          'tmp/compress_test_flatten.zip': ['**'],
          'tmp/compress_test_flatten.tar': ['**'],
          'tmp/compress_test_flatten.tgz': ['**']
        }
      },

      rootdir: {
        options: {
          cwd: 'test/fixtures',
          rootDir: 'abc123'
        },
        files: {
          'tmp/compress_test_rootdir.zip': ['**'],
          'tmp/compress_test_rootdir.tar': ['**'],
          'tmp/compress_test_rootdir.tgz': ['**']
        }
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