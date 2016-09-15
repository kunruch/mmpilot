var logger = require('./../lib/logger');
var sitemap = require('./../lib/sitemap')
var glob = require("glob");
var path = require('path');
var shell = require('shelljs');
var config = require('./../lib/config').config;
var transform = require('./../transforms/pug.js');

exports.watch_pattern = transform.watch_pattern;
exports.watch_dir = function() {
    return config.html.src; // export as function to get loaded result
};

exports.init = function() {
    transform.init();
}

exports.processAll = function() {
  logger.start("Processing HTML");

  processDir(false);
  sitemap.generateSiteMap(path.join(config.html.dest, config.html.sitemap));

  logger.end("Processing HTML");
};

exports.processFile = function(filepath) {
  if(path.parse(filepath).name.startsWith("_")) {
      //In case of files starting with '_', compile entire dir as they can be included from multiple sources
      //We can improve this to compile only files that are needed.
      logger.info("Partial file has been changed.. Processing all files.");
      processDir(true);
  }
  else {
    executeTransform(path.join(config.html.src, filepath), true);
  }
}

exports.processFileDeleted = function(filepath) {
    //Do nothing for now, a fresh build should not generate this file anyways
}

function processDir(incremental) {
  var templateFiles = glob.sync(transform.include_pattern, {
      root: config.html.src
  });

  templateFiles.forEach(function(templatePath) {
      executeTransform(templatePath, incremental);
  });
}

function executeTransform(filepath, incremental) {
    logger.info("Processing HTML template: " + filepath);

    var templateInPath = filepath;
    var templateRelativePath = path.relative(config.html.src, templateInPath);
    var templateOutDir = path.dirname(path.join(config.html.dest, templateRelativePath));
    var templateOutName = path.parse(templateInPath).name + ".html";
    var templateOutPath = path.join(templateOutDir, templateOutName);

    shell.mkdir('-p', templateOutDir);

    logger.debug("Template In Path: " + templateInPath);
    logger.debug("Template Out Path: " + templateOutPath);

    transform.processFile(templateInPath, templateOutPath, incremental);

    if (!incremental) {
        sitemap.addToSitemap(templateRelativePath, templateOutName, templateInPath);
    }
}
