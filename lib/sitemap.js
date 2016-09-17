var logger = require('./../lib/logger');
var sm = require('sitemap');
var path = require('path');
var url = require('url');
var config = require('./../lib/config').config;
var fs = require('fs');


var sitemap_urls = [];

exports.getRelativePath = function(relativePath, outName) {
  var relativeURL = '/' + (path.dirname(relativePath).replace(/\\/g, "/"));

  if (outName != 'index.html') {
      relativeURL = relativeURL + '/' + outName;
  }

  if(relativeURL == "/.") {
    relativeURL = "/";
  }

  return relativeURL;
}

exports.getPageURL = function(path) {
  return url.resolve(config.site.url, path);
}

exports.addToSitemap = function(relativePath, outName, inPath) {

    relativeURL = exports.getRelativePath(relativePath, outName);

    logger.debug("Adding to sitemap: " + relativeURL + " orig: " + inPath);
    var sitemapURL = {
        url: relativeURL,
        lastmodrealtime: true,
        lastmodfile: inPath
    }

    sitemap_urls.push(sitemapURL);
}

exports.generateSiteMap = function(sitemap_path) {
    var sitemap = sm.createSitemap({
        hostname: config.site.url,
        urls: sitemap_urls
    });

    logger.info("Generating sitemap at: " + sitemap_path);

    fs.writeFileSync(sitemap_path, sitemap.toString());
}
