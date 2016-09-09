#!/usr/bin/env node

var program = require('commander');
var logger = require('./../lib/logger');
var Config = require('./../lib/config');

global.config = new Config(); //Global variable so that we don't have to pass this to all tasks and commands

program
    .version(global.config.package.version)
    .option('-c, --config <path>', 'Specify custom config path')

var Command;

program
    .command('build')
    .description('run build command')
    .action(function() {
        Command = require('./../commands/build');
    });

program.parse(process.argv);

if (Command) {
    //load user's config file if present
    if (config.load(program.config)) {
        var command = new Command();
        command.execute();
        logger.done('Done');
    }
}
