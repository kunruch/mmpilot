var logger = require('./../lib/logger');
var shell = require('shelljs');
var path = require('path');

shell.config.verbose = true;

//Tasks required by this command
var html = require('./../tasks/html');

exports.execute = function() {
    var dest_path = path.join(global.config.project_root, global.config.project.dest);

    // Clean destination Folder
    logger.log('Cleaning directory : ' + dest_path);
    shell.rm('-rf', path.join(dest_path, "*"));


    // Copy Asset files
    var asset_src_path = path.join(global.config.project_root, global.config.project.assets);
    var asset_dest_path = path.join(dest_path, global.config.project.assets);

    // Generate destination folder
    logger.log('Generating directory : ' + asset_dest_path);
    shell.mkdir('-p', dest_path);
    shell.mkdir('-p', asset_dest_path);

    logger.log('Copying assets from : ' + asset_src_path + " to : " + asset_dest_path);
    shell.cp('-r', path.join(asset_src_path), asset_dest_path);

    // Generate HTML
    logger.info('Building HTML..');
    html.build();
};
