var logger = require('./../lib/logger');
var fs = require('fs');
var glob = require("glob");
var path = require('path');
var shell = require('shelljs');
var sm = require('sitemap')
var config = require('./../lib/config').config;

var markoc = require('marko/compiler');
var marko_hot_reload = require('marko/hot-reload');
// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();

var sitemap_urls = [];

exports.build = function() {
    markoc.configure({
        writeToDisk: false,
        preserveWhitespace: !config.minify
    });

    marko_hot_reload.enable();

    processDir(config.html);
    generateSiteMap(config.sitemap);
};

exports.buildFile = function(filepath) {
  var absolutePath = config.absolutePath(filepath);
  marko_hot_reload.handleFileModified(absolutePath);
  processTemplateFile(absolutePath);
}

function processDir(src) {
    var globMatch = path.join('/**/!(_)*.marko');
    var templateFiles = glob.sync(globMatch, {
        root: config.html
    });

    templateFiles.forEach(function(templatePath) {
        processTemplateFile(templatePath);
    });
}


function processTemplateFile(templatePath) {

    var templateRelativePath = path.relative(config.html, templatePath);
    var templateInPath = path.join(config.html, templateRelativePath);
    var templateOutDir = path.dirname(path.join(config.html_dest, templateRelativePath));
    var templateOutName = path.parse(templatePath).name + ".html";
    var templateOutPath = path.join(templateOutDir, templateOutName);

    logger.debug("Template In Path: " + templateInPath);
    logger.debug("Template Out Path: " + templateOutPath);

    addToSitemap(templateRelativePath, templateOutName, templateInPath);

    shell.mkdir('-p', templateOutDir);

    var template = require(templatePath);

    try {
        var out = fs.createWriteStream(templateOutPath, {
            encoding: 'utf8'
        });

        var data = {};
        template.render(data, out);
    } catch (e) {
        logger.error("Cant compile" + e);
    }
}

function addToSitemap(templateRelativePath, templateOutName, templateInPath) {
    var relativeURL = '/' + (path.dirname(templateRelativePath).replace(/\\/g, "/"));

    if (templateOutName != 'index.html') {
        relativeURL = relativeURL + '/' + templateOutName;
    }

    if(relativeURL == "/.") {
      relativeURL = "/";
    }

    logger.debug("Adding to sitemap: " + relativeURL + " orig: " + templateInPath);
    var sitemapURL = {
        url: relativeURL,
        lastmodrealtime: true,
        lastmodfile: templateInPath
    }

    sitemap_urls.push(sitemapURL);
}

function generateSiteMap(sitemap_path) {
    var sitemap = sm.createSitemap({
        hostname: config.url,
        urls: sitemap_urls
    });

    logger.debug("Generating sitemap at: " + sitemap_path);

    fs.writeFileSync(sitemap_path, sitemap.toString());
}
