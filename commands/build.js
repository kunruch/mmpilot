var logger = require('./../lib/logger');
var shell = require('shelljs');
var path = require('path');
var config = require('./../lib/config').config;


//Tasks required by this command
var html = require('./../tasks/html');

exports.execute = function() {
    // Clean destination Folder
    logger.log('Cleaning directory : ' + config.dest);
    shell.rm('-rf', path.join(config.dest, "*"));

    // Copy Asset files

    // Generate destination folder
    shell.mkdir('-p', config.dest);

    logger.log('Copying assets..');
    shell.cp('-r', config.assets, config.dest);

    // Generate HTML
    logger.info('Building HTML..');
    html.build();
};

exports.executeOnFile = function(filepath) {
    html.buildFile(filepath);
}
