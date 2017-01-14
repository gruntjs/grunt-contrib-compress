# Usage Examples

```js
// make a zipfile
compress: {
  main: {
    options: {
      archive: 'archive.zip'
    },
    files: [
      {src: ['path/*'], dest: 'internal_folder/', filter: 'isFile'}, // includes files in path
      {src: ['path/**'], dest: 'internal_folder2/'}, // includes files in path and its subdirs
      {expand: true, cwd: 'path/', src: ['**'], dest: 'internal_folder3/'}, // makes all src relative to cwd
      {flatten: true, src: ['path/**'], dest: 'internal_folder4/', filter: 'isFile'} // flattens results to a single level
    ]
  }
}
```

```js
// gzip assets 1-to-1 for production
compress: {
  main: {
    options: {
      mode: 'gzip'
    },
    expand: true,
    cwd: 'assets/',
    src: ['**/*'],
    dest: 'public/'
  }
}
```

```js
// compress a file to a different location than its source
// example compresses path/the_file to /the_file inside archive.zip
compress: {
  main: {
    options: {
      archive: 'archive.zip'
    },
    files: [{
      expand: true,
      cwd: 'path/',
      src: ['the_file'],
      dest: '/'
    }]
  }
},
```

```js
// use custom extension for the output file
compress: {
  main: {
    options: {
      mode: 'gzip'
    },
    // Each of the files in the src/ folder will be output to
    // the dist/ folder each with the extension .gz.js
    files: [{
      expand: true,
      src: ['src/*.js'],
      dest: 'dist/',
      ext: '.gz.js'
    }]
  }
}

```
```js
// use a function to return the output file
compress: {
  main: {
    options: {
      archive: function () {
        // The global value git.tag is set by another task
        return git.tag + '.zip'
      }
    },
    files: [{
      expand: true,
      src: ['src/*.js'],
      dest: 'dist/'
    }]
  }
}
```

```js
// brotlify assets 1-to-1 for production using default options
compress: {
  main: {
    options: {
      mode: 'brotli'
    },
    expand: true,
    cwd: 'assets/',
    src: ['**/*.js'],
    dest: 'public/',
    extDot: 'last',
    ext: '.js.br'
  }
}
```

```js
// brotlify assets 1-to-1 for production specifying text mode
// and using default options otherwise
compress: {
  main: {
    options: {
      mode: 'brotli',
      brotli: {
        mode: 1
      }
    },
    expand: true,
    cwd: 'assets/',
    src: ['**/*.js'],
    dest: 'public/',
    extDot: 'last',
    ext: '.js.br'
  }
}
```
