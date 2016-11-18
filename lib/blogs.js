var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var dateFormat = require('dateformat')
var sitemap = require('./../lib/sitemap')
var config = require('./../config/config').config

var markdown = require('./../transforms/markdown.js')
var pug = require('./../transforms/pug.js')
var striptags = require('striptags')
var fm = require('front-matter')

var blogs = {}

exports.blogs = blogs

// Iterate through first level of directories in rootDir to find _blog.yml file
exports.init = function (rootDir, data) {
  markdown.init()
  pug.init(data, {}) // Only data is passed to blog posts.

  utils.iterateFiles(rootDir, {dirs: true, recursive: false}, function (dir, name) {
    logger.debug('Checking folder for _blog.yml in: ' + dir)
    var blogConfigFile = path.join(dir, '_blog.yml')
    try {
      var blogConfig = fs.readFileSync(blogConfigFile, 'utf8')
      var thisBlog = {tags: {}, categories: {}}
      thisBlog.config = yaml.safeLoad(blogConfig)
      if (!thisBlog.config.dateFormat) {
        thisBlog.config.dateFormat = 'mmmm d, yyyy'
      }
      if (!thisBlog.config.summaryLength) {
        thisBlog.config.summaryLength = 255
      }
      thisBlog.config.src = dir
      var destPath = path.dirname(path.join(thisBlog.config.dest, 'index.html'))
      thisBlog.path = '/' + path.relative(config.html.dest, destPath).replace(/\\/g, '/')
      thisBlog.url = sitemap.getPageURL(thisBlog.path)

      // Load all posts in this blog
      thisBlog.posts = loadPosts(dir, thisBlog.config.dest)

      // Iterate though each blog post, parse and store new values and create new lists for on tags and categories.
      for (var i = 0; i < thisBlog.posts.length; i++) {
        var post = thisBlog.posts[i]
        var tags = post.tags
        var categories = post.categories

        // format date of post
        post.date = dateFormat(post.date, thisBlog.config.dateFormat)
        // Generate post summary
        post.summary = striptags(post.content).substring(0, thisBlog.config.summaryLength)
        if (post.content.length > thisBlog.config.summaryLength) {
          post.summary += '...'
        }

        var newtags = []
        tags.forEach(function (tag) {
          var slug = slugify(tag)
          var destPath = path.dirname(path.join(thisBlog.config.tags.dest, slug, 'index.html'))
          var tagPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), slug)
          var tagURL = sitemap.getPageURL(tagPath)
          newtags.push({title: tag, slug: slug, path: tagPath, url: tagURL})

          if (!thisBlog.tags[slug]) {
            thisBlog.tags[slug] = {title: tag, slug: slug, path: tagPath, url: tagURL, posts: []}
          }
          thisBlog.tags[slug].posts.push(post)
        })
        post.tags = newtags // replace tags list with more info

        var newcategories = []
        categories.forEach(function (category) {
          var slug = slugify(category)
          var destPath = path.dirname(path.join(thisBlog.config.categories.dest, slug, 'index.html'))
          var categoryPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), slug)
          var categoryURL = sitemap.getPageURL(categoryPath)
          newcategories.push({title: category, slug: slug, path: categoryPath, url: categoryURL})

          if (!thisBlog.categories[slug]) {
            thisBlog.categories[slug] = {title: category, slug: slug, path: categoryPath, url: categoryURL, posts: []}
          }
          thisBlog.categories[slug].posts.push(post)
        })
        post.categories = newcategories // replace categories list with more info
      }
      blogs[name] = thisBlog
    } catch (e) {
      logger.debug('Error loading blog config: ' + e)
    }
  })

  console.log(JSON.stringify(blogs, null, 2))
}

function loadPosts (dir, dest) {
  var posts = []
  utils.iterateFiles(dir, {ext: ['.pug', '.md']}, function (file, name, ext) {
    if (name !== 'index') {
      logger.debug('Processing post: ' + file)
      try {
        var destPath = path.dirname(path.join(dest, name, 'index.html'))
        var postPath = sitemap.getRelativePath(path.relative(config.html.dest, destPath), name)
        var post = {slug: name, path: postPath, url: sitemap.getPageURL(postPath)}
        var fileContents = fs.readFileSync(file, 'utf8')
        fileContents = fm(fileContents)

        post = utils.deepMerge(post, fileContents.attributes)

        // Transform content of post
        if (ext === '.pug') {
          post.content = pug.processString(fileContents.body, file, post)
        } else {
          post.content = markdown.processString(fileContents.body)
        }

        posts.push(post)
      } catch (e) {
        logger.error('Error processing blog post: ' + e)
        process.exit(1)
      }
    }
  })
  return posts
}

function slugify (string) {
  return string.toLowerCase().split(' ').join('-')
}
