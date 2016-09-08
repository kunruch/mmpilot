#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander');
var fs = require('fs');
var pkg = require('./package.json');
var markoc = require('marko/compiler');

markoc.configure({ writeToDisk: false, preserveWhitespace:true });

program
    .version(pkg.version)
    .option('-b, --build', 'Builds the project')
    .parse(process.argv);

// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();

if (program.build) {
    console.log('Building..');
    var template = require('./web/index.marko');
    var out = fs.createWriteStream('public/index.html', {
        encoding: 'utf8'
    });

    // Render the template to 'index.html'
    template.render({
        name: 'Frank',
        count: 30
    }, out);
}
console.log('Done');
