var logger = require('./../lib/logger')
var fs = require('fs')
var path = require('path')
var requireFromString = require('require-from-string')
var yaml = require('js-yaml')

function loadData (dataroot) {
  var data = {}

  // iterate through files
  if (dataroot.length !== 0) {
    logger.debug('Loading data from ' + dataroot)
    try {
      var files = fs.readdirSync(dataroot)
      logger.debug('Found: ' + files.length + ' data files')
      files.forEach(function (file, index) {
        var parsedPath = path.parse(file)
        var name = parsedPath.name
        var ext = parsedPath.ext
        var datapath = path.join(dataroot, file)

        if (name.charAt(0) === '_') {
          logger.debug('Skipping data file/folder: ' + datapath)
        } else {
          if (fs.lstatSync(datapath).isDirectory()) {
            // recursively load data from this directory
            data[name] = loadData(datapath)
          } else {
            logger.debug('Loading data file: ' + datapath)

            var dataFile = fs.readFileSync(datapath, 'utf8')

            if (ext === '.js') {
              data[name] = requireFromString(dataFile, datapath).data()
            } else if (ext === '.yml' || ext === '.yaml') {
              data[name] = yaml.safeLoad(dataFile)
            }
          }
        }
      })
    } catch (e) {
      logger.debug('Error loading data: ' + e)
    }
  }

  // console.log('DATA: ' + JSON.stringify(data))
  return data
}

exports.loadData = loadData
