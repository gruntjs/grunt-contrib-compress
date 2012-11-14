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
      mode: null,
      basePath: false,
      flatten: false,
      level: 1,
      rootDir: false
    });

    var supportedModes = ['zip', 'tar', 'tgz', 'gzip'];
    var targetMode = options.mode;
    delete options.mode;

    if (grunt.util.kindOf(options.rootDir) === 'string' && options.rootDir.length >= 1) {
      options.rootDir = path.normalize(options.rootDir).split(path.sep)[0];
    } else {
      options.rootDir = false;
    }

    grunt.verbose.writeflags(options, 'Options');

    var srcFiles = grunt.file.expandFiles(this.file.src);
    var destFile = path.normalize(this.file.dest);
    var destDir = path.dirname(destFile);

    if (srcFiles.length === 0) {
      grunt.fail.warn('Unable to compress; no valid source files were found.');
    }

    var mode = targetMode || autoDetectMode(destFile);

    if (grunt.util._.include(supportedModes, mode) === false) {
      grunt.fail.warn('Mode ' + mode.cyan + ' not supported.');
    }

    if (options.mode === 'gzip' && srcFiles.length > 1) {
      grunt.fail.warn('Cannot specify multiple input files for gzip compression.');
      srcFiles = srcFiles[0];
    }

    if (grunt.file.exists(destDir) === false) {
      grunt.file.mkdir(destDir);
    }

    grunt.util.async.forEach([destFile], function(file, next) {
      methods[mode](srcFiles, file, options, function(err, written) {
        grunt.log.writeln('File ' + destFile + ' created (' + written + ' bytes written).');
        next();
      });
    }, function(err) {
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

  var tempCopy = function(srcFiles, tempDir, options) {
    var newFiles = [];
    var newMeta = {};

    var filename;
    var relative;
    var destPath;

    var basePath = helpers.findBasePath(srcFiles, options.basePath);
    var rootDir = options.rootDir;

    srcFiles.forEach(function(srcFile) {
      filename = path.basename(srcFile);
      relative = path.dirname(srcFile);
      relative = path.normalize(relative);

      if (options.flatten) {
        relative = '';
      } else if (basePath && basePath.length >= 1) {
        relative = grunt.util._(relative).strRight(basePath).trim(path.sep);
      }

      if (rootDir && rootDir.length >= 1) {
        relative = path.join(options.rootDir, relative);
      }

      // make paths outside grunts working dir relative
      relative = relative.replace(/\.\.(\/|\\)/g, '');

      destPath = path.join(tempDir, relative, filename);

      newFiles.push(destPath);
      newMeta[destPath] = {name: path.join(relative, filename)};

      grunt.verbose.writeln('Adding ' + srcFile + ' to temporary structure.');
      grunt.file.copy(srcFile, destPath);
    });

    return [newFiles, newMeta];
  };

  var methods = {
    zip: function(srcFiles, dest, options, callback) {
      var zip = require('archiver').createZip(options);

      var destDir = path.dirname(dest);
      var tempDir = path.join(destDir, 'zip_' + (new Date()).getTime());

      var copyResult = tempCopy(srcFiles, tempDir, options);

      var zipFiles = grunt.util._.uniq(copyResult[0]);
      var zipMeta = copyResult[1];

      zip.pipe(fs.createWriteStream(dest));

      zip.on('error', function(e) {
        grunt.log.error(e);
        grunt.fail.warn('zipHelper failed.');
      });

      var srcFile;

      grunt.util.async.forEachSeries(zipFiles, function(srcFile, next) {
        zip.addFile(fs.createReadStream(srcFile), zipMeta[srcFile], function() {
          next();
        });
      }, function(err) {
        zip.finalize(function(written) {
          rimraf.sync(tempDir);
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
      var tempDir = path.join(destDir, 'tar_' + (new Date()).getTime());
      var tarDir;

      if (options.rootDir && options.rootDir.length >= 1) {
        tarDir = options.rootDir;
        options.rootDir = false;
      } else {
        tarDir = grunt.util._(destFile).strLeftBack(destFileExt);
      }

      if (gzip === true) {
        tarDir = tarDir.replace('.tar', '');
      }

      var tarProcess;

      tarDir = path.join(tempDir, tarDir);

      tempCopy(srcFiles, tarDir, options);

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

      zlib.gzip(grunt.file.read(file), function(e, result) {
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