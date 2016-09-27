var logger = require('./../lib/logger');
var glob = require("glob");
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var browserify = require('browserify');
var watchify = require('watchify');
var envify = require('envify/custom');
var config = require('./../lib/config').config;

var includePaths;
var bundler;

exports.init = function() {
    includePaths = ["node_modules/"]; //Add project's node_modules in include paths

    bundler = browserify({ debug: (config.env == 'development') }); //debug = true enables sourcemaps
}

exports.processAll = function(isWatch) {

    logger.start("Processing Scripts");


    if(config.scripts.browserify.entries.length < 1) {
      // simply copy src scripts to dest
      logger.info("Copying js files from: " + config.scripts.src + " to: " + config.scripts.dest);

      shell.mkdir('-p', config.scripts.dest);
  		shell.cp('-r', path.join(config.scripts.src, "*"), config.scripts.dest);

      logger.end("Processing Scripts");
    }
    else {
      //Compile with browserify
      var destPath = path.join(config.scripts.dest, config.scripts.browserify.out);
      var destDir = path.dirname(destPath);
      logger.debug("Out Path: " + destPath);

      config.scripts.browserify.entries.forEach(function(entry) {
        var sourcePath = path.join(config.scripts.src, entry);

        logger.info("Adding entry to browserify: " + sourcePath);

        bundler.add(sourcePath, {
          cache: {},
          packageCache: {}
        });
      });

      shell.mkdir('-p', destDir);

      //envify and uglify on production builds
      if(config.env == 'production') {
        bundler.transform(envify({
          _: 'purge',
          NODE_ENV: config.env
        }));
        bundler.transform({
          global: true
        }, 'uglifyify');
      }

      if(isWatch) {
        bundler.plugin(watchify);
        bundler.on('update', function() {
          bundle(destPath);
        });
      }

      bundler.on('log', function(message) {
        logger.info(destPath + " : " + message);
      })

      bundle(destPath);
    }

};

function bundle(destPath) {
  logger.info("Bundling to: " + destPath);
  var writeStream = fs.createWriteStream(destPath);
  bundler.bundle().pipe(writeStream);
  writeStream.on("finish", function() {
    logger.end("Processing Scripts");
  });
}
