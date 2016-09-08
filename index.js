#!/usr/bin/env node

var program = require('commander');
var chalk = require('chalk');

var Config = require('./lib/config');
var config = new Config();
config.load();

var Html = require('./tasks/html');
var html = new Html(config);


program
    .version(config.package.version)
    .option('-b, --build', 'Builds the project')
    .parse(process.argv);


if (program.build) {
    console.log(chalk.cyan('Building HTML files..'));
    html.build();
}
console.log(chalk.green('Done'));
