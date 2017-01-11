var yaml = require('js-yaml')
var fs = require('fs')
var path = require('path')
var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var shell = require('shelljs')

// this can be overriden via command line param (-c)
var configFiles = ['_mmpilot.yml']

// these can be set via config file
// paths are specified relative to root and converted to absolute path in load()
var config = {
  package: require('./../package.json'),
  env: 'production', // or development. This is passed as NODE_ENV to envify

  out: 'public',
  clean: ['public'],

  includes: 'html/_incudes',
  layouts: 'html/_layouts',

  html: {
    src: 'html',
    dest: '/',
    sitemap: 'sitemap.xml',
    prettyurls: true
  },

  assets: {
    src: 'assets',
    dest: '/'
  },

  styles: {
    src: 'styles',
    dest: 'styles'
  },

  scripts: {
    src: 'scripts',
    dest: 'scripts',
    browserify: {
      entries: [],
      out: 'main.js'
    }
  },

  data: 'data',

  serve: {
    src: '',
    mode: 'web',
    proxy: '',
    delay: 0
  },

  publish: {
    src: 'public',
    dest: 'gh-pages',
    temp: '.publish'
  },

  site: {
    url: 'http://localhost/' // needed to generate sitemap
    // Additional data can be specified in config file
  }
}

config.load = function (customConfig, isDevelopment, skipConfigRead) {

  if (customConfig) {
    configFiles = customConfig
  }

  logger.debug('Using configuration files: ' + configFiles)

  if (isDevelopment) {
    config.env = 'development'
  }

  logger.debug('Using env as: ' + config.env)

  if (!skipConfigRead) {
    try {
      configFiles.forEach(function (configFile) {
        var userConfig = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))
        var devConfig = userConfig.development ? userConfig.development : {}
        userConfig.development = {} // blank out for avoiding unecessary nesting.

        // merge with custom config
        config = utils.deepMerge(config, userConfig)

        if (config.env === 'development') {
          // merge with dev config
          config = utils.deepMerge(config, devConfig)
        }
      })
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  // Generate dest directories
  var conf = ['html', 'assets', 'styles', 'scripts']
  conf.forEach(function (key) {
    // store path relative to the out dir
    config[key].dest = path.join(config.out, config[key].dest)
  })

  if (config.scripts.browserify.entries.length >= 1) {
    config.isBrowserify = true
  }

  // Set log level options
  if (config.env === 'development') {
    logger.SetLevel('debug')
    shell.config.verbose = true
  }

  return true
}

exports.config = config
