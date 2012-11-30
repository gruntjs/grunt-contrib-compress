# Options

## cwd
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

## mode
Type: `String`

This is used to define which mode to use, currently supports `gzip`, `tar`, `tgz` (tar gzip) and `zip`.

Automatically detected per dest:src pair, but can be overridden per target if desired.

## flatten
Type: `Boolean`
Default: false

Perform a flat copy that dumps all the files into the root of the destination file, overwriting files if they exist.

##level (zip only)
Type: `Integer`
Default: 1

Sets the level of archive compression.

*Currently, gzip compression related options are not supported due to deficiencies in node's zlib library.*

## minimatch
Type: `Object`

These options will be forwarded on to grunt.file.expand, as referenced in the [minimatch options section](https://github.com/isaacs/minimatch/#options)

## rootDir
Type: `String`

This option allows the creation of a root folder to contain files within the resulting archive file.
