var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var path = require('path');
var browserSync = require("browser-sync").create();

exports.execute = function() {
		logger.info("Starting webserver..");

		// Listen to change events on HTML and reload
		browserSync.watch(path.join(config.html.dest, "**/*.html")).on("change", browserSync.reload);

		// Listen to change events on JS and reload
		browserSync.watch(path.join(config.scripts.dest, "**/*.js")).on("change", browserSync.reload);

		// Provide a callback to capture ALL events to CSS
		// files - then filter for 'change' and reload all
		// css files on the page.
		browserSync.watch(path.join(config.styles.dest, "**/*.css"), function (event, file) {
		    if (event === "change") {
		        browserSync.reload("*.css");
		    }
		});

    // Start the server
    browserSync.init({
        server: config.html.dest
    });
}
