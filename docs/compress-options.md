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

Automatically detected per `dest:src` pair, but can be overridden per target if desired.

## level
Type: `Integer`  
Modes: `zip` `gzip`  
Default: `1`

Sets the level of archive compression.

## pretty
Type: `Boolean`  
Default: `false`

Pretty print file sizes when logging.

# File Data

The following additional keys may be passed as part of a dest:src pair when using an Archiver-backed format.
All keys can be defined as a `Function` that receives the file name and returns in the type specified below.

## date
Type: `Date`  
Modes: `zip` `tar` `tgz`

Sets the file date.

## mode
Type: `Integer`  
Modes: `zip` `tar` `tgz`

Sets the file permissions.

## store
Type: `Boolean`  
Default: `false`

If true, file contents will be archived without compression.

## comment
Type: `String`  
Modes: `zip`

Sets the file comment.

## gid
Type: `Integer`
Modes: `tar` `tgz`

Sets the group of the file in the archive

## uid
Type: `Integer`
Modes: `tar` `tgz`

Sets the user of the file in the archive
