#!/usr/bin/env node

/**
 * Module dependencies.
 */
//External modules
var program = require('commander');

// Our modules
var html = require('./html');
var pkg = require('./package.json');

program
    .version(pkg.version)
    .option('-b, --build', 'Builds the project')
    .parse(process.argv);


if (program.build) {
    console.log('Building HTML files..');
    html.build();
}
console.log('Done');
