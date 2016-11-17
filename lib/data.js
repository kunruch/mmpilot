var logger = require('./../lib/logger')
var utils = require('./../lib/utils')
var fs = require('fs')
var requireFromString = require('require-from-string')
var yaml = require('js-yaml')

function loadData (dataroot) {
  var data = {}

  // iterate through files
  if (dataroot.length !== 0) {
    logger.debug('Loading data from ' + dataroot)
    utils.iterateFiles(dataroot, {ext: ['.js', '.yml', '.yaml'], dirs: true, recursive: false}, function (path, name, ext) {
      if (!ext) {
        // recursively load data from this directory
        data[name] = loadData(path)
      } else if (ext === '.js') {
        try {
          data[name] = requireFromString(fs.readFileSync(path, 'utf8'), path).data()
        } catch (e) {
          logger.debug('Error loading data: ' + e)
        }
      } else if (ext === '.yml' || ext === '.yaml') {
        try {
          data[name] = yaml.safeLoad(fs.readFileSync(path, 'utf8'))
        } catch (e) {
          logger.debug('Error loading data: ' + e)
        }
      }
    })
  }
  // console.log('DATA: ' + JSON.stringify(data))
  return data
}

exports.loadData = loadData
