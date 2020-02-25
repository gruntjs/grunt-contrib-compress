/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var _ = require('lodash');
  var compress = require('./lib/compress')(grunt);

  grunt.registerMultiTask('compress', 'Compress files.', function() {
    compress.options = this.options({
      archive: null,
      mode: null,
      createEmptyArchive: true,
      level: 1
    });

    if (compress.options.createEmptyArchive === false && this.files.length === 0) {
      grunt.log.ok('No files found. Archive won\'t be created ("createEmptyArchive" option is set to true)');
      return;
    }

    if (typeof compress.options.archive === 'function') {
      compress.options.archive = compress.options.archive();
    }

    compress.options.mode = compress.options.mode || compress.autoDetectMode(compress.options.archive);

    if (_.includes(['zip', 'tar', 'tgz', 'gzip', 'deflate', 'deflateRaw', 'brotli'], compress.options.mode) === false) {
      grunt.fail.warn('Mode ' + String(compress.options.mode) + ' not supported.');
    }

    if (/gzip|brotli/.test(compress.options.mode) || compress.options.mode.slice(0, 7) === 'deflate') {
      compress[compress.options.mode](this.files, this.async());
    } else {
      compress.tar(this.files, this.async());
    }
  });
};
