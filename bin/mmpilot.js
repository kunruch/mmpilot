#!/usr/bin/env node

var program = require('commander');
var config = require('./../lib/config').config;

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

program
    .command('watch')
    .description('Watch for file changes and do incremental build')
    .action(function() {
        command = require('./../commands/watch');
    });

program
    .command('serve')
    .description('Serves built files accesible via localhost:3001')
    .action(function() {
        command = require('./../commands/serve');
    });

program
    .command('deploy')
    .description('deploy built files to github pages branch')
    .action(function() {
        command = require('./../commands/deploy');
    });

program.parse(process.argv);

if (command) {
    if (config.load(program.dir)) {
        command.execute();
    }
}
