var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var pkg = require('./../package.json');
var logger = require('./logger');
var shell = require('shelljs');

const CONFIG_FILE = '_mmpilot.yml';

var config = {
    version: pkg.version,

    // these can be overriden via command line param (-d)
    root: ".",
    loglevel: "info",

    // these can be overriden via _mmpilot.yml config file in project's root directory
    // paths are specified relative to root and converted to absolute path in load()
    url: "http://localhost/",
    dest: "public",
    html: ".",
    assets: "assets",
    styles: "styles",
    scripts: "scripts",
    sitemap: "sitemap.xml",
    minify: true,

    // these are set on call to load()
    html_dest: "",
    assets_dest: "",
    styles_dest: "",
    scripts_dest: "",
};

// Loads user config file if present and resolved paths to absolute paths
config.load = function(custom_root, verbose) {
    if(verbose) {
      this.loglevel = "debug";
    }

    this.root = process.cwd();
    if (custom_root) {
        this.root = this.absolutePath(custom_root);
    }

    logger.info("Using project root: " + this.root);

    // load config file if present and override default config
    var config_path = this.absolutePath(CONFIG_FILE);
    logger.info("Using configuration file: " + config_path);

    try {
        var user_config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));
        config = deep_merge_config(config, user_config);

    } catch (e) {
        logger.error(e);
        return false;
    }

    // generate dest paths and resolve all paths to absolute paths
    this.dest = this.absolutePath(this.dest);

    this.html_dest = path.join(this.dest, this.html);
    this.html = this.absolutePath(this.html);

    this.assets_dest = path.join(this.dest, this.assets);
    this.assets = this.absolutePath(this.assets);

    this.styles_dest = path.join(this.dest, this.styles);
    this.styles = this.absolutePath(this.styles);

    this.scripts_dest = path.join(this.dest, this.scripts);
    this.scripts = this.absolutePath(this.scripts);

    this.sitemap = path.join(this.dest, this.sitemap);

    //Set log level options
    logger.SetLevel(this.loglevel);
    shell.config.verbose = (this.loglevel == "debug");

    return true;
};

config.absolutePath = function(p) {
    var resolvedPath = p;
    if (!path.isAbsolute(p)) {
        resolvedPath = path.resolve(this.root, p);
        logger.debug("Resolved Path " + resolvedPath);
    }

    return resolvedPath;
}

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

exports.config = config;
