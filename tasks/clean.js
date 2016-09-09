var logger = require('./../lib/logger');
var del     = require('del');

/**
 * Clean files
 */
exports.clean = function(path) {
  return del.sync(path);
};
