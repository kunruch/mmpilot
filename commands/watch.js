var logger = require('./../lib/logger');
var path = require('path');
var config = require('./../lib/config').config;
var chokidar = require('chokidar');

//Tasks required by this command
var tasks = [require('./../tasks/marko')];

exports.execute = function() {
    logger.info("Setting up Watch..");

    tasks.forEach(function(task) {
        task.init();
        chokidar.watch(task.watch_pattern, {
            ignored: config.dest,
            ignoreInitial: true,
            cwd: task.watch_dir(),
        }).on('all', (event, filepath) => {
            logger.debug(event, filepath);
            task.processFile(filepath);
        }).on('ready', function() {
            logger.info("Ready to watch for changes in " + path.join(task.watch_dir(), task.watch_pattern));
            logger.debug("Watched paths:", this.getWatched());
        });
    });
};
