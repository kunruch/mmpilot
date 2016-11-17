var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')

var blogs = {}

exports.blogs = blogs

// Iterate through first level of directories in rootDir to find _blog.yml file
exports.init = function (rootDir) {
  utils.iterateFiles(rootDir, {dirs: true, recursive: false}, function (dir, name) {
    logger.debug('Checking folder for _blog.yml in: ' + dir)
    var blogConfigFile = path.join(dir, '_blog.yml')
    try {
      var blogConfig = fs.readFileSync(blogConfigFile, 'utf8')
      blogs[name] = yaml.safeLoad(blogConfig)
      blogs[name].src = dir

      // Iterate though each blog post and store it.
      blogs[name].posts = loadPosts(dir)
    } catch (e) {
      logger.debug('Error loading blog config: ' + e)
    }
  })

  console.log(JSON.stringify(blogs))
}

function loadPosts (dir) {
  var posts = []

  return posts
}

