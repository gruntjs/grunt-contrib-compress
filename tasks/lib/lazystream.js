/*
 * grunt-contrib-compress
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 Chris Talkington, contributors
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var fs = require('fs');
var Stream = require('stream').Stream;

module.exports = {
   ReadStream: LazyReadStream
};

function LazyReadStream(path, options) {
  this.writable = true;
  this.readable = true;
  this.path = path;
  this.options = options;
}
util.inherits(LazyReadStream, Stream);

LazyReadStream.prototype.write = function(data) {
  this.emit('data', data);
};

LazyReadStream.prototype.end = function() {
  this.emit('end');
};

LazyReadStream.prototype.destroy = function() {
  this.emit('close');
};

LazyReadStream.prototype.resume = function() {
   if (typeof this.stream === 'undefined') {
      this.stream = fs.createReadStream(this.path, this.options);
      this.stream.pipe(this);
   }
};
