'use strict';

var grunt = require('grunt');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs');
var unzip = require('unzip');
var tar = require('tar');
var compress = require('../tasks/lib/compress')(grunt);

exports.compress_zip = {
  zip: function(test) {
    test.expect(1);
    var expected = [
      'folder_one/one.css', 'folder_one/one.js',
      'folder_two/two.css', 'folder_two/two.js',
      'test.css', 'test.js',
    ];
    var actual = [];
    var parse = unzip.Parse();
    fs.createReadStream(path.join('tmp', 'compress_test_files.zip')).pipe(parse);
    parse.on('entry', function(entry) {
      actual.push(entry.path);
    });
    parse.on('close', function() {
      test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');
      test.done();
    });
  },
};