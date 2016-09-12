var logger = require('./../lib/logger');
var shell = require('shelljs');
var path = require('path');


//Tasks required by this command
var html = require('./../tasks/html');

exports.execute = function() {
    shell.config.verbose = global.config.project.debug;

    var dest_path = path.join(global.config.project_root, global.config.project.dest);
    var asset_src_path = path.join(global.config.project_root, global.config.project.assets, "*");

    // Clean destination Folder
    logger.log('Cleaning directory : ' + dest_path);
    shell.rm('-rf', path.join(dest_path, "*"));

    // Copy Asset files

    // Generate destination folder
    shell.mkdir('-p', dest_path);

    logger.log('Copying assets..');
    shell.cp('-r', asset_src_path, dest_path);

    // Generate HTML
    logger.info('Building HTML..');
    html.build();
};

exports.executeOnFile = function(filepath) {
    var absoluteFilepath = path.resolve(global.config.project_root, filepath);
    html.buildFile(absoluteFilepath);
}
