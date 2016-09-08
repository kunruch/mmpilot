#!/usr/bin/env node

var program = require('commander');

var logger = require('./lib/logger');

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
    logger.info('Building HTML files..');
    html.build();
}
logger.done('Done');
