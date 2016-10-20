var logger = require('./../lib/logger')
var _ = require('lodash')
var path = require('path')
var shell = require('shelljs')

var projecttype = 'web'
var projectname = 'mmpilot-web-project'
var bootstrapRoot = path.join(path.dirname(path.resolve(__dirname)), 'bootstrap-files')
var includeMMCSS = false
var projectRoot = './'

exports.init = function (p, n, o) {
  projecttype = p
  projectname = _.kebabCase(n)
  includeMMCSS = !!o.mmcss
  projectRoot = path.join(process.cwd(), projectname)
}

exports.execute = function () {
  logger.start('Creating Project')

  logger.debug('Project: ' + projecttype)
  logger.debug('Name: ' + projectname)
  logger.debug('Include MMCSS: ' + includeMMCSS)
  logger.debug('Project Root: ' + projectRoot)
  logger.debug('MMPilot Root: ' + bootstrapRoot)

  logger.info('Copying files from: ' + bootstrapRoot + ' to: ' + projectRoot)

  shell.mkdir('-p', projectRoot)
  shell.cp('-r', path.join(bootstrapRoot, '*'), projectRoot)

  logger.end('Creating Project')
}
