var logger = require('./../lib/logger');
var path = require('path');
var shell = require('shelljs');
var config = require('./../lib/config').config;

exports.watch_pattern = '**/*';
exports.watch_dir = function () {
  return config.assets.src; // export as function to get loaded result
};

exports.init = function () {
}

exports.processAll = function() {
    logger.start("Processing Assets");

    logger.info("Copying asset files from: " + config.assets.src + " to: " + config.assets.dest);
		shell.cp('-r', path.join(config.assets.src, "*"), config.assets.dest);

    logger.end("Processing Assets");
};

exports.processFile = function(filepath) {
    logger.info("Processing asset file " + filepath);
    shell.cp(path.join(config.assets.src, filepath), path.join(config.assets.dest, filepath));
}

exports.processFileDeleted = function(filepath) {
  //Delete destination file
  shell.rm(path.join(config.assets.dest, filepath));
}
