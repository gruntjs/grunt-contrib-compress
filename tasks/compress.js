/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Chris Talkington, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-contrib-compress/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var rimraf = require('rimraf');

  // TODO: ditch this when grunt v0.4 is released
  grunt.file.exists = grunt.file.exists || fs.existsSync || path.existsSync;

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  var async = grunt.util.async;
  var kindOf = grunt.util.kindOf;
  var helpers = require('grunt-contrib-lib').init(grunt);

  grunt.registerMultiTask('compress', 'Compress files.', function() {
    var options = helpers.options(this, {
      mode: null,
      basePath: false,
      flatten: false,
      level: 1,
      rootDir: false
    });

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

    var supported = ['zip', 'tar', 'tgz', 'gzip'];
    var mode = options.mode;
    if (options.mode === 'tgz') {
      mode = 'tar';
    }

    var done = this.async();

    if (options.basePath && kindOf(options.basePath) === 'string') {
      options.basePath = path.normalize(options.basePath);
      options.basePath = _(options.basePath).trim(path.sep);
    } else {
      options.basePath = false;
    }

    if (options.rootDir && kindOf(options.rootDir) === 'string') {
      options.rootDir = path.normalize(options.rootDir).split(path.sep)[0];
    } else {
      options.rootDir = false;
    }

    grunt.verbose.writeflags(options, 'Options');

    if (_.include(supported, options.mode) === false) {
      grunt.log.error('Mode ' + options.mode + ' not supported.');
      done();
      return;
    }

    var srcFiles;
    var destDir;

    async.forEachSeries(this.files, function(file, next) {
      srcFiles = grunt.file.expandFiles(file.src);
      destDir = path.dirname(file.dest);

      if (options.mode === 'gzip' && srcFiles.length > 1) {
        grunt.fail.warn('Cannot specify multiple input files for gzip compression.');
        srcFiles = srcFiles[0];
      }

      if (grunt.file.exists(destDir) === false) {
        grunt.file.mkdir(destDir);
      }

      methods[mode](srcFiles, file.dest, options, function(written) {
        grunt.log.writeln('File ' + file.dest + ' created (' + written + ' bytes written).');
        next();
      });

    }, function() {
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

  var findBasePath = function(srcFiles) {
    var basePaths = [];
    var dirName;

    srcFiles.forEach(function(srcFile) {
      dirName = path.dirname(srcFile);
      dirName = path.normalize(dirName);

      basePaths.push(dirName.split(path.sep));
    });

    basePaths = _.intersection.apply([], basePaths);

    return path.join.apply(path, basePaths);
  };

  var tempCopy = function(srcFiles, tempDir, options) {
    var newFiles = [];
    var newMeta = {};

    var filename;
    var relative;
    var destPath;

    var basePath = options.basePath || findBasePath(srcFiles);
    var rootDir = options.rootDir;

    srcFiles.forEach(function(srcFile) {
      filename = path.basename(srcFile);
      relative = path.dirname(srcFile);
      relative = path.normalize(relative);

      if (options.flatten) {
        relative = '';
      } else if (basePath && basePath.length > 1) {
        relative = _(relative).chain().strRight(basePath).trim(path.sep).value();
      }

      if (rootDir && rootDir.length > 1) {
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
      var zip = require('zipstream-ctalkington').createZip(options);

      var destDir = path.dirname(dest);
      var tempDir = path.join(destDir, 'zip_' + (new Date()).getTime());

      var copyResult = tempCopy(srcFiles, tempDir, options);

      var zipFiles = _.uniq(copyResult[0]);
      var zipMeta = copyResult[1];

      zip.pipe(fs.createWriteStream(dest));

      var srcFile;

      function addFile() {
        if (!zipFiles.length) {
          zip.finalize(function(written) {
            rimraf.sync(tempDir);
            callback(written);
          });
          return;
        }

        srcFile = zipFiles.shift();

        zip.addFile(fs.createReadStream(srcFile), zipMeta[srcFile], addFile);
      }

      addFile();

      // TODO: node-zipstream v0.2.1 has issues that prevents this from working atm!
      zip.on('error', function(e) {
        grunt.log.error(e);
        grunt.fail.warn('zipHelper failed.');
      });
    },

    tar: function(srcFiles, dest, options, callback) {
      var fstream = require('fstream');
      var tar = require('tar');
      var zlib = require('zlib');

      var destDir = path.dirname(dest);
      var destFile = path.basename(dest);
      var destFileExt = path.extname(destFile);
      var tempDir = path.join(destDir, 'tar_' + (new Date()).getTime());
      var tarDir;

      if (options.rootDir && options.rootDir.length > 1) {
        tarDir = options.rootDir;
        options.rootDir = false;
      } else {
        tarDir = _(destFile).strLeftBack(destFileExt);
      }

      var tarProcess;

      tarDir = path.join(tempDir, tarDir);

      tempCopy(srcFiles, tarDir, options);

      var reader = fstream.Reader({path: tarDir, type: 'Directory'});
      var packer = tar.Pack();
      var gzipper = zlib.createGzip();
      var writer = fstream.Writer(dest);

      if (options.mode === 'tgz') {
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
        callback(getSize(dest));
      });
    },

    gzip: function(file, dest, options, callback) {
      var zlib = require('zlib');

      zlib.gzip(grunt.file.read(file), function(e, result) {
        if (!e) {
          grunt.file.write(dest, result);
          callback(result.length);
        } else {
          grunt.log.error(e);
          grunt.fail.warn('tarHelper failed.');
        }
      });
    }
  };
};