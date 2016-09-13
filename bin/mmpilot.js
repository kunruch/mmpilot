#!/usr/bin/env node

var program = require('commander');
var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var chokidar = require('chokidar');

program
    .version(config.version)
    .option('-d, --dir <path>', 'Specify custom directory path to use instead of the current direcory')
    .option("-w, --watch", "Watch for changes and do incremental processing")
    .option("-v, --verbose", "Logs detailed messages")

var command;
var command_name;

program
    .command('build')
    .description('run build command')
    .action(function() {
        command_name = 'build';
        command = require('./../commands/build');
    });


program
    .command('deploy')
    .description('deploy built files to github pages branch')
    .action(function() {
        command_name = 'deploy';
        command = require('./../commands/deploy');
    });


program
    .command('serve')
    .description('Serves built files accesible via localhost:3001')
    .action(function() {
        command_name = 'serve';
        command = require('./../commands/serve');
    });

program.parse(process.argv);

if (command) {
    logger.start(command_name);
    //load user's config file if present
    if (config.load(program.dir, program.verbose)) {
        command.execute();
        logger.end(command_name);

        if(program.watch) {
          var watcher = chokidar.watch('**/*.marko', {
              ignored: config.dest,
              ignoreInitial: true,
              cwd: config.root,
          }).on('all', (event, filepath) => {
              logger.debug(event, filepath);
              command.executeOnFile(filepath);
          }).on('ready', function() {
              logger.debug('Watched paths:', watcher.getWatched());
          });
        }
    }
}
