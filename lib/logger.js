var winston = require('winston')

var logger = new winston.Logger({
  level: 'info',
  transports: [
    // new( winston.transports.File )( {
    //     filename: '.log'
    // } ),
    new (winston.transports.Console)({
      showLevel: false,
      colorize: true,
      prettyPrint: true,
      timestamp: false,
      align: false
    })
  ]
})

module.exports.start = function (name) {
  logger.info(' ') // Blank line
  console.time(name)
  logger.info(name + '..')
}

module.exports.end = function (name) {
  logger.info('Finished')
  console.timeEnd(name)
}

module.exports.SetLevel = function (level) {
  logger.level = level
}
module.exports.silly = logger.silly
module.exports.debug = logger.debug
module.exports.verbose = logger.verbose
module.exports.info = logger.info
module.exports.warn = logger.warn
module.exports.error = logger.error
