var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var sitemap = require('./../lib/sitemap')
var config = require('./../config/config').config

var markdown = require('./../transforms/markdown.js')
var fm = require('front-matter')

var blogs = {}

exports.blogs = blogs

// Iterate through first level of directories in rootDir to find _blog.yml file
exports.init = function (rootDir) {
  markdown.init()

  utils.iterateFiles(rootDir, {dirs: true, recursive: false}, function (dir, name) {
    logger.debug('Checking folder for _blog.yml in: ' + dir)
    var blogConfigFile = path.join(dir, '_blog.yml')
    try {
      var blogConfig = fs.readFileSync(blogConfigFile, 'utf8')
      var thisBlog = {tags: {}, categories: {}}
      thisBlog.config = yaml.safeLoad(blogConfig)
      thisBlog.config.src = dir

      // Load all posts in this blog
      thisBlog.posts = loadPosts(dir, thisBlog.config.dest)

      // Iterate though each blog post and store based on tags and categories.
      for (var i = 0; i < thisBlog.posts.length; i++) {
        var post = thisBlog.posts[i]
        var tags = post.tags
        var categories = post.categories

        tags.forEach(function (tag) {
          var slug = slugify(tag)
          if (!thisBlog.tags[slug]) {
            thisBlog.tags[slug] = {title: tag, slug: slug, posts: []}
          }
          thisBlog.tags[slug].posts.push(post)
        })
        categories.forEach(function (category) {
          var slug = slugify(category)
          if (!thisBlog.categories[slug]) {
            thisBlog.categories[slug] = {title: category, slug: slug, posts: []}
          }
          thisBlog.categories[slug].posts.push(post)
        })
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
        var destDir = path.dirname(path.join(dest, name, 'index.html'))
        var postPath = sitemap.getRelativePath(path.relative(config.html.dest, destDir), name)
        var post = {slug: name, path: postPath, url: sitemap.getPageURL(postPath)}
        var fileContents = fs.readFileSync(file, 'utf8')
        fileContents = fm(fileContents)

        post = utils.deepMerge(post, fileContents.attributes)
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
