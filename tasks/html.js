var logger = require('./../lib/logger')
var sitemap = require('./../lib/sitemap')
var redirects = require('./../lib/redirects')
var utils = require('./../lib/utils')
var rss = require('./../lib/rss')
var path = require('path')
var shell = require('shelljs')

var config = require('./../config/config').config
var pug = require('./../transforms/pug.js')
var markdown = require('./../transforms/markdown.js')
var data = require('./../lib/data')
var blogs = require('./../lib/blogs')
var fs = require('fs')
var fm = require('front-matter')

exports.watch_pattern = '**/(*.pug|*.md)'
exports.watch_dir = function () {
  return config.html.src // export as function to get loaded result
}

exports.init = function () {
  var d = data.loadData(config.data)
  blogs.init(config.html.src, d)
  pug.init(d, blogs.blogs)
  markdown.init()
}

exports.processAll = function () {
  logger.start('Processing HTML')
  // Process all files and transform to HTML
  processDir(config.html.src, false)
  logger.end('Processing HTML')

  logger.start('Processing Blogs')
  // Generate index, tag and category archives as well as rss feed for Blogs
  Object.keys(blogs.blogs).forEach(function (key) {
    blogs.processBlogsArchive(blogs.blogs[key])
    rss.generateFeed(blogs.blogs[key])
  })
  logger.end('Processing Blogs')

  if (config.redirected.length > 0) {
    logger.start('Processing Redirects')
    redirects.generateRedirections()
    logger.end('Processing Redirects')
  }
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
  utils.iterateFiles(dir, {ext: ['.pug', '.md']}, function (file, name, ext) {
    executeTransform(file, incremental)
  })
}

// 1. Extract front matter
// 2. Determine out path based on whether it is a blog or regular html file
// 2. Transform content (pug or markdown) based on file extension
// 3. Transform layout, pass page.content and other front matter data.
// 4. Save file to destination
function executeTransform (filepath, incremental) {
  logger.info('Processing file: ' + filepath)

  var page = {} // Info about page passed to the template file

  var fileInPath = filepath
  var fileRelativePath = path.relative(config.html.src, fileInPath)
  page.source = fileRelativePath

  var fileOutDir = path.dirname(path.join(config.html.dest, fileRelativePath))
  var fileParsedPath = path.parse(fileInPath)
  var fileName = fileParsedPath.name
  var fileExt = fileParsedPath.ext

  var blog = blogs.getBlog(fileRelativePath, fileName)
  var post = null

  if (blog) {
    fileOutDir = blog.config.dest
    post = blogs.getPost(blog, fileName)
    if (post === null) {
      return // most probably a draft in production build
    }
  }

  if (config.html.prettyurls && fileName !== 'index' && fileName !== '404') {
    // convert out files like about.html to about/index.html
    fileOutDir = path.join(fileOutDir, fileName)
    fileRelativePath = path.join(path.dirname(fileRelativePath), fileName, 'index' + fileExt)

    fileName = 'index'
  }

  logger.debug('File Relative Path: ' + fileRelativePath)


  var fileOutName = fileName + '.html'
  var fileOutPath = path.join(fileOutDir, fileOutName)

  shell.mkdir('-p', fileOutDir)

  logger.debug('File In Path: ' + fileInPath)
  logger.debug('File Out Path: ' + fileOutPath)

  page.path = sitemap.getRelativePath(fileRelativePath, fileOutName)
  page.url = sitemap.getPageURL(page.path)

  try {
    if (!blog) {
      var fileContents = fs.readFileSync(fileInPath, 'utf8')
      fileContents = fm(fileContents)

      page = utils.deepMerge(page, fileContents.attributes)

      if (page.draft) {
        if (config.env !== 'development') {
          return // dont process drafts if this is not development build
        }
      }

      if (fileExt === '.pug') {
        page.content = pug.processString(fileContents.body, fileInPath, page)
      } else {
        page.content = markdown.processString(fileContents.body)
      }
    } else {
      if (!incremental) {
        page = post
      } else {
        page = blogs.processPost(fileInPath, blog)
      }
    }

    if (!page.layout) {
      page.layout = blog ? blog.config.layout : 'default'
    }

    // logger.debug(JSON.stringify(page))

    var templateInPath = path.join(config.layouts, '_layout-' + page.layout + '.pug')
    logger.debug('Layout is: ' + templateInPath)

    pug.processFile(templateInPath, fileOutPath, page, incremental)

    if (!incremental && fileName !== '404') {
      sitemap.addToSitemap(fileRelativePath, fileOutName, fileInPath)
    }
  } catch (e) {
    logger.error('Error processing file: ' + e)
    process.exit(1)
  }
}
