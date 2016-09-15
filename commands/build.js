var logger = require('./../lib/logger');
var path = require('path');

//Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles')];

exports.execute = function() {
    logger.start("Build");

    tasks.forEach(function(task) {
      task.init();
      task.processAll();
    });

    logger.end("Build");
};
