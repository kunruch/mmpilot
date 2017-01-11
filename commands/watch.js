var logger = require('./../lib/logger')
var path = require('path')
var config = require('./../config/config').config
var chokidar = require('chokidar')
var shell = require('shelljs')

// Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles')]
var scriptsTask = require('./../tasks/scripts') // separate task as it uses watchify internally to watch for incremental changes

var customCommand = ''

exports.init = function (options) {
  if (options.run) {
    customCommand = options.run
  }
}

exports.execute = function () {
  logger.info('Setting up Watch..')

  if (!config.isBrowserify) {
    // only add when browserify is not enable to avoid unecessary watching
    tasks.push(require('./../tasks/scripts'))
  }

  tasks.forEach(function (task) {
    task.init()
    chokidar.watch(task.watch_pattern, {

      ignored: [config.html.dest, config.assets.dest, config.styles.dest, config.scripts.dest],
      ignoreInitial: true,
      cwd: task.watch_dir()

    }).on('add', (filepath) => {
      logger.info(filepath + ' added..')
      task.processFile(filepath)
    }).on('change', (filepath) => {
      logger.info(filepath + ' changed..')
      task.processFile(filepath)

      if (customCommand !== '') {
        // Run custom_command synchronously
        logger.error(customCommand)
        if (shell.exec(customCommand).code !== 0) {
          logger.error('Error: failed to execute ' + customCommand)
          process.exit(1)
        }
      }
    }).on('unlink', (filepath) => {
      logger.info(filepath + ' deleted..')
      task.processFileDeleted(filepath)
    })
      .on('addDir', path => logger.info('Directory has been added. A rebuild is recommended.'))
      .on('unlinkDir', path => logger.info('Directory has been removed. A rebuild is recommended.'))
      .on('ready', function () {
        logger.info('Ready to watch for changes in ' + path.join(task.watch_dir(), task.watch_pattern))
        // logger.debug('Watched paths:', this.getWatched())
      }).on('error', error => logger.error('Watcher error! A rebuild is recommended. Error: ' + error))
  })

  if (config.isBrowserify) {
    // Setup watch for scripts via browserify
    scriptsTask.init()
    scriptsTask.processAll(true)
  }
}
