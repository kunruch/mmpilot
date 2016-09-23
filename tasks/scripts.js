var logger = require('./../lib/logger');
var glob = require("glob");
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var browserify = require('browserify');
var watchify = require('watchify');
var config = require('./../lib/config').config;

var includePaths;
var b; //browserify instance

exports.init = function() {
    includePaths = ["node_modules/"]; //Add project's node_modules in include paths

    b = browserify();
}

exports.processAll = function(isWatch) {
    if(config.scripts.entries.length < 1) {
      return;
    }

    logger.start("Processing Scripts");

    var destPath = path.join(config.scripts.dest, config.scripts.out);
    var destDir = path.dirname(destPath);
    logger.debug("Out Path: " + destPath);

    config.scripts.entries.forEach(function(entry) {
      var sourcePath = path.join(config.scripts.src, entry);

      logger.info("Processing script: " + sourcePath);

      b.add(sourcePath, {
        cache: {},
        packageCache: {},
        debug: config.sourcemaps
      });
    });

    shell.mkdir('-p', destDir);

    if(isWatch) {
      b.plugin(watchify);
      b.on('update', function() {
        bundle(destPath);
      });
    }

    b.on('log', function(message) {
      logger.info(destPath + " : " + message);
    })

    bundle(destPath);

    logger.end("Processing Scripts");
};

function bundle(destPath) {
  b.bundle().pipe(fs.createWriteStream(destPath));
}
