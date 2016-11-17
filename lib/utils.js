var fs = require('fs')
var path = require('path')
var logger = require('./../lib/logger')

// Recusrsively merge config and custom, overriding the base value with custom values
function deepMerge (base, custom) {
  Object.keys(custom).forEach(function (key) {
    if (!base.hasOwnProperty(key) || typeof base[key] !== 'object') {
      base[key] = custom[key]
    } else {
      base[key] = deepMerge(base[key], custom[key])
    }
  })

  return base
}

exports.deepMerge = deepMerge

var iterateOptions = {
  ext: [], // extensions to look for
  dirs: false, // do callback for dirs too
  skip_: true, // skip files & dirs starting with _
  recursive: true // do a recursive find
}

// Iterates through a given folder and calls cb for each file found based on given options
function iterateFiles (dir, options, cb) {
  options = deepMerge(iterateOptions, options)
  iterateRecurse(dir, options, cb)
}
exports.iterateFiles = iterateFiles

// Private recursive method for doing the above
function iterateRecurse (dir, options, cb) {
  try {
    var files = fs.readdirSync(dir)
    files.forEach(function (file, index) {
      var parsedPath = path.parse(file)
      var name = parsedPath.name
      var ext = parsedPath.ext
      var srcpath = path.join(dir, file)

      if (options.skip_ && name.charAt(0) === '_') {
        logger.debug('Skipping file/folder: ' + srcpath)
      } else {
        if (fs.lstatSync(srcpath).isDirectory()) {
          if (options.dirs) {
            cb(srcpath, name)
          }

          // Do recursive search when needed
          if (options.recursive) {
            iterateRecurse(srcpath, options, cb)
          }
        } else {
          for (var i = 0; i < options.ext.length; i++) {
            if (ext === options.ext[i]) {
              cb(srcpath, name, ext)
            }
          }
        }
      }
    })
  } catch (e) {
    logger.debug('Error iterating files: ' + e)
  }
}
