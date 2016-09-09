var logger = require('./../lib/logger');
var mkdirp = require('mkdirp');
var path = require('path');

//Tasks required by this command
var html = require('./../tasks/html');
var clean = require('./../tasks/clean');

exports.execute = function() {
    var dest_path = path.join(global.config.project_root, global.config.project.dest);

    //Generate destination folder
    if(!mkdirp.sync(dest_path)) {
      //Folder already exists. Clean it
      clean.clean([dest_path + "/**", "!" + dest_path]);
    }

    //Generate HTML
    logger.info('Building HTML..');
    html.build();
};
