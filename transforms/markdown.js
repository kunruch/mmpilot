var marked = require('marked')
var logger = require('./../lib/logger')

exports.init = function () {
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  })
}


exports.processString = function (inString) {
  var html = ''

  try {
    html = marked(inString)
  } catch (e) {
    logger.error('Cant compile' + e)
    process.exit(1)
  }

  return html
}
