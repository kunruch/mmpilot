var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var dateFormat = require('dateformat')
var shell = require('shelljs')
var sitemap = require('./../lib/sitemap')
var config = require('./../config/config').config

var markdown = require('./../transforms/markdown.js')
var pug = require('./../transforms/pug.js')
var striptags = require('striptags')
var fm = require('front-matter')

var blogs = {}

// default blog config values
var blogConfig = {
  dest: '/',
  layout: 'default',
  permalink: 'default',
  dateFormat: 'mmmm d, yyyy',
  summaryLength: 255,
  index: {
    layout: 'default',
    paginate: 10,
    dest: '/'
  },
  tags: {
    layout: 'default',
    paginate: 10,
    title: 'Articles tagged %s',
    dest: 'tag'
  },
  categories: {
    layout: 'default',
    paginate: 10,
    title: '%s Archive',
    dest: 'category'
  },
  feed: {
    content: 'summary', // or full
    entries: 10
  }
}

exports.blogs = blogs

// Iterate through first level of directories in rootDir to find _blog.yml file
exports.init = function (rootDir, data) {
  markdown.init()
  pug.init(data, {}) // Only data is passed to blog posts.

  utils.iterateFiles(rootDir, {dirs: true, recursive: false}, function (dir, name) {
    logger.debug('Checking folder for _blog.yml in: ' + dir)
    var blogConfigFile = path.join(dir, '_blog.yml')
    try {
      var blogConfigContent = fs.readFileSync(blogConfigFile, 'utf8')
      var thisBlog = {tags: {}, categories: {}, config: loadBlogConfig(blogConfigContent, dir)}
      var destPath = path.dirname(path.join(thisBlog.config.index.dest, 'index.html'))

      thisBlog.path = '/' + path.relative(config.html.dest, destPath).replace(/\\/g, '/')
      thisBlog.url = sitemap.getPageURL(thisBlog.path)

      // Load all posts in this blog
      thisBlog.posts = loadPosts(dir, thisBlog)

      // Iterate though each blog post, parse and create new lists for tags and categories.
      for (var i = 0; i < thisBlog.posts.length; i++) {
        var post = thisBlog.posts[i]
        var tags = post.tags
        var categories = post.categories

        if (tags) {
          tags.forEach(function (tag) {
            var slug = tag.slug

            if (!thisBlog.tags[slug]) {
              // store a new object so that post.tags is not crowded with extra post list
              thisBlog.tags[slug] = {title: tag.title, slug: tag.slug, path: tag.path, url: tag.url, posts: []}
            }
            thisBlog.tags[slug].posts.push(post)
          })
        }
        if (categories) {
          categories.forEach(function (category) {
            var slug = category.slug
            if (!thisBlog.categories[slug]) {
              // store a new object so that post.categories is not crowded with extra post list
              thisBlog.categories[slug] = {title: category.title, slug: category.slug, path: category.path, url: category.url, posts: []}
            }
            thisBlog.categories[slug].posts.push(post)
          })
        }
      }
      blogs[name] = thisBlog
    } catch (e) {
      logger.debug('Error loading blog config: ' + e)
      // logger.error(e.stack.split('\n'))
    }
  })

  // logger.debug(JSON.stringify(blogs, null, 2))
}

function processPost (file, blog) {
  var post = {}
  logger.debug('Processing post: ' + file)
  var parsedPath = path.parse(file)
  var name = parsedPath.name
  var ext = parsedPath.ext
  try {
    var destPath = path.dirname(path.join(blog.config.dest, name, 'index.html'))
    var postPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), name)

    post = {slug: name, path: postPath, url: sitemap.getPageURL(postPath)}

    // console.log(JSON.stringify(post, null, 2))

    var fileContents = fs.readFileSync(file, 'utf8')
    fileContents = fm(fileContents)

    post = utils.deepMerge(post, fileContents.attributes)

    if (post.draft) {
      if (config.env !== 'development') {
        return null // dont process drafts if this is not development build
      } else {
        post.title += ' - Draft'
      }
    }

    // Transform content of post
    if (ext === '.pug') {
      post.content = pug.processString(fileContents.body, file, post)
    } else {
      post.content = markdown.processString(fileContents.body)
    }

    // format date of post
    post.date = dateFormat(post.date, blog.config.dateFormat)

    var plaintext = striptags(post.content).replace(/\r?\n|\r/g, ' ') // strip tags and replace new lines with space

    // Generate post summary
    post.summary = plaintext.substring(0, blog.config.summaryLength)
    if (post.content.length > blog.config.summaryLength) {
      post.summary += '...'
    }

    // Generate post description if not present. Hard limit 160
    if (!post.description) {
      post.description = plaintext.substring(0, 160)
    }

    var tags = post.tags
    var categories = post.categories

    if (tags) {
      var newtags = []
      tags.forEach(function (tag) {
        var slug = slugify(tag)
        var destPath = path.dirname(path.join(blog.config.tags.dest, slug, 'index.html'))
        var tagPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), slug)
        var tagURL = sitemap.getPageURL(tagPath)
        newtags.push({title: tag, slug: slug, path: tagPath, url: tagURL})
      })
      post.tags = newtags // replace tags list with more info
    }

    if (categories) {
      var newcategories = []
      categories.forEach(function (category) {
        var slug = slugify(category)
        var destPath = path.dirname(path.join(blog.config.categories.dest, slug, 'index.html'))
        var categoryPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), slug)
        var categoryURL = sitemap.getPageURL(categoryPath)
        newcategories.push({title: category, slug: slug, path: categoryPath, url: categoryURL})
      })
      post.categories = newcategories // replace categories list with more info
    }
  } catch (e) {
    logger.error('Error processing blog post: ' + e)
    process.exit(1)
  }

  return post
}

exports.processPost = processPost


exports.processBlogsArchive = function (blog) {
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

exports.getBlog = function (filepath, fileName) {
  var blog = null

  Object.keys(blogs).forEach(function (key) {
    if (filepath.startsWith(key) && fileName !== 'index') {
      blog = blogs[key]
    }
  })

  return blog
}

exports.getPost = function (blog, slug) {
  for (var i = 0; i < blog.posts.length; i++) {
    if (blog.posts[i].slug === slug) {
      return blog.posts[i]
    }
  }

  return null
}

function loadBlogConfig (blogConfigContent, dir) {
  var blogConfigYml = yaml.safeLoad(blogConfigContent)
  blogConfigYml = utils.deepMerge(blogConfig, blogConfigYml)
  blogConfigYml.dest = path.join(config.out, blogConfigYml.dest)
  // Generate dest directories
  var conf = ['index', 'tags', 'categories']
  conf.forEach(function (key) {
    // store path relative to the blog dest dir
    blogConfigYml[key].dest = path.join(blogConfigYml.dest, blogConfigYml[key].dest)
  })
  blogConfigYml.src = dir
  return blogConfigYml
}

function loadPosts (dir, blog) {
  var posts = []
  utils.iterateFiles(dir, {ext: ['.pug', '.md']}, function (file, name, ext) {
    if (name !== 'index') {
      var post = processPost(file, blog)
      if (post) {
        posts.push(post)
      }
    }
  })
  return posts
}

function processArchive (archive, archiveConfig, isTaxonomy) {
  var templateInPath = path.join(config.layouts, '_layout-' + archiveConfig.layout + '.pug')
  logger.debug('Layout is: ' + templateInPath)

  var pages = archive.posts.length / archiveConfig.paginate
  if (archive.posts.length === 0 && !isTaxonomy) {
    pages = 1 // Generate the main idex page even when no posts are present
  }
  logger.debug('Total pages: ' + pages)

  for (var i = 0; i < pages; i++) {
    var fileOutDir = archiveConfig.dest
    var archivePath = archive.path
    var archiveURL = archive.url
    var nextPath = ''
    var prevPath = ''
    if (isTaxonomy) {
      fileOutDir = path.join(fileOutDir, archive.slug)
    }
    if (i !== (pages - 1)) {
      nextPath = archivePath + '/page/' + (i + 2)
    }
    if (i !== 0) {
      fileOutDir = path.join(fileOutDir, 'page', (i + 1) + '')
      prevPath = i === 1 ? archivePath : archivePath + '/page/' + i
      archivePath = archivePath + '/page/' + (i + 1)
      archiveURL = archiveURL + '/page/' + (i + 1)
    }
    var fileOutPath = path.join(fileOutDir, 'index.html')

    shell.mkdir('-p', fileOutDir)

    logger.debug('File out path: ' + fileOutPath)
    var page = { source: templateInPath, path: archivePath, url: archiveURL }
    page = utils.deepMerge(page, archiveConfig)
    if (isTaxonomy) {
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
    if (i === 0) {
      sitemap.addURLToSitemap(archiveURL) // Only include first index page in sitemap
    }
  }
}

function slugify (string) {
  return string.toLowerCase().split(' ').join('-')
}
