var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var pkg = require('./../package.json');
var logger = require('./logger');

const CONFIG_FILE = '_mmpilot.yml';

function Config() {
    this.package = pkg;
    this.project_root = "./"
		this.project = {

		}
}

var p = Config.prototype;

p.load = function(custom_root) {
		if(custom_root) {
      this.project_root = custom_root;
    }

    if(!path.isAbsolute(this.project_root)) {
      this.project_root = path.join(process.cwd(), this.project_root);
      logger.info("MMPilot Project: " + this.project_root);
    }

    var config_path = path.join(this.project_root, CONFIG_FILE);
    logger.info("Using configuration file: " + config_path);

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
