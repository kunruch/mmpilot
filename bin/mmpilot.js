#!/usr/bin/env node

var program = require('commander');
var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var chokidar = require('chokidar');

program
    .version(config.version)
    .option('-d, --dir <path>', 'Specify custom directory path to use instead of the current direcory')
    .option("-w, --watch", "Watch for changes and do incremental build")

var command;

program
    .command('build')
    .description('run build command')
    .action(function() {
        command = require('./../commands/build');
    });


program
    .command('deploy')
    .description('deploy built files to github pages branch')
    .action(function() {
        command = require('./../commands/deploy');
    });


program
    .command('serve')
    .description('Serves built files accesible via localhost:3001')
    .action(function() {
        command = require('./../commands/serve');
    });

program.parse(process.argv);

if (command) {
    //load user's config file if present
    if (config.load(program.dir)) {
        command.execute();
        logger.done('Done');

        if(program.watch) {
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
}
