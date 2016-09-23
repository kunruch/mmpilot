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

    logger.start("Processing Scripts");


    if(config.scripts.browserify.entries.length < 1) {
      // simply copy src scripts to dest
      logger.info("Copying js files from: " + config.assets.src + " to: " + config.assets.dest);

      shell.mkdir('-p', config.assets.dest);
  		shell.cp('-r', path.join(config.scripts.src, "*"), config.scripts.dest);

    }
    else {
      //Compile with browserify
      var destPath = path.join(config.scripts.dest, config.scripts.browserify.out);
      var destDir = path.dirname(destPath);
      logger.debug("Out Path: " + destPath);

      config.scripts.browserify.entries.forEach(function(entry) {
        var sourcePath = path.join(config.scripts.src, entry);

        logger.info("Adding entry to browserify: " + sourcePath);

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
    }

    logger.end("Processing Scripts");
};

function bundle(destPath) {
  logger.info("Bundling to: " + destPath);
  b.bundle().pipe(fs.createWriteStream(destPath));
}
