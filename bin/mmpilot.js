#!/usr/bin/env node

var program = require('commander');
var logger = require('./../lib/logger');
var Config = require('./../lib/config');
var chokidar = require('chokidar');

global.config = new Config(); //Global variable so that we don't have to pass this to all tasks and commands

program
    .version(global.config.package.version)
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
            ignored: global.config.project.dest,
            ignoreInitial: true,
            cwd: global.config.project_root,
        }).on('all', (event, filepath) => {
            console.log(event, filepath);
            command.executeOnFile(filepath);
        }).on('ready', function() {
            console.log('Watched paths:', watcher.getWatched());
        });
    }
}
