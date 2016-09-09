var logger = require('./../lib/logger');
var mkdirp = require('mkdirp');
var path = require('path');

//Tasks required by this command
var Html = require('./../tasks/html');

function Build() {
    this.name = "build";
}

var p = Build.prototype

p.execute = function() {
    var dest_path = path.join(global.config.project_root, global.config.project.dest);

    //Generate destination folder
    mkdirp.sync(dest_path);

    //Generate HTML
    logger.info('Building HTML..');

    var html = new Html();
    html.build();
};

module.exports = Build;
