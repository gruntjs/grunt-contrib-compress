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
  var iltorb;

  try {
    iltorb = require('iltorb');
  } catch (er) {
    iltorb = null;
  }

  grunt.registerMultiTask('compress', 'Compress files.', function() {
    compress.options = this.options({
      archive: null,
      mode: null,
      level: 1
    });

    if (typeof compress.options.archive === 'function') {
      compress.options.archive = compress.options.archive();
    }

    compress.options.mode = compress.options.mode || compress.autoDetectMode(compress.options.archive);

    if (compress.options.mode.match('brotli') && !iltorb) {
        grunt.fail.fatal('iltorb dependency wasn\'t found; in order to use brotli, ' +
                          'make sure you have a supported C++ compiler available and run `npm install` again.');
    }

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
