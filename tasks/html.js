var logger = require('./../lib/logger')
var sitemap = require('./../lib/sitemap')
var glob = require('glob')
var path = require('path')
var shell = require('shelljs')

var config = require('./../config/config').config
var transform = require('./../transforms/pug.js')
var data = require('./../lib/data')
var blogs = require('./../lib/blogs')

exports.watch_pattern = transform.watch_pattern
exports.watch_dir = function () {
  return config.html.src // export as function to get loaded result
}

exports.init = function () {
  blogs.init()
  transform.init(data.loadData(config.data))
}

exports.processAll = function () {
  logger.start('Processing HTML')

  processDir(config.html.src, false)

  logger.end('Processing HTML')
}

exports.processFile = function (filepath) {
  if (path.parse(filepath).name.startsWith('_')) {
    // In case of files starting with '_', compile entire dir as they can be included from multiple sources
    // We can improve this to compile only files that are needed.
    logger.info('Partial file has been changed.. Processing all files.')
    processDir(config.html.src, true)
  } else {
    executeTransform(path.join(config.html.src, filepath), true)
  }
}

exports.processFileDeleted = function (filepath) {
  // Do nothing for now, a fresh build should not generate this file anyways
}

function processDir (dir, incremental) {
  var templateFiles = glob.sync(transform.include_pattern, {
    root: dir
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
  page.source = templateRelativePath

  var templateOutDir = path.dirname(path.join(config.html.dest, templateRelativePath))
  var templateName = path.parse(templateInPath).name

  if (config.html.prettyurls && templateName !== 'index' && templateName !== '404') {
    // convert out files like about.html to about/index.html
    templateOutDir = path.join(templateOutDir, templateName)
    templateRelativePath = path.join(path.dirname(templateRelativePath), templateName, 'index.pug')

    // logger.debug('Template Relative Path: ' + templateRelativePath)
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

  if (!incremental && templateName !== '404') {
    sitemap.addToSitemap(templateRelativePath, templateOutName, templateInPath)
  }
}
