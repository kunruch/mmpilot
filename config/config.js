var yaml = require('js-yaml')
var fs = require('fs')
var logger = require('./../lib/logger')
var shell = require('shelljs')

// this can be overriden via command line param (-c)
var configFiles = ['_mmpilot.yml']

// these can be set via config file
// paths are specified relative to root and converted to absolute path in load()
var config = {
  package: require('./../package.json'),
  env: 'production', // or development. This is passed as NODE_ENV to envify

  clean: ['public'],

  html: {
    src: 'html',
    dest: 'public',
    sitemap: 'sitemap.xml',
    prettyurls: true
  },

  assets: {
    src: 'assets',
    dest: 'public'
  },

  styles: {
    src: 'styles',
    dest: 'public/styles'
  },

  scripts: {
    src: 'scripts',
    dest: 'public/scripts',
    browserify: {
      entries: [],
      out: 'main.js'
    }
  },

  data: 'data',

  serve: {
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
        config = deepMerge(config, userConfig)

        if (config.env === 'development') {
          // merge with dev config
          config = deepMerge(config, devConfig)
        }
      })
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  // Set log level options
  if (config.env === 'development') {
    logger.SetLevel('debug')
    shell.config.verbose = true
  }

  return true
}

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

exports.config = config
