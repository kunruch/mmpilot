var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var browserSync = require("browser-sync").create();

exports.execute = function() {
		logger.info("Starting webserver..");
    // Start the server
    browserSync.init({
        server: config.dest
    });
}
