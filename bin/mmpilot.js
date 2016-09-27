#!/usr/bin/env node

var program = require('commander');
var config = require('./../lib/config').config;

function list(val) {
  return val.split(',');
}

program
    .version(config.package.version)
    .option('-c, --config <paths>', 'Specify custom config file(s) to use instead of looking for _mmpilot.yml in current direcory', list)
    .option('-d, --development', 'Specify a development build. This disables minification, generates sourcemaps and increases logging by mmpilot.');

var command;

program
    .command('clean')
    .description('Cleans output directories')
    .action(function() {
        command = require('./../commands/clean');
    });

program
    .command('build')
    .description('Executes build of project')
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
    .description('Serves built files accesible via localhost:3000')
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

if (!program.args.length) program.help();

if (command) {
    if (config.load(program.config, program.development)) {
        command.execute();
    }
}
