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

  var fileStatSync = function() {
    var filepath = path.join.apply(path, arguments);

    if (grunt.file.exists(filepath)) {
      return fs.statSync(filepath);
    }

    return false;
  };

  // 1 to 1 gziping of files
  exports.gzip = function(files, done) {
    exports.singleFile(files, zlib.createGzip, 'gz', done);
  };

  // 1 to 1 deflate of files
  exports.deflate = function(files, done) {
    exports.singleFile(files, zlib.createDeflate, 'deflate', done);
  };

  // 1 to 1 deflateRaw of files
  exports.deflateRaw = function(files, done) {
    exports.singleFile(files, zlib.createDeflateRaw, 'deflate', done);
  };

  // 1 to 1 compression of files, expects a compatible zlib method to be passed in, see above
  exports.singleFile = function(files, algorithm, extension, done) {
    grunt.util.async.forEachSeries(files, function(filePair, nextPair) {
      grunt.util.async.forEachSeries(filePair.src, function(src, nextFile) {
        // Must be a file
        if (grunt.file.isDir(src)) {
          return nextFile();
        }

        // Ensure the dest folder exists
        grunt.file.mkdir(path.dirname(filePair.dest));

        // Move the src to a temp file in case that the dest is the same file to avoid a corrupt file
        if(src === filePair.dest){
            fs.rename(src,src + ".temp");
            src = src + ".temp";
            var deleteSrc = true;
        }

        var srcStream = fs.createReadStream(src);
        var destStream = fs.createWriteStream(filePair.dest);
        var compressor = algorithm.call(zlib, exports.options);

        compressor.on('error', function(err) {
          grunt.log.error(err);
          grunt.fail.warn(algorithm + ' failed.');
          nextFile();
        });

        destStream.on('close', function() {
          if(deleteSrc){
              fs.unlink(src);
          }
          grunt.log.writeln('Created ' + String(filePair.dest).cyan + ' (' + exports.getSize(filePair.dest) + ')');
          nextFile();
        });

        srcStream.pipe(compressor).pipe(destStream);
      }, nextPair);
    }, done);
  };

  // Compress with tar, tgz and zip
  exports.tar = function(files, done) {
    if (typeof exports.options.archive !== 'string' || exports.options.archive.length === 0) {
      grunt.fail.warn('Unable to compress; no valid archive file was specified.');
    }

    var mode = exports.options.mode;
    if (mode === 'tgz') {
      mode = 'tar';
      exports.options.gzip = true;
    }

    var archive = archiver.create(mode, exports.options);
    var dest = exports.options.archive;

    var dataWhitelist = ['comment', 'date', 'mode', 'store'];
    var sourcePaths = {};

    // Ensure dest folder exists
    grunt.file.mkdir(path.dirname(dest));

    // Where to write the file
    var destStream = fs.createWriteStream(dest);

    archive.on('error', function(err) {
      grunt.log.error(err);
      grunt.fail.warn('Archiving failed.');
    });

    archive.on('entry', function(file) {
      var sp = sourcePaths[file.name] || 'unknown';
      grunt.verbose.writeln('Archived ' + sp.cyan + ' -> ' + String(dest).cyan + '/'.cyan + file.name.cyan);
    });

    destStream.on('error', function(err) {
      grunt.log.error(err);
      grunt.fail.warn('WriteStream failed.');
    });

    destStream.on('close', function() {
      var size = archive.pointer();
      grunt.log.writeln('Created ' + String(dest).cyan + ' (' + exports.getSize(size) + ')');
      done();
    });

    archive.pipe(destStream);

    files.forEach(function(file) {
      var isExpandedPair = file.orig.expand || false;

      file.src.forEach(function(srcFile) {
        var fstat = fileStatSync(srcFile);

        if (!fstat) {
          grunt.fail.fatal('unable to stat srcFile (' + srcFile + ')');
        }

        var internalFileName = (isExpandedPair) ? file.dest : exports.unixifyPath(path.join(file.dest || '', srcFile));

        if (fstat.isDirectory() && internalFileName.slice(-1) !== '/') {
          srcFile += '/';
          internalFileName += '/';
        }

        var fileData = {
          name: internalFileName
        };

        for (var i = 0; i < dataWhitelist.length; i++) {
          if (typeof file[dataWhitelist[i]] === 'undefined') {
            continue;
          }

          if (typeof file[dataWhitelist[i]] === 'function') {
            fileData[dataWhitelist[i]] = file[dataWhitelist[i]](srcFile);
          } else {
            fileData[dataWhitelist[i]] = file[dataWhitelist[i]];
          }
        }

        if (fstat.isFile()) {
          archive.file(srcFile, fileData);
        } else if (fstat.isDirectory()) {
          archive.append(null, fileData);
        } else {
          grunt.fail.warn('srcFile (' + srcFile + ') should be a valid file or directory');
        }

        sourcePaths[internalFileName] = srcFile;
      });
    });

    archive.finalize();
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
