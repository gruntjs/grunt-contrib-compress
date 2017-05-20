# Options

## archive
Type: `String` or `Function`  
Modes: `zip` `tar`

This is used to define where to output the archive. Each target can only have one output file.
If the type is a Function it must return a String.

*This option is only appropriate for many-files-to-one compression modes like zip and tar.  For gzip for example, please use grunt's standard src/dest specifications.*

## mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `deflate`, `deflateRaw`, `tar`, `tgz` (tar gzip),`zip` and `brotli`.

Automatically detected per `dest:src` pair, but can be overridden per target if desired.

## level
Type: `Integer`  
Modes: `zip` `gzip`  
Default: `1`

Sets the level of archive compression.

## brotli
Configure brotli compression settings:

Type: `Object`  
Default:
```js
{
  mode: 0,
  quality: 11,
  lgwin: 22,
  lgblock: 0
}
```

### mode
Type: `Integer`
* `0`: generic mode
* `1`: text mode
* `2`: font mode

Default: `0`

### quality
Controls the compression-speed vs compression-density tradeoffs. The higher the quality, the slower the compression. Range is 0 to 11.

Type: `Integer`  
Default: `11`

### lgwin
Base 2 logarithm of the sliding window size. Range is 10 to 24.

Type: `Integer`  
Default: `22`

### lgblock
Base 2 logarithm of the maximum input block size. Range is 16 to 24. If set to 0, the value will be set based on the quality.  

Type: `Integer`  
Default: `0`

## pretty
Type: `Boolean`  
Default: `false`

Pretty print file sizes when logging.

## createEmptyArchive
Type: `Boolean`  
Default: `true`

This can be used when you don't want to get an empty archive as a result, if there are no files at the specified paths.

It may be useful, if you don't clearly know if files exist and you don't need an empty archive as a result.

# File Data

The following additional keys may be passed as part of a `dest:src` pair when using an Archiver-backed format.
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
