var logger = require('./../lib/logger')
var sitemap = require('./../lib/sitemap')
var utils = require('./../lib/utils')
var glob = require('glob')
var path = require('path')
var shell = require('shelljs')

var config = require('./../config/config').config
var transform = require('./../transforms/pug.js')
var data = require('./../lib/data')
var blogs = require('./../lib/blogs')
var fs = require('fs')
var fm = require('front-matter')

exports.watch_pattern = transform.watch_pattern
exports.watch_dir = function () {
  return config.html.src // export as function to get loaded result
}

exports.init = function () {
  blogs.init(config.html.src)
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

// 1. Extract front matter
// 2. Transform content (pug or markdown) based on file extension
// 3. Transform layout, pass page.content and other front matter data.
// 4. Save file to destination
function executeTransform (filepath, incremental) {
  logger.info('Processing HTML file: ' + filepath)

  var page = {} // Info about page passed to the template file

  var fileInPath = filepath
  var fileRelativePath = path.relative(config.html.src, fileInPath)
  page.source = fileRelativePath

  var fileOutDir = path.dirname(path.join(config.html.dest, fileRelativePath))
  var fileParsedPath = path.parse(fileInPath)
  var fileName = fileParsedPath.name
  var fileExt = fileParsedPath.ext

  if (config.html.prettyurls && fileName !== 'index' && fileName !== '404') {
    // convert out files like about.html to about/index.html
    fileOutDir = path.join(fileOutDir, fileName)
    fileRelativePath = path.join(path.dirname(fileRelativePath), fileName, 'index' + fileExt)

    logger.debug('File Relative Path: ' + fileRelativePath)
    fileName = 'index'
  }

  var fileOutName = fileName + '.html'
  var fileOutPath = path.join(fileOutDir, fileOutName)

  shell.mkdir('-p', fileOutDir)

  logger.debug('File In Path: ' + fileInPath)
  logger.debug('File Out Path: ' + fileOutPath)

  page.path = sitemap.getRelativePath(fileRelativePath, fileOutName)
  page.url = sitemap.getPageURL(page.path)

  try {
    var fileContents = fs.readFileSync(fileInPath, 'utf8')
    fileContents = fm(fileContents)

    page = utils.deepMerge(page, fileContents.attributes)
    page.content = transform.processString(fileContents.body, page)

    // logger.debug(JSON.stringify(page))

    var templateInPath = path.join(config.layouts, '_layout-' + page.layout + '.pug')
    logger.debug('Layout is: ' + templateInPath)

    transform.processFile(templateInPath, fileOutPath, page, incremental)

    if (!incremental && fileName !== '404') {
      sitemap.addToSitemap(fileRelativePath, fileOutName, fileInPath)
    }
  } catch (e) {
    logger.error('Error processing file: ' + e)
    process.exit(1)
  }
}
