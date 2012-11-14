# Overview

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