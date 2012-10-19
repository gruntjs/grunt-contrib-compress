# Options

## files
Type: `Object`

This defines what files this task will compress and should contain key:value pairs.

The key (destination) should be an unique filepath (supports [grunt.template](https://github.com/gruntjs/grunt/blob/master/docs/api_template.md)) and the value (source) should be a filepath or an array of filepaths (supports [minimatch](https://github.com/isaacs/minimatch)).

## options.mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

## options.basePath
Type: `String`

Adjusts internal filenames to be relative to provided path, within the resulting archive file.  Automatically detected per dest:src pair but can be overridden per target if desired.

## options.flatten
Type: `Boolean`
Default: false

Perform a flat copy that dumps all the files into the root of the destination file, overwriting files if they exist.

## options.level (zip only)
Type: `Integer`
Default: 1

Sets the level of archive compression.

> Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.

## options.rootDir
Type: `String`

This option allows the creation of a root folder to contain files within the resulting archive file.