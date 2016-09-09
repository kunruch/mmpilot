var yaml = require('js-yaml');
var fs = require('fs');
var pkg = require('./../package.json');
var logger = require('./logger');

function Config() {
    this.package = pkg;
		this.project = {

		}
}

var p = Config.prototype;

p.load = function(path) {
		var config_path = path ? path : '_mmpilot.yml';
    try {
        var user_config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));

				//TODO: Assign defaults
				this.project = user_config;
    } catch (e) {
        logger.error(e);
        return false;
    }

    return true;
};

module.exports = Config;
