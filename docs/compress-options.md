# Options

## archive
Type: `String` or `Function`
Modes: `zip` `tar`

This is used to define where to output the archive. Each target can only have one output file.
If the type is a Function it must return a String.

*This option is only appropriate for many-files-to-one compression modes like zip and tar.  For gzip for example, please use grunt's standard src/dest specifications.*

## mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `deflate`, `deflateRaw`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

## level
Type: `Integer`
Modes: `zip`
Default: 1

Sets the level of archive compression.

*Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.*

## pretty
Type: `Boolean`
Default: `false`

Pretty print file sizes when logging.

## fileSettings
Type: `Function`

Allows customizing file properties used by the archiver. The function is called with two arguments - source file name and an object with initial properties.

For example to preserve last modified date use this function:

```js
fileSettings: function(srcFile, properties) {
    properties.date = require('fs').statSync(srcFile).mtime;
}
```

To put all files inside the archive in a subdirectory:

```js
fileSettings: function(srcFile, properties) {
    properties.name = 'subdirectory/' + properties.name;
}
```
