var logger = require('./../lib/logger');
var path = require('path');
var config = require('./../lib/config').config;
var chokidar = require('chokidar');

//Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles')];

exports.execute = function() {
    logger.info("Setting up Watch..");

    tasks.forEach(function(task) {
        task.init();
        chokidar.watch(task.watch_pattern, {

                ignored: config.dest,
                ignoreInitial: true,
                cwd: task.watch_dir(),

            }).on('add', (filepath) => {

                logger.info(filepath + " added..");
                task.processFile(filepath);

            }).on('change', (filepath) => {

                logger.info(filepath + " changed..");
                task.processFile(filepath);

            }).on('unlink', (filepath) => {

                logger.info(filepath + " deleted..");
                task.processFileDeleted(filepath);

            })
            .on('addDir', path => logger.info('Directory has been added. A rebuild is recommended.'))
            .on('unlinkDir', path => logger.info('Directory has been removed. A rebuild is recommended.'))
            .on('ready', function() {

                logger.info("Ready to watch for changes in " + path.join(task.watch_dir(), task.watch_pattern));
                logger.debug("Watched paths:", this.getWatched());

            }).on('error', error => logger.error('Watcher error! A rebuild is recommended. Error: ' + error));
    });
};
