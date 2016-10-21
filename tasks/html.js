var logger = require('./../lib/logger')
var sitemap = require('./../lib/sitemap')
var glob = require('glob')
var fs = require('fs')
var path = require('path')
var shell = require('shelljs')
var requireFromString = require('require-from-string')
var yaml = require('js-yaml')

var config = require('./../config/config').config
var transform = require('./../transforms/pug.js')

exports.watch_pattern = transform.watch_pattern
exports.watch_dir = function () {
  return config.html.src // export as function to get loaded result
}

exports.init = function () {
  transform.init(loadData())
}

exports.processAll = function () {
  logger.start('Processing HTML')

  processDir(false)
  sitemap.generateSiteMap(path.join(config.html.dest, config.html.sitemap))

  logger.end('Processing HTML')
}

exports.processFile = function (filepath) {
  if (path.parse(filepath).name.startsWith('_')) {
    // In case of files starting with '_', compile entire dir as they can be included from multiple sources
    // We can improve this to compile only files that are needed.
    logger.info('Partial file has been changed.. Processing all files.')
    processDir(true)
  } else {
    executeTransform(path.join(config.html.src, filepath), true)
  }
}

exports.processFileDeleted = function (filepath) {
  // Do nothing for now, a fresh build should not generate this file anyways
}

function processDir (incremental) {
  var templateFiles = glob.sync(transform.include_pattern, {
    root: config.html.src
  })

  templateFiles.forEach(function (templatePath) {
    executeTransform(templatePath, incremental)
  })
}

function executeTransform (filepath, incremental) {
  logger.info('Processing HTML template: ' + filepath)

  var page = {} // Info about page passed to the template file

  var templateInPath = filepath
  var templateRelativePath = path.relative(config.html.src, templateInPath)
  var templateOutDir = path.dirname(path.join(config.html.dest, templateRelativePath))
  var templateName = path.parse(templateInPath).name

  if (config.html.prettyurls && templateName != 'index' && templateName != '404') {
    // convert out files like about.html to about/index.html
    templateOutDir = path.join(templateOutDir, templateName)
    templateName = 'index'
  }

  var templateOutName = templateName + '.html'
  var templateOutPath = path.join(templateOutDir, templateOutName)

  shell.mkdir('-p', templateOutDir)

  logger.debug('Template In Path: ' + templateInPath)
  logger.debug('Template Out Path: ' + templateOutPath)

  page.path = sitemap.getRelativePath(templateRelativePath, templateOutName)
  page.url = sitemap.getPageURL(page.path)

  transform.processFile(templateInPath, templateOutPath, page, incremental)

  if (!incremental) {
    sitemap.addToSitemap(templateRelativePath, templateOutName, templateInPath)
  }
}

function loadData () {
  var data = {}

  // iterate through files
  if (config.data.length !== 0) {
    logger.debug('Loading data from ' + config.data)
    try {
      var files = fs.readdirSync(config.data)
      logger.debug('Found: ' + files.length + ' data iles')
      files.forEach(function (file, index) {
        var parsedPath = path.parse(file)
        var name = parsedPath.name
        var ext = parsedPath.ext
        var datapath = path.join(config.data, file)

        logger.debug('Loading data file: ' + datapath)

        var dataFile = fs.readFileSync(datapath, 'utf8')

        if (ext === '.js') {
          data[name] = requireFromString(dataFile, datapath).data
        } else if (ext === '.yml' || ext === '.yaml') {
          data[name] = yaml.safeLoad(dataFile).data
        }
      })
    } catch (e) {
      logger.debug('Error loading data: ' + e)
    }
  }

  // console.log('DATA: ' + JSON.stringify(data))
  return data
}
