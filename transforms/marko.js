// marko is not currently used in MMPilot but is left here as an example of how to write alternative transforms

var logger = require('./../lib/logger');
var fs = require('fs');
var path = require('path');
var config = require('./../lib/config').config;

var markoc = require('marko/compiler');
var marko_hot_reload = require('marko/hot-reload');

exports.include_pattern = '/**/!(_)*.marko';
exports.watch_pattern = '**/*.marko';

exports.init = function () {
	marko_hot_reload.enable();

	// The following line installs the Node.js require extension
	// for `.marko` files. Once installed, `*.marko` files can be
	// required just like any other JavaScript modules.
	require('marko/node-require').install();

  markoc.configure({
      checkUpToDate: false,
      writeToDisk: false,
      preserveWhitespace: !config.minify
  });
}

exports.processFile = function(templateInPath, templateOutPath, page, incremental) {

		if(incremental) {
			//Allow marko to reload file if modified
			marko_hot_reload.handleFileModified(templateInPath);
		}

    var template = require(templateInPath);

    try {
        var out = fs.createWriteStream(templateOutPath, {
            encoding: 'utf8'
        });

        var data = { page: page, site: config.site };
        template.render(data, out);

    } catch (e) {
        logger.error("Cant compile" + e);
				process.exit(1);
    }
}
