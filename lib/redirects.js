var path = require('path')
var fs = require('fs')
var url = require('url')
var shell = require('shelljs')

var config = require('./../config/config').config
var logger = require('./../lib/logger')

const REDIRECT_CONTENT = '<!DOCTYPE html>\
<html>\
<head>\
<link rel="canonical" href="_TO_"/>\
<meta http-equiv="content-type" content="text/html; charset=utf-8" />\
<meta http-equiv="refresh" content="0;url=_TO_" />\
</head>\
<body>\
    <h1>Redirecting...</h1>\
      <a href="_TO_">Click here if you are not redirected.<a>\
      <script>location="_TO_"</script>\
</body>\
</html>'

exports.generateRedirections = function () {
  config.redirected.forEach(function (redirect) {
    var to = url.resolve(config.site.url, redirect.to)
    var html = REDIRECT_CONTENT.replace(/_TO_/g, to)
    var ext = path.parse(redirect.from).ext
    var out = path.join(config.out, redirect.from)
    if (!ext) {
      out = path.join(out, 'index.html')
    }
    logger.info('Redirect from: ' + out + ' to: ' + to)
    shell.mkdir('-p', path.dirname(out))
    try {
      fs.writeFileSync(out, html)
    } catch (e) {
      logger.debug('Could not create redirect: ' + e)
    }
  })
}
