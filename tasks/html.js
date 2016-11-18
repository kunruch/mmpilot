var logger = require('./../lib/logger')
var sitemap = require('./../lib/sitemap')
var utils = require('./../lib/utils')
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
  // Generate index, tag and category archives for Blogs
  Object.keys(blogs.blogs).forEach(function (key) {
    processBlogsArchive(blogs.blogs[key])
  })
  logger.end('Processing Blogs')
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

  var blog = getBlog(fileRelativePath, fileName)

  if (blog) {
    fileOutDir = blog.config.dest
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
    var fileContents = fs.readFileSync(fileInPath, 'utf8')
    fileContents = fm(fileContents)

    page = utils.deepMerge(page, fileContents.attributes)

    if (page.draft) {
      if (config.env !== 'development') {
        return // dont process drafts if this is not development build
      } else {
        page.title += ' - Draft'
      }
    }

    if (fileExt === '.pug') {
      page.content = pug.processString(fileContents.body, fileInPath, page)
    } else {
      page.content = markdown.processString(fileContents.body)
    }

    // logger.debug(JSON.stringify(page))

    if (!page.layout) {
      page.layout = blog ? blog.config.layout : 'default'
    }

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

function getBlog (filepath, fileName) {
  var blog = null
  Object.keys(blogs.blogs).forEach(function (key) {
    if (filepath.startsWith(key) && fileName !== 'index') {
      blog = blogs.blogs[key]
    }
  })

  return blog
}

function processBlogsArchive (blog) {
  logger.info('Processing main archive..')
  processArchive(blog, blog.config['index'], false)
  Object.keys(blog.tags).forEach(function (tag) {
    logger.info('Processing tags archive for: ' + tag)
    processArchive(blog.tags[tag], blog.config['tags'], true)
  })
  Object.keys(blog.categories).forEach(function (category) {
    logger.info('Processing categories archive: ' + category)
    processArchive(blog.categories[category], blog.config['categories'], true)
  })
}

function processArchive (archive, archiveConfig, isTaxanomy) {
  var templateInPath = path.join(config.layouts, '_layout-' + archiveConfig.layout + '.pug')
  logger.debug('Layout is: ' + templateInPath)

  var pages = archive.posts.length / archiveConfig.paginate
  logger.debug('Total pages: ' + pages)

  for (var i = 0; i < pages; i++) {
    var fileOutDir = archiveConfig.dest
    var archivePath = archive.path
    var archiveURL = archive.url
    var nextPath = ''
    var prevPath = ''
    if (isTaxanomy) {
      fileOutDir = path.join(fileOutDir, archive.slug)
    }
    if (i !== (pages - 1)) {
      nextPath = archivePath + '/' + (i + 2)
    }
    if (i !== 0) {
      fileOutDir = path.join(fileOutDir, (i + 1) + '')
      prevPath = archivePath + '/' + (i === 1 ? '' : i)
      archivePath = archivePath + '/' + (i + 1)
      archiveURL = archiveURL + '/' + (i + 1)
    }
    var fileOutPath = path.join(fileOutDir, 'index.html')

    shell.mkdir('-p', fileOutDir)

    logger.debug('File out path: ' + fileOutPath)
    var page = { source: templateInPath, path: archivePath, url: archiveURL }
    page = utils.deepMerge(page, archiveConfig)
    if (isTaxanomy) {
      page.title = page.title.replace('%s', archive.title)
    }
    page.paginated = []
    for (var j = 0; j < archiveConfig.paginate; j++) {
      var index = (i * archiveConfig.paginate) + j
      if (index < archive.posts.length) {
        page.paginated.push(archive.posts[index])
      }
    }
    page.prevPath = prevPath
    page.nextPath = nextPath
    pug.processFile(templateInPath, fileOutPath, page, false)
    sitemap.addURLToSitemap(archiveURL)
  }
}
