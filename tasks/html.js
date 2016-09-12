var logger = require('./../lib/logger');
var fs = require('fs');
var path = require('path');
var glob = require("glob");
var shell = require('shelljs');
var sm = require('sitemap')

var markoc = require('marko/compiler');
// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();
require('marko/hot-reload').enable();

var html_src_path, html_dest_path;
var sitemap_urls = [];

exports.build = function() {
    markoc.configure({
        writeToDisk: false,
        preserveWhitespace: !global.config.project.minify
    });

    html_src_path = path.join(global.config.project_root, global.config.project.html);
    html_dest_path = path.join(global.config.project_root, global.config.project.dest, global.config.project.html);

    processDir(html_src_path);
    generateSiteMap(path.join(html_dest_path, 'sitemap.xml'));
};

exports.buildFile = function(filepath) {
  require('marko/hot-reload').handleFileModified(filepath);
  processTemplateFile(filepath);
}

function processDir(src) {
    var globMatch = path.join('/**/!(_)*.marko');
    var templateFiles = glob.sync(globMatch, {
        root: html_src_path
    });

    templateFiles.forEach(function(templatePath) {
        processTemplateFile(templatePath);
    });
}


function processTemplateFile(templatePath) {

    var templateRelativePath = path.relative(html_src_path, templatePath);
    var templateInPath = path.join(html_src_path, templateRelativePath);
    var templateOutDir = path.dirname(path.join(html_dest_path, templateRelativePath));
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
        hostname: global.config.project.url,
        cacheTime: 600000, //600 sec (10 min) cache purge period
        urls: sitemap_urls
    });

    logger.debug("Generating sitemap at: " + sitemap_path);

    fs.writeFileSync(sitemap_path, sitemap.toString());
}
