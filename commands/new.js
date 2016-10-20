var logger = require('./../lib/logger')
var _ = require('lodash')
var path = require('path')

var projecttype = 'web'
var projectname = 'mmpilot-web-project'
var mmpilotRoot = path.join(path.dirname(path.resolve(__dirname)), 'bootstrap-files')
var isBare = false
var projectRoot = './'

exports.init = function (p, n, o) {
  projecttype = p
  projectname = _.kebabCase(n)
  isBare = !!o.bare
  projectRoot = process.cwd()
}

exports.execute = function () {
  logger.debug('Project: ' + projecttype)
  logger.debug('Name: ' + projectname)
  logger.debug('IsBare: ' + isBare)
  logger.debug('Project Root: ' + projectRoot)
  logger.debug('MMPilot Root: ' + mmpilotRoot)
}
