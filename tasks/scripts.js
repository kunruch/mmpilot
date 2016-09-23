var logger = require('./../lib/logger');
var glob = require("glob");
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var browserify = require('browserify');
var config = require('./../lib/config').config;

var includePaths;
var b; //browserify instance

exports.init = function() {
    includePaths = ["node_modules/"]; //Add project's node_modules in include paths

    b = browserify();
}

exports.processAll = function(isWatch) {
    logger.start("Processing Scripts");

    config.scripts.entries.forEach(function(entry) {
      var sourcePath = path.join(config.scripts.src, entry);
      var destPath = path.join(config.scripts.dest, entry);
      var destDir = path.dirname(destPath);

      logger.info("Processing script: " + sourcePath);
      logger.debug("Out Path: " + destPath);

      shell.mkdir('-p', destDir);

      b.add(sourcePath, {
        cache: {},
        packageCache: {}
      });

      if(isWatch) {
        //b.plugin(watchify);
        //b.on('update', bundle);
      }
      bundle(destPath);
    });
    logger.end("Processing Scripts");
};

function bundle(destPath) {
  b.bundle().pipe(fs.createWriteStream(destPath));
}
