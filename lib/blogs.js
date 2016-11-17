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
      blogs[name] = yaml.safeLoad(blogConfig)
      blogs[name].src = dir

      // Iterate though each blog post and store it.
      blogs[name].posts = loadPosts(dir, blogs[name].dest)
    } catch (e) {
      logger.debug('Error loading blog config: ' + e)
    }
  })

  console.log(JSON.stringify(blogs))
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

