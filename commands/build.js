var path = require('path')
var config = require('./../config/config').config
var sitemap = require('./../lib/sitemap')

// Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles'), require('./../tasks/scripts')]

exports.execute = function () {
  tasks.forEach(function (task) {
    task.init()
    task.processAll()
  })

  if (config.html.sitemap.length > 0) {
    sitemap.generateSiteMap(path.join(config.html.dest, config.html.sitemap))
  }
}
