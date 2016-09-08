#!/usr/bin/env node

/**
 * Module dependencies.
 */
 var program = require('commander');
 var pkg = require('./package.json');

 program
   .version(pkg.version)
   .option('-b, --build', 'Builds the project')
   .parse(process.argv);

 if (program.build) console.log('Building..');
 console.log('Done');
