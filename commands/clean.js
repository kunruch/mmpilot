var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var path = require('path');
var shell = require('shelljs');

//Cleans and regereantes directories specified in config
exports.execute = function() {
  logger.start("Clean");

  config.clean.forEach(function(dir) {
    // Clean Folder
    logger.info('Cleaning directory : ' + dir);
    shell.rm('-rf', path.join(dir, "*"));

    // Generate folder
    shell.mkdir('-p', dir);
  })


  logger.end("Clean");
}
