/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var fs = require('fs');
  var path = require('path');
  var rimraf = require('rimraf');
  var helpers = require('grunt-lib-contrib').init(grunt);

  grunt.registerMultiTask('compress', 'Compress files.', function() {
    var done = this.async();
    var options = this.options({
      cwd: '',
      mode: null,
      flatten: false,
      level: 1,
      minimatch: {},
      rootDir: false
    });

    if (options.cwd.length > 0) {
      options.minimatch.cwd = options.cwd;
    }

    var supportedModes = ['zip', 'tar', 'tgz', 'gzip'];
    var targetMode = options.mode;
    delete options.mode;

    if (grunt.util.kindOf(options.rootDir) === 'string' && options.rootDir.length >= 1) {
      options.rootDir = path.normalize(options.rootDir).split(path.sep)[0];
    } else {
      options.rootDir = false;
    }

    grunt.verbose.writeflags(options, 'Options');

    var srcFiles = grunt.file.expandFiles(options.minimatch, this.file.srcRaw);
    var destFile = path.normalize(this.file.dest);
    var destDir = path.dirname(destFile);

    if (srcFiles.length === 0) {
      grunt.fail.warn('Unable to compress; no valid source files were found.');
    }

    var mode = targetMode || autoDetectMode(destFile);

    if (grunt.util._.include(supportedModes, mode) === false) {
      grunt.fail.warn('Mode ' + mode.cyan + ' not supported.');
    }

    if (mode === 'gzip') {
      if (srcFiles.length > 1) {
        grunt.fail.warn('Cannot specify multiple input files for gzip compression.');
      }

      srcFiles = srcFiles[0].toString();
    }

    if (grunt.file.exists(destDir) === false) {
      grunt.file.mkdir(destDir);
    }

    methods[mode](srcFiles, destFile, options, function(err, written) {
      grunt.log.writeln('File ' + destFile + ' created (' + written + ' bytes written).');
      done();
    });
  });

  var getSize = function(filename) {
    try {
      return fs.statSync(filename).size;
    } catch (e) {
      return 0;
    }
  };

  var autoDetectMode = function(dest) {
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

  var tarCopy = function(srcFiles, tempDir, options) {
    var newFiles = [];
    var newMeta = {};

    var srcFile;
    var destFile;

    var fileName;
    var filePath;

    srcFiles.forEach(function(file) {
      fileName = path.basename(file);
      filePath = path.dirname(file);

      srcFile = path.join(options.cwd, file);

      if (options.flatten) {
        destFile = path.join(tempDir, fileName);
      } else {
        destFile = path.join(tempDir, filePath, fileName);
      }

      newFiles.push(destFile);
      newMeta[destFile] = {name: file};

      grunt.verbose.writeln('Adding ' + srcFile + ' to temporary structure.');
      grunt.file.copy(srcFile, destFile);
    });

    return [newFiles, newMeta];
  };

  var methods = {
    zip: function(srcFiles, dest, options, callback) {
      var zip = require('archiver').createZip(options);

      var destDir = path.dirname(dest);

      zip.pipe(fs.createWriteStream(dest));

      zip.on('error', function(e) {
        grunt.log.error(e);
        grunt.fail.warn('zipHelper failed.');
      });

      var destFile;
      var srcFile;

      var fileName;
      var filePath;
      var fileMeta;

      grunt.util.async.forEachSeries(srcFiles, function(file, next) {
        fileName = path.basename(file);
        filePath = path.dirname(file);

        srcFile = path.join(options.cwd, file);

        if (options.flatten) {
          destFile = fileName;
        } else {
          destFile = path.join(filePath, fileName);
        }

        if (options.rootDir && options.rootDir.length >= 1) {
          destFile = path.join(options.rootDir, destFile);
        }

        fileMeta = {
          name: destFile
        };

        zip.addFile(fs.createReadStream(srcFile), fileMeta, function() {
          next();
        });
      }, function(err) {
        zip.finalize(function(written) {
          callback(null, written);
        });
      });
    },

    tar: function(srcFiles, dest, options, callback, gzip) {
      var fstream = require('fstream');
      var tar = require('tar');
      var zlib = require('zlib');

      var destDir = path.dirname(dest);
      var destFile = path.basename(dest);
      var destFileExt = path.extname(destFile);
      var destFileName = path.basename(dest, destFileExt);

      var tempDir = path.join(destDir, 'tar_' + (new Date()).getTime());
      var tarDir;

      if (options.rootDir && options.rootDir.length >= 1) {
        tarDir = options.rootDir;
        options.rootDir = false;
      } else {
        tarDir = destFileName;
      }

      if (gzip === true) {
        tarDir = tarDir.replace('.tar', '');
      }

      var tarProcess;

      tarDir = path.join(tempDir, tarDir);

      tarCopy(srcFiles, tarDir, options);

      var reader = fstream.Reader({path: tarDir, type: 'Directory'});
      var packer = tar.Pack();
      var gzipper = zlib.createGzip();
      var writer = fstream.Writer(dest);

      if (gzip === true) {
        tarProcess = reader.pipe(packer).pipe(gzipper).pipe(writer);
      } else {
        tarProcess = reader.pipe(packer).pipe(writer);
      }

      tarProcess.on('error', function(e) {
        grunt.log.error(e);
        grunt.fail.warn('tarHelper failed.');
      });

      tarProcess.on('close', function() {
        rimraf.sync(tempDir);
        callback(null, getSize(dest));
      });
    },

    tgz: function(srcFiles, dest, options, callback) {
      methods.tar(srcFiles, dest, options, callback, true);
    },

    gzip: function(file, dest, options, callback) {
      var zlib = require('zlib');

      var srcFile = path.join(options.cwd, file);

      zlib.gzip(grunt.file.read(srcFile), function(e, result) {
        if (!e) {
          grunt.file.write(dest, result);
          callback(null, result.length);
        } else {
          grunt.log.error(e);
          grunt.fail.warn('gzipHelper failed.');
        }
      });
    }
  };
};
