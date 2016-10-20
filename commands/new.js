var logger = require('./../lib/logger')

var projecttype = 'web'
var projectname = 'mmpilot-web-project'
var isBare = false
var projectRoot = './'

exports.init = function (p, n, o) {
  projecttype = p
  projectname = n
  isBare = !!o.bare
  projectRoot = process.cwd()
}

exports.execute = function () {
  logger.info('Project: ' + projecttype)
  logger.info('Name: ' + projectname)
  logger.info('IsBare: ' + isBare)
  logger.info('Project Root: ' + projectRoot)
}
