var logger = require('./../lib/logger');
var shell = require('shelljs');
var path = require('path');
var config = require('./../lib/config').config;

//Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles')];

exports.execute = function() {
    logger.start("Build");

    // Clean destination Folder
    logger.info('Cleaning directory : ' + config.dest);
    shell.rm('-rf', path.join(config.dest, "*"));

    // Generate destination folder
    shell.mkdir('-p', config.dest);

    tasks.forEach(function(task) {
      task.init();
      task.processAll();
    });

    logger.end("Build");
};
