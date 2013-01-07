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
  var zlib = require('zlib');
  var archiver = require('archiver');
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

    grunt.verbose.writeln('------');
    grunt.verbose.writeflags(options, 'Options');
    grunt.verbose.writeln();

    var srcCwd = options.cwd;
    var srcFiles = grunt.file.expandFiles(options.minimatch, this.file.srcRaw);
    var destFile = unixifyPath(path.normalize(this.file.dest));
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

    var archive;
    var destStream = fs.createWriteStream(destFile);
    var srcFile;

    var gzipper = zlib.createGzip();

    if (mode === 'gzip') {
      srcFile = path.join(srcCwd, srcFiles);
      fs.createReadStream(srcFile).pipe(gzipper).pipe(destStream);

      destStream.on('close', function() {
        grunt.log.writeln('File ' + destFile + ' created (' + getSize(destFile) + ' bytes written).');
        done();
      });
    } else {
      if (mode === 'zip') {
        archive = archiver.createZip(options);
      } else if (mode === 'tar' || mode === 'tgz') {
        archive = archiver.createTar(options);
      }

      if (mode === 'zip' || mode === 'tar') {
        archive.pipe(destStream);
      } else if (mode === 'tgz') {
        archive.pipe(gzipper).pipe(destStream);
      }

      archive.on('error', function(err) {
        grunt.log.error(err);
        grunt.fail.warn('archiver failed.');
      });

      var internalFileName;

      grunt.util.async.forEachSeries(srcFiles, function(srcFile, next) {
        internalFileName = srcFile;
        srcFile = unixifyPath(path.join(srcCwd, srcFile));

        if (options.flatten) {
          internalFileName = path.basename(internalFileName);
        }

        if (options.rootDir && options.rootDir.length >= 1) {
          internalFileName = path.join(options.rootDir, internalFileName);
        }

        internalFileName = unixifyPath(internalFileName);

        archive.addFile(fs.createReadStream(srcFile), { name: internalFileName }, function() {
          grunt.verbose.writeln('Add ' + srcFile + ' -> ' + destFile + '/' + internalFileName);
          next();
        });
      }, function(err) {
        archive.finalize(function(written) {
          grunt.verbose.writeln();
          grunt.log.writeln('File ' + destFile + ' created (' + written + ' bytes written).');
          done();
        });
      });
    }
  });

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

  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };

  var getSize = function(filename) {
    try {
      return fs.statSync(filename).size;
    } catch (e) {
      return 0;
    }
  };
};
