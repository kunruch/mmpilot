#!/usr/bin/env node

/**
 * Module dependencies.
 */
//External modules
var program = require('commander');
var chalk = require('chalk');

// Our modules
var html = require('./html');
var pkg = require('./package.json');

program
    .version(pkg.version)
    .option('-b, --build', 'Builds the project')
    .parse(process.argv);


if (program.build) {
    console.log(chalk.cyan('Building HTML files..'));
    html.build();
}
console.log(chalk.green('Done'));
