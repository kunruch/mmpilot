var logger = require('./../lib/logger')
var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')

var blogs = {}

exports.blogs = blogs

// Iterate through first level of directories in rootDir to find _blog.yml file
exports.init = function (rootDir) {
  try {
    var files = fs.readdirSync(rootDir)
    logger.debug('Found: ' + files.length + ' files')
    files.forEach(function (file, index) {
      var parsedPath = path.parse(file)
      var name = parsedPath.name
      var blogpath = path.join(rootDir, file)

      if (name.charAt(0) === '_') {
        logger.debug('Skipping file/folder: ' + blogpath)
      } else {
        if (fs.lstatSync(blogpath).isDirectory()) {
          logger.debug('Checking folder for _blog.yml: ' + blogpath)
          var blogConfigFile = path.join(blogpath, '_blog.yml')

          try {
            var blogConfig = fs.readFileSync(blogConfigFile, 'utf8')
            blogs[name] = yaml.safeLoad(blogConfig)
            blogs[name].src = blogpath
          } catch (e) {
            logger.debug('Error loading blog config: ' + e)
          }
        }
      }
    })
  } catch (e) {
    logger.debug('Error loading blogs: ' + e)
  }

  console.log(JSON.stringify(blogs))
}
