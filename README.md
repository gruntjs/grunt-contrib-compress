# grunt-contrib-compress [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-compress.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-compress)

> Compress files and folders.

_Note that this plugin has not yet been released, and only works with the latest bleeding-edge, in-development version of grunt. See the [When will I be able to use in-development feature 'X'?](https://github.com/gruntjs/grunt/blob/devel/docs/faq.md#when-will-i-be-able-to-use-in-development-feature-x) FAQ entry for more information._

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-contrib-compress --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-contrib-compress');
```

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html


## The compress task

### Overview

In your project's Gruntfile, add a section named `compress` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  compress: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

Node Libraries Used:
[archiver](https://github.com/ctalkington/node-archiver) (for zip)
[tar](https://github.com/isaacs/node-tar) (for tar/tgz)
[zlib](http://nodejs.org/api/zlib.html#zlib_options) (for gzip).
### Options

#### files
Type: `Object`

This defines what files this task will compress and should contain key:value pairs.

The key (destination) should be an unique filepath (supports [grunt.template](https://github.com/gruntjs/grunt/blob/master/docs/api_template.md)) and the value (source) should be a filepath or an array of filepaths (supports [minimatch](https://github.com/isaacs/minimatch)).

#### options.mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

#### options.basePath
Type: `String`

Adjusts internal filenames to be relative to provided path, within the resulting archive file.  Automatically detected per dest:src pair but can be overridden per target if desired.

#### options.flatten
Type: `Boolean`
Default: false

Perform a flat copy that dumps all the files into the root of the destination file, overwriting files if they exist.

#### options.level (zip only)
Type: `Integer`
Default: 1

Sets the level of archive compression.

> Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.

#### options.rootDir
Type: `String`

This option allows the creation of a root folder to contain files within the resulting archive file.
### Examples

``` javascript
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

 * 2012-10-11 - v0.3.2 - Rename grunt-contrib-lib dep to grunt-lib-contrib.
 * 2012-10-08 - v0.3.1 - replace zipstream package.
 * 2012-09-23 - v0.3.0 - General cleanup. Options no longer accepted from global config key.
 * 2012-09-17 - v0.2.2 - Test refactoring. No valid source check. Automatic mode detection.
 * 2012-09-09 - v0.2.0 - Refactored from grunt-contrib into individual repo.

--
Task submitted by <a href="http://christalkington.com/">Chris Talkington</a>.

*Generated on Tue Nov 13 2012 21:10:05.*
