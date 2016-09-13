var logger = require('./../lib/logger');
var path = require('path');
var shell = require('shelljs');
var config = require('./../lib/config').config;

exports.watch_pattern = '**/*';
exports.watch_dir = function () {
  return config.assets; // export as function to get loaded result
};

exports.init = function () {
}

exports.processAll = function() {
    logger.info("Processing asset files..");
		shell.cp('-r', path.join(config.assets, "*"), config.assets_dest);
};

exports.processFile = function(filepath) {
    logger.info("Processing asset file " + filepath);
    shell.cp(path.join(config.assets, filepath), path.join(config.assets_dest, filepath));
}

exports.processSourceDeleted = function(filepath) {
  //Delete destination file
  shell.rm(path.join(config.assets_dest, filepath));
}
