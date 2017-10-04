var logger = require('./../lib/logger')
var fs = require('fs')
var path = require('path')
var shell = require('shelljs')
var browserify = require('browserify')
var watchify = require('watchify')
var envify = require('envify/custom')
var config = require('./../config/config').config

var bundler

exports.watch_pattern = '**/*.js'
exports.watch_dir = function () {
  return config.scripts.src // export as function to get loaded result
}

exports.init = function () {
  if (config.isBrowserify) {
    bundler = browserify({ debug: (config.env === 'development' && config.html.sourcemap === true) }) // debug = true enables sourcemaps
  }
}

exports.processAll = function (addWatch) {
  logger.start('Processing Scripts')

  if (!config.isBrowserify) {
    // simply copy src scripts to dest
    logger.info('Copying js files from: ' + config.scripts.src + ' to: ' + config.scripts.dest)

    shell.mkdir('-p', config.scripts.dest)
    shell.cp('-r', path.join(config.scripts.src, '*'), config.scripts.dest)

    logger.end('Processing Scripts')
    return
  }

  // Compile with browserify
  var destPath = path.join(config.scripts.dest, config.scripts.browserify.out)
  var destDir = path.dirname(destPath)
  logger.debug('Out Path: ' + destPath)

  config.scripts.browserify.entries.forEach(function (entry) {
    var sourcePath = path.join(config.scripts.src, entry)

    logger.info('Adding entry to browserify: ' + sourcePath)

    bundler.add(sourcePath, {
      cache: {},
      packageCache: {}
    })
  })

  shell.mkdir('-p', destDir)

  // envify and uglify on production builds
  if (config.env === 'production') {
    bundler.transform(envify({
      _: 'purge',
      NODE_ENV: config.env
    }))
    bundler.transform({
      global: true
    }, 'uglifyify')
  }

  if (addWatch) {
    bundler.plugin(watchify)
    bundler.on('update', function () {
      bundle(destPath)
    })
  }

  bundler.on('log', function (message) {
    logger.info(destPath + ' : ' + message)
  })

  bundle(destPath)
}

function bundle (destPath) {
  logger.info('Bundling to: ' + destPath)
  var writeStream = fs.createWriteStream(destPath)
  bundler.bundle().pipe(writeStream)
  writeStream.on('finish', function () {
    logger.end('Processing Scripts')
  })
}


exports.processFile = function (filepath) {
  logger.info('Processing js file: ' + filepath)

  if (!config.isBrowserify) { // this method should be called only when browserify is not enabled
    var absolutePath = path.join(config.scripts.src, filepath)
    // simply copy
    shell.cp(absolutePath, config.scripts.dest)
  }
}

exports.processFileDeleted = function (filepath) {
  // Do nothing for now, a fresh build should not generate this file anyways
}
