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
var chalk = require('chalk');
var zlib = require('zlib');
var archiver = require('archiver');
var compressjs = require('compressjs');

module.exports = function(grunt) {

  var exports = {
    options: {}
  };

  var pageSize = 4096;
  var outStream = function(filePath) {
    var outFd = fs.openSync(filePath, 'w');
    var stream = new compressjs.Stream();
    stream.buffer = new Buffer(pageSize);
    stream.pos = 0;
    stream.flush = function() {
        fs.writeSync(outFd, this.buffer, 0, this.pos);
        this.pos = 0;
    };
      stream.writeByte = function(_byte) {
          if (this.pos >= this.buffer.length) { this.flush(); }
          this.buffer[this.pos++] = _byte;
      };
      stream.buffer.fill(0);
      return {"stream": stream, "fd": outFd};
  };

  var inStream = function(filePath) {
    var inFd = fs.openSync(filePath, 'r');
    var stream = new compressjs.Stream();
    var stat = fs.fstatSync(inFd);
    if (stat.size) {
        stream.size = stat.size;
    }
    stream.buffer = new Buffer(pageSize);
    stream.filePos = null;
    stream.pos = 0;
    stream.end = 0;
    stream._fillBuffer = function() {
        this.end = fs.readSync(inFd, this.buffer, 0, this.buffer.length,
                               this.filePos);
        this.pos = 0;
        if (this.filePos !== null && this.end > 0) {
            this.filePos += this.end;
        }
    };
    stream.readByte = function() {
        if (this.pos >= this.end) { this._fillBuffer(); }
        if (this.pos < this.end) {
            return this.buffer[this.pos++];
        }
        return -1;
    };
    stream.read = function(buffer, bufOffset, length) {
        if (this.pos >= this.end) { this._fillBuffer(); }
        var bytesRead = 0;
        while (bytesRead < length && this.pos < this.end) {
            buffer[bufOffset++] = this.buffer[this.pos++];
            bytesRead++;
        }
        return bytesRead;
    };
    stream.seek = function(seek_pos) {
        this.filePos = seek_pos;
        this.pos = this.end = 0;
    };
    stream.eof = function() {
        if (this.pos >= this.end) { this._fillBuffer(); }
        return (this.pos >= this.end);
    };
    stream.buffer.fill(0);
    return {"stream": stream, "fd": inFd};
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

  exports.bz2 = function(files, done) {
    exports.singleFile(files, compressjs.Bzip2.compressFile, done);
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

        var toUseCmpJs = (grunt.util._.include(['gz', 'deflate'], extension) === false)

        var srcStream = (toUseCmpJs) ? inStream(src) : fs.createReadStream(src);
        var destStream = (toUseCmpJs) ? outStream(filePair.dest) : fs.createWriteStream(filePair.dest);

        if (!toUseCmpJs) {
          var compressor = algorithm.call(zlib, exports.options);
          compressor.on('error', function(err) {
            grunt.log.error(err);
            grunt.fail.warn(algorithm + ' failed.');
            nextFile();
          });

          destStream.on('close', function() {
            grunt.log.writeln('Created ' + chalk.cyan(filePair.dest) + ' (' + exports.getSize(filePair.dest) + ')');
            nextFile();
          });

          srcStream.pipe(compressor).pipe(destStream);
        } else {
          var level = (exports.options.level !== null) ? exports.options.level : 1;
          compressjs.Bzip2.compressFile(srcStream['stream'], destStream['stream'], level);
          srcStream['stream'].flush();
          fs.closeSync(srcStream['fd']);
          fs.closeSync(destStream['fd']);
        }
      }, nextPair);
    }, done);
  };

  // Compress with tar, tgz and zip
  exports.tar = function(files, done) {
    if (typeof exports.options.archive !== 'string' || exports.options.archive.length === 0) {
      grunt.fail.warn('Unable to compress; no valid archive file was specified.');
      return;
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
      grunt.verbose.writeln('Archived ' + chalk.cyan(sp) + ' -> ' + chalk.cyan(dest + '/' + file.name));
    });

    destStream.on('error', function(err) {
      grunt.log.error(err);
      grunt.fail.warn('WriteStream failed.');
    });

    destStream.on('close', function() {
      var size = archive.pointer();
      grunt.log.writeln('Created ' + chalk.cyan(dest) + ' (' + exports.getSize(size) + ')');
      done();
    });

    archive.pipe(destStream);

    files.forEach(function(file) {
      var isExpandedPair = file.orig.expand || false;

      file.src.forEach(function(srcFile) {
        var fstat = fileStatSync(srcFile);

        if (!fstat) {
          grunt.fail.warn('unable to stat srcFile (' + srcFile + ')');
          return;
        }

        var internalFileName = (isExpandedPair) ? file.dest : exports.unixifyPath(path.join(file.dest || '', srcFile));

        // check if internal file name is not a dot, should not be present in an archive
        if (internalFileName === '.') {
          return;
        }

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
          return;
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
