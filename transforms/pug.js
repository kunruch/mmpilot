var logger = require('./../lib/logger')
var fs = require('fs')
var config = require('./../config/config').config
var pug = require('pug')

var pugParams = {}

exports.init = function (data) {
  pugParams = {
    pretty: (config.env === 'development'),
    site: config.site,
    env: config.env,
    data: data
  }
}

exports.processString = function (inString, filename, page) {
  pugParams.page = page
  pugParams.filename = filename
  var html = ''

  try {
    html = pug.render(inString, pugParams)
  } catch (e) {
    logger.error('Cant compile' + e)
    process.exit(1)
  }

  return html
}

exports.processFile = function (templateInPath, templateOutPath, page, incremental) {
  pugParams.page = page

  try {
    var html = pug.renderFile(templateInPath, pugParams)
    fs.writeFileSync(templateOutPath, html)
  } catch (e) {
    logger.error('Cant compile' + e)
    process.exit(1)
  }
}
