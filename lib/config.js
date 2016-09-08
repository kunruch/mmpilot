var yaml = require('js-yaml');
var fs = require('fs');
var pkg = require('./../package.json');
var logger = require('./logger');

function Config() {
    this.package = pkg;
}

var p = Config.prototype;

p.load = function() {
    // Get document, or throw exception on error
    try {
        var user_config = yaml.safeLoad(fs.readFileSync('_mmpilot.yml', 'utf8'));

				//TODO: Assign defaults
				this.project = user_config;
    } catch (e) {
        logger.error(e);
    }
};

module.exports = Config;
