var logger = require('./../lib/logger')

var projecttype = 'web'
var isBare = false

exports.init = function (p, o) {
  projecttype = p
  isBare = !!o.bare
}

exports.execute = function () {
  logger.info('Project: ' + projecttype)
  logger.info('IsBare: ' + isBare)
}
