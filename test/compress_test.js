var grunt = require('grunt');
var path = require('path');
var fs = require('fs');

var getSize = function(filename) {
  'use strict';

  try {
    return fs.statSync(path.join('tmp', filename)).size;
  } catch (e) {
    return 0;
  }
};

exports['compress'] = {
  zip: function(test) {
    'use strict';

    var expect, result;

    test.expect(4);

    expect = 310;
    result = getSize('compress_test_files.zip');
    test.equal(expect, result, 'should compress files into zip');

    expect = 962;
    result = getSize('compress_test_v0.1.0.zip');
    test.equal(expect, result, 'should compress folders and their files into zip (with template support)');

    expect = 302;
    result = getSize('compress_test_files_template.zip');
    test.equal(expect, result, 'should compress files and folders into zip (grunt template in source)');

    expect = 874;
    result = getSize('compress_test_flatten.zip');
    test.equal(expect, result, 'should create a flat internal structure');

    test.done();
  },
  tar: function(test) {
    'use strict';

    var expect, result;

    test.expect(4);

    expect = 3072;
    result = getSize('compress_test_files.tar');
    test.equal(expect, result, 'should add files into tar');

    expect = 8192;
    result = getSize('compress_test_v0.1.0.tar');
    test.equal(expect, result, 'should add folders and their files into tar (with template support)');

    expect = 3072;
    result = getSize('compress_test_files_template.tar');
    test.equal(expect, result, 'should add files and folders into tar (grunt template in source)');

    expect = 7168;
    result = getSize('compress_test_flatten.tar');
    test.equal(expect, result, 'should create a flat internal structure');

    test.done();
  },
  tgz: function(test) {
    'use strict';

    var expect, result;

    test.expect(4);

    expect = true;
    result = getSize('compress_test_files.tgz') >= 200;
    test.equal(expect, result, 'should compress files into tar');

    expect = true;
    result = getSize('compress_test_v0.1.0.tgz') >= 350;
    test.equal(expect, result, 'should compress folders and their files into tgz (with template support)');

    expect = true;
    result = getSize('compress_test_files_template.tgz') >= 200;
    test.equal(expect, result, 'should compress files and folders into tgz (grunt template in source)');

    expect = true;
    result = getSize('compress_test_flatten.tgz') >= 320;
    test.equal(expect, result, 'should create a flat internal structure');

    test.done();
  },
  gzip: function(test) {
    'use strict';

    var expect, result;

    test.expect(2);

    expect = 52;
    result = getSize('compress_test_file.gz');
    test.equal(expect, result, 'should gzip file');

    expect = 67;
    result = getSize('compress_test_file2.gz');
    test.equal(expect, result, 'should gzip another file (multiple dest:source pairs)');

    test.done();
  }
};