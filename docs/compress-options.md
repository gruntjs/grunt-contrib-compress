# Options

## mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

## basePath
Type: `String`

Adjusts internal filenames to be relative to provided path, within the resulting archive file.  Automatically detected per dest:src pair but can be overridden per target if desired.

## flatten
Type: `Boolean`
Default: false

Perform a flat copy that dumps all the files into the root of the destination file, overwriting files if they exist.

##level (zip only)
Type: `Integer`
Default: 1

Sets the level of archive compression.

*Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.*

## rootDir
Type: `String`

This option allows the creation of a root folder to contain files within the resulting archive file.
