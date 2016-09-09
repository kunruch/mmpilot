var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var pkg = require('./../package.json');
var logger = require('./logger');

const CONFIG_FILE = '_mmpilot.yml';

function Config() {
    // info from package.json
    this.package = pkg;

    // this can be overriden via command line param (-d)
    this.project_root = "./"

    // these can be overriden via _mmpilot.yml config file in project's root directory
    // paths are relative to project root
    this.project = {
        url: "http://localhost/",
        dest: "public",
        html: "./",
        assets: "assets",
        styles: "styles",
        scripts: "scripts",
        minify: true,
        debug: false
    }
}

var p = Config.prototype;

p.load = function(custom_root) {
    if (custom_root) {
        this.project_root = custom_root;
    }

    if (!path.isAbsolute(this.project_root)) {
        this.project_root = path.join(process.cwd(), this.project_root);
        logger.info("MMPilot Project: " + this.project_root);
    }

    var config_path = path.join(this.project_root, CONFIG_FILE);
    logger.info("Using configuration file: " + config_path);

    try {
        var user_config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));
        this.project = deep_merge_config(this.project, user_config);

        console.log(this.project);
    } catch (e) {
        logger.error(e);
        return false;
    }

    return true;
};

// Recusrsively merge config and custom, overriding the base value with custom values
function deep_merge_config(base, custom) {

    Object.keys(custom).forEach(function(key) {
        if (base.hasOwnProperty(key)) {
            if (typeof base[key] !== 'object') {
                base[key] = custom[key];
            } else {
                base[key] = deep_merge_config(base[key], custom[key]);
            }
        }
    });

    return base;
}

module.exports = Config;
