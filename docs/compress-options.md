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
Modes: `zip` `gzip`
Default: 1

Sets the level of archive compression.

## pretty
Type: `Boolean`
Default: `false`

Pretty print file sizes when logging.

## gzipMinLength
Type: `Integer`
Modes: `gzip`
Default: 0

Sets the minimum length, in bytes, of the file that will be gzipped.
