var logger = require('./../lib/logger');
var fs = require('fs');
var path = require('path');
var glob = require("glob");
var shell = require('shelljs');

var markoc = require('marko/compiler');
// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();

var html_src_path,html_dest_path;

exports.build = function() {
    markoc.configure({
        writeToDisk: false,
        preserveWhitespace: !global.config.project.minify
    });

    html_src_path = path.join(global.config.project_root, global.config.project.html);
    html_dest_path =path.join(global.config.project_root, global.config.project.dest, global.config.project.html);

    processDir(html_src_path);
};

function processDir(src) {
   var globMatch = path.join('/**/!(_)*.marko');
   var templateFiles = glob.sync(globMatch, { root: html_src_path });

   templateFiles.forEach(function(templatePath) {
     processTemplateFile(templatePath);
   });
}

function processTemplateFile(templatePath) {

  var templateRelativePath = path.relative(html_src_path, templatePath);
  var templateInPath = path.join(html_src_path, templateRelativePath);
  var templateOutDir = path.dirname(path.join(html_dest_path, templateRelativePath));
  var templateOutPath = path.join(templateOutDir, path.parse(templatePath).name + ".html");

  logger.debug("Template In Path: " + templateInPath);
  logger.debug("Template Out Path: " + templateOutPath);

  shell.mkdir('-p', templateOutDir);

  var template = require(templatePath);
  var out = fs.createWriteStream(templateOutPath, {
      encoding: 'utf8'
  });

  var data = {};

  try {
    template.render(data, out);
  }
  catch (e) {
    logger.error(e);
  }
}
