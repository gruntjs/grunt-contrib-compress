'use strict';
/* globals test, expect */
var grunt = require('grunt');
var path = require('path');
var zlib = require('zlib');
var fs = require('fs');
var AdmZip = require('adm-zip');
var tar = require('tar');

test('zip', (done) => {
  expect.assertions(1);
  var expected = [
    'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
    'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
    'test.css', 'test.js'
  ];
  var actual = [];
  var zip = new AdmZip(path.join('tmp', 'compress_test_files.zip'));
  var zipEntries = zip.getEntries();
  zipEntries.forEach(function(entry, idx) {
    actual.push(entry.entryName);
    if (idx === zipEntries.length - 1){
        actual.sort();
        expected.sort();
      // zip file should unzip and contain all of the expected files
      expect(actual).toEqual(expected);
      done();
    }
  });
});

test('zipWithFolder', (done) => {
  expect.assertions(1);
  var expected = [
    'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
    'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
    'test.css', 'test.js'
  ];
  var actual = [];
  var zip = new AdmZip(path.join('tmp', 'compress_test_folder.zip'));
  var zipEntries = zip.getEntries();
  zipEntries.forEach(function(entry, idx) {
    actual.push(entry.entryName);
    if (idx === zipEntries.length - 1){
      actual.sort();
      expected.sort();
      // zip file should unzip and contain all of the expected files
      expect(actual).toEqual(expected);
      done();
    }
  });
});

test('tar', (done) => {
  expect.assertions(1);
  var expected = [
    'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
    'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
    'test.css', 'test.js'
  ];
  var actual = [];
  var parse = new tar.Parse();
  fs.createReadStream(path.join('tmp', 'compress_test_files.tar')).pipe(parse);
  parse.on('entry', function (entry) {
    actual.push(entry.path);
    entry.resume();
  });
  parse.on('end', function () {
    actual.sort();
    expected.sort();
    expect(actual).toEqual(expected);
    done();
  });
});

test('tgz', (done) => {
  expect.assertions(1);
  var expected = [
    'folder_one/', 'folder_one/one.css', 'folder_one/one.js',
    'folder_two/', 'folder_two/two.css', 'folder_two/two.js',
    'test.css', 'test.js'
  ];
  var actual = [];
  var parse = new tar.Parse();
  fs.createReadStream(path.join('tmp', 'compress_test_files.tgz'))
    .pipe(zlib.createGunzip())
    .pipe(parse);
  parse.on('entry', function (entry) {
    actual.push(entry.path);
    entry.resume();
  });
  parse.on('end', function () {
    actual.sort();
    expected.sort();
    expect(actual).toEqual(expected);
    done();
  });
});

test('gzip', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.css'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'gzip', file))
      .pipe(zlib.createGunzip())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected); // should be equal to fixture after gunzipping
        next();
      });
  }, done);
});

test('gzipCustomExt', () => {
  expect.assertions(3);
  [
    'test',
    'folder_one/one',
    'folder_two/two'
  ].forEach(function (file) {
    var expected = path.join('tmp', 'gzipCustomExt', file + '.gz.js');
    expect(grunt.file.exists(expected)).toBe(true);
  });
});

test('gzipSrcEqualDest', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.js'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'gzipSrcEqualDest', file))
      .pipe(zlib.createGunzip())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected);
        next();
      });
  }, done);
});

test('deflate', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.css'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'deflate', file))
      .pipe(zlib.createInflate())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected);
        next();
      });
  }, done);
});

test('deflateRaw', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.css'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'deflateRaw', file))
      .pipe(zlib.createInflateRaw())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected);
        next();
      });
  }, done);
});

test('brotli', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.css'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'brotli', file))
      .pipe(zlib.createBrotliDecompress())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected);
        next();
      });
  }, done);
});

test('brotliCustomExt', () => {
  expect.assertions(3);
  [
    'test',
    'folder_one/one',
    'folder_two/two'
  ].forEach(function (file) {
    var expected = path.join('tmp', 'brotliCustomExt', file + '.br.js');
    expect(grunt.file.exists(expected)).toBe(true);
  });
});

test('brotliSrcEqualDest', (done) => {
  expect.assertions(3);
  grunt.util.async.forEachSeries([
    'test.js',
    path.join('folder_one', 'one.js'),
    path.join('folder_two', 'two.js')
  ], function (file, next) {
    var expected = grunt.file.read(path.join('test', 'fixtures', file));
    var actual = '';
    fs.createReadStream(path.join('tmp', 'brotliSrcEqualDest', file))
      .pipe(zlib.createBrotliDecompress())
      .on('data', function (buf) {
        actual += buf.toString();
      })
      .on('end', function () {
        expect(actual).toEqual(expected);
        next();
      });
  }, done);
});

test('zipCreateEmptyArchiveOptionTrue', () => {
  // Archive must be created if option "createEmptyArchive" is true
  expect(grunt.file.exists(path.join('tmp', 'zip_must_be_created_1.zip'))).toBe(true);
});

test('zipCreateEmptyArchiveOptionFalse', () => {
  // Archive must not be created if option "createEmptyArchive" is false
  expect(grunt.file.exists(path.join('tmp', 'zip_should_not_be_created.zip'))).toBe(false);
});

test('zipCreateEmptyArchiveOptionNotExists', () => {
  expect(grunt.file.exists(path.join('tmp', 'zip_must_be_created_2.zip'))).toBe(true);
});

