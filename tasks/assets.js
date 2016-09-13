var logger = require('./../lib/logger');
var path = require('path');
var shell = require('shelljs');
var config = require('./../lib/config').config;

exports.init = function () {
}

exports.processAll = function() {
    logger.info("Processing asset files..");
		shell.cp('-r', path.join(config.assets, "*"), config.dest);
};

exports.processFile = function(filepath) {
    logger.info("Processing asset file: " + filepath);
		shell.cp(path.join(config.assets, filepath), config.assets_dest);
}
