var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var path = require('path');
var fs = require('fs');
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
    if(config.serve.proxy.length > 0) {
        if(config.serve.delay > 0) {
          logger.info("Waiting for " + config.serve.delay + "ms");
        }
        setTimeout(function() {
          browserSync.init({
            proxy: config.serve.proxy
          });
        }, parseInt(config.serve.delay));
    }
    else {
      browserSync.init({
          	server: config.html.dest,
  					middleware: [require("connect-logger")()]
  		    },
  				function (err, bs) {
  					var status = 404;
  					var file = path.join(config.html.dest, "404.html");

  					//In case of app mode, we will serve index.html
  					if(config.serve.mode == 'app') {
  						status = 200;
  						file = path.join(config.html.dest, "index.html");
  					}

  					bs.addMiddleware("*", function (req, res) {
  						fs.stat(file, function(err, stat) {
  						    if(err == null) {
  						        // file exists
  										res.writeHead(status, {"Content-Type": "text/html"});
  										fs.createReadStream(file).pipe(res);
  						    } else if(err.code == 'ENOENT') {
  						        // file does not exist
  										res.writeHead(404, {"Content-Type": "text/plain"});
  										res.write("Not Found: " + req.url);
  										res.end();
  						    } else {
  						        logger.error('Error while serving files: ', err.code);
  						    }
  						});

  					});
				});
      }
}
