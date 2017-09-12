var logger = require('./../lib/logger')
var _ = require('lodash')
var path = require('path')
var shell = require('shelljs')

var projecttype = 'basic'
var projectdir = '.'
var bootstrapRoot = path.join(path.dirname(path.resolve(__dirname)), 'bootstrap-files')
var projectRoot = './'

exports.init = function (p, n, o) {
  projecttype = p
  projectdir = _.kebabCase(n)
  projectRoot = path.join(process.cwd(), projectdir)
}

exports.execute = function () {
  logger.start('Creating Project')

  logger.debug('Project Type: ' + projecttype)
  logger.debug('Directory: ' + projectdir)
  logger.debug('Project Root: ' + projectRoot)
  logger.debug('MMPilot Root: ' + bootstrapRoot)

  var gitRepoToClone = 'https://github.com/kunruch/mmpilot-basic-template.git'
  var gitCommand = 'git clone ' + gitRepoToClone + ' "' + projectRoot + '"'
  logger.info('Running: ' + gitCommand)

  if (shell.exec(gitCommand).code !== 0) {
    shell.echo('Error: Git clone failed')
    shell.exit(1);
  }
  else {
    shell.cd(projectdir)
    shell.exec('git remote rm origin') //delete origin to preven accidental push
    shell.rm('-rf', '.git')
  }
  logger.end('Creating Project')
}
