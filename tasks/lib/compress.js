/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var prettySize = require('prettysize');
var zlib = require('zlib');
var archiver = require('archiver');

module.exports = function(grunt) {

  var exports = {
    options: {}
  };

  // 1 to 1 gziping of files
  exports.gzip = function(files, done) {
    grunt.util.async.forEachSeries(files, function(file, next) {
      var src = file.src.filter(function(f) {
        return grunt.file.isFile(f);
      }).map(function(f) {
        return grunt.file.read(f);
      }).join('');
      if (src.length < 1) { return next(); }

      // Append ext if the specified one isnt there
      var ext = file.orig.ext || '.gz';
      if (String(file.dest).slice(-ext.length) !== ext) {
        file.dest += ext;
      }

      // Ensure the dest folder exists
      grunt.file.mkdir(path.dirname(file.dest));

      var destStream = fs.createWriteStream(file.dest);
      var gzipper = zlib.createGzip(exports.options);

      gzipper.on('error', function(err) {
        grunt.log.error(err);
        grunt.fail.warn('Gziping failed.');
        next();
      });

      destStream.on('close', function() {
        grunt.log.writeln('Created ' + String(file.dest).cyan + ' (' + exports.getSize(file.dest) + ')');
        next();
      });

      gzipper.pipe(destStream);
      gzipper.write(src);
      gzipper.end();
    }, done);
  };

  // Compress with tar, tgz and zip
  exports.tar = function(files, done) {
    if (typeof exports.options.archive !== 'string' || exports.options.archive.length === 0) {
      grunt.fail.warn('Unable to compress; no valid archive file was specified.');
    }

    var mode = exports.options.mode;
    var shouldGzip = false;
    if (mode === 'tgz') {
      shouldGzip = true;
      mode = 'tar';
    }

    var archive = archiver.create(mode, exports.options);
    var dest = exports.options.archive;

    // Ensure dest folder exists
    grunt.file.mkdir(path.dirname(dest));

    archive.on('error', function(err) {
      grunt.log.error(err);
      grunt.fail.warn('Archiving failed.');
    });

    // Where to write the file
    var destStream = fs.createWriteStream(dest);
    if (shouldGzip) {
      var gzipper = zlib.createGzip(exports.options);

      gzipper.on('error', function(err) {
        grunt.log.error(err);
        grunt.fail.warn('Gziping failed.');
      });

      gzipper.on('end', function() {
        grunt.log.writeln('Created ' + String(dest).cyan + ' (' + exports.getSize(dest) + ')');
        done();
      });

      archive.pipe(gzipper).pipe(destStream);
    } else {
      archive.pipe(destStream);
    }

    files.forEach(function(file) {
      var isExpandedPair = file.orig.expand || false;
      var src = file.src.filter(function(f) {
        return grunt.file.isFile(f);
      });

      src.forEach(function(srcFile) {
        var internalFileName = (isExpandedPair) ? file.dest : exports.unixifyPath(path.join(file.dest || '', srcFile));

        archive.append(fs.createReadStream(srcFile), { name: internalFileName }, function(err) {
          grunt.verbose.writeln('Archiving ' + srcFile.cyan + ' -> ' + String(dest).cyan + '/'.cyan + internalFileName.cyan);
        });
      });
    });

    archive.finalize(function(err, written) {
      if (shouldGzip === false) {
        grunt.log.writeln('Created ' + String(dest).cyan + ' (' + exports.getSize(Number(written)) + ')');
        done();
      }
    });
  };

  exports.getSize = function(filename, pretty) {
    var size = 0;
    if (typeof filename === 'string') {
      try {
        size = fs.statSync(filename).size;
      } catch (e) {}
    } else {
      size = filename;
    }
    if (pretty !== false) {
      if (!exports.options.pretty) {
        return size + ' bytes';
      }
      return prettySize(size);
    }
    return Number(size);
  };

  exports.autoDetectMode = function(dest) {
    if (exports.options.mode) {
      return exports.options.mode;
    }
    if (!dest) {
      return 'gzip';
    }
    if (grunt.util._.endsWith(dest, '.tar.gz')) {
      return 'tgz';
    }
    var ext = path.extname(dest).replace('.', '');
    if (ext === 'gz') {
      return 'gzip';
    } else {
      return ext;
    }
  };

  exports.unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };

  return exports;
};