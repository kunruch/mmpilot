var logger = require('./../lib/logger');

//Tasks required by this command
var Html = require('./../tasks/html');

function Build() {
    this.name = "build";
}

var p = Build.prototype

p.execute = function() {
    logger.info('Building HTML files..');

    var html = new Html();
    html.build();
};

module.exports = Build;
