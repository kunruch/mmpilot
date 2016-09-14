var logger = require('./../lib/logger');
var fs = require('fs');
var path = require('path');
var config = require('./../lib/config').config;
var pug = require('pug');

exports.include_pattern = '/**/!(_)*.pug';
exports.watch_pattern = '**/*.pug';

var pugParams = {};

exports.init = function () {
	pugParams = {
		pretty:  !config.minify,
		site: config
	}
}

exports.processFile = function(templateInPath, templateOutPath, incremental) {
    try {
				var html = pug.renderFile(templateInPath, pugParams);
				fs.writeFileSync(templateOutPath, html);

    } catch (e) {
        logger.error("Cant compile" + e);
				process.exit(1);
    }
}
