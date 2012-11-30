# grunt-contrib-compress [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-compress.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-compress)

> Compress files and folders.


## Getting Started
If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```shell
npm install grunt-contrib-compress --save-dev
```

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md


## Compress task
_Run this task with the `grunt compress` command._

_This task is a [multi task][] so any targets, files and options should be specified according to the [multi task][] documentation._
[multi task]: https://github.com/gruntjs/grunt/wiki/Configuring-tasks


Node Libraries Used:
[archiver](https://github.com/ctalkington/node-archiver) (for zip)
[tar](https://github.com/isaacs/node-tar) (for tar/tgz)
[zlib](http://nodejs.org/api/zlib.html#zlib_options) (for gzip).

### Options

#### cwd
Type: `String`

This option sets the current working directory for use with the minimatch and compress process. This helps translate paths when compressed so that the destination stucture matches the source structure exactly. Without a `cwd` set, all paths are relative to the gruntfile directory which can cause extra depth to be added to your compressed structure when it may not be desired.

```js
compress: {
  target: {
    options: {
      cwd: 'path/to/sources'
    },
    files: {
      'tmp/test.zip': ['*', 'sub1/*']
    }
  }
}
```

#### mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

#### flatten
Type: `Boolean`
Default: false

Perform a flat copy that dumps all the files into the root of the destination file, overwriting files if they exist.

####level (zip only)
Type: `Integer`
Default: 1

Sets the level of archive compression.

*Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.*

#### minimatch
Type: `Object`

These options will be forwarded on to grunt.file.expand, as referenced in the [minimatch options section](https://github.com/isaacs/minimatch/#options)

#### rootDir
Type: `String`

This option allows the creation of a root folder to contain files within the resulting archive file.

### Usage Examples

```js
compress: {
  zip: {
    files: {
      "path/to/result.zip": "path/to/source/*", // includes files in dir
      "path/to/another.tar": "path/to/source/**", // includes files in dir and subdirs
      "path/to/final.tgz": ["path/to/sources/*.js", "path/to/more/*.js"], // include JS files in two diff dirs
      "path/to/single.gz": "path/to/source/single.js", // gzip a single file
      "path/to/project-<%= pkg.version %>.zip": "path/to/source/**" // variables in destination
    }
  }
}
```


## Release History

 * 2012-11-28   v0.4.0   Conversion to grunt v0.4 conventions. Replace basePath with cwd.
 * 2012-10-11   v0.3.2   Rename grunt-contrib-lib dep to grunt-lib-contrib.
 * 2012-10-08   v0.3.1   Replace zipstream package with archiver.
 * 2012-09-23   v0.3.0   General cleanup. Options no longer accepted from global config key.
 * 2012-09-17   v0.2.2   Test refactoring. No valid source check. Automatic mode detection.
 * 2012-09-09   v0.2.0   Refactored from grunt-contrib into individual repo.

---

Task submitted by [Chris Talkington](http://christalkington.com/)

*This file was generated on Thu Nov 29 2012 22:13:15.*
