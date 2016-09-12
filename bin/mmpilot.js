#!/usr/bin/env node

var program = require('commander');
var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var chokidar = require('chokidar');

program
    .version(config.version)
    .option('-d, --dir <path>', 'Specify custom directory path to use instead of the current direcory')

var command;

program
    .command('build')
    .description('run build command')
    .action(function() {
        command = require('./../commands/build');
    });

program.parse(process.argv);

if (command) {
    //load user's config file if present
    if (config.load(program.dir)) {
        command.execute();
        logger.done('Done');

        var watcher = chokidar.watch('**/*.marko', {
            ignored: config.dest,
            ignoreInitial: true,
            cwd: config.root,
        }).on('all', (event, filepath) => {
            console.log(event, filepath);
            command.executeOnFile(filepath);
        }).on('ready', function() {
            console.log('Watched paths:', watcher.getWatched());
        });
    }
}
