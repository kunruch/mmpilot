var logger = require('./../lib/logger')
var fs = require('fs')
var config = require('./../config/config').config
var pug = require('pug')

exports.include_pattern = '/**/!(_)*.pug'
exports.watch_pattern = '**/*.pug'

var pugParams = {}

exports.init = function (data) {
  pugParams = {
    pretty: (config.env === 'development'),
    site: config.site,
    env: config.env,
    data: data
  }
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
