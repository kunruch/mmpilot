var logger = require('./../lib/logger')
var sm = require('sitemap')
var path = require('path')
var url = require('url')
var config = require('./../config/config').config
var fs = require('fs')

var sitemapUrls = []

exports.getRelativePath = function (relativePath, outName) {
  var relativeURL = '/' + (path.dirname(relativePath).replace(/\\/g, '/'))

  if (relativeURL === '/.') {
    relativeURL = '/'
  }

  if (outName !== 'index.html') {
    relativeURL = relativeURL + '/' + outName
  }

  return relativeURL
}

exports.getPageURL = function (path) {
  return url.resolve(config.site.url, path)
}

exports.addToSitemap = function (relativePath, outName, inPath) {
  var relativeURL = exports.getRelativePath(relativePath, outName)

  logger.debug('Adding to sitemap: ' + relativeURL + ' orig: ' + inPath)
  var sitemapURL = {
    url: relativeURL,
    lastmodrealtime: true,
    lastmodfile: inPath
  }

  sitemapUrls.push(sitemapURL)
}

exports.addURLToSitemap = function (relativeURL) {
  logger.debug('Adding to sitemap: ' + relativeURL)
  var sitemapURL = {
    url: relativeURL
  }

  sitemapUrls.push(sitemapURL)
}

exports.generateSiteMap = function (sitemapPath) {
  var sitemap = sm.createSitemap({
    hostname: config.site.url,
    urls: sitemapUrls
  })

  logger.info('Generating sitemap at: ' + sitemapPath)

  fs.writeFileSync(sitemapPath, sitemap.toString())
}
