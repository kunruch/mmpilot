var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var logger = require('./logger');
var shell = require('shelljs');

// this can be overriden via command line param (-c)
var config_file = '_mmpilot.yml';

// these can be set via config file
// paths are specified relative to root and converted to absolute path in load()
var config = {
    package: require('./../package.json'),

    clean: [ "public" ],

    html: {
      src: ".",
      dest: "public",
      sitemap: "sitemap.xml",
    },

    assets: {
      src: "assets",
      dest: "public"
    },

    styles: {
      src: "styles",
      dest: "public/styles"
    },

    scripts: {
      src: "scripts",
      dest: "public/scripts"
    },

    publish: {
      src: "public",
      dest: "gh-pages",
      repo: require('./../package.json').repository.url.replace("git+", "")
    },

    minify: true,
    log: "info",

    site: {
      url: "http://localhost/" //needed to generate sitemap
      //Additional data can be specified in config file
    }
};

config.load = function(custom_config) {

    if(custom_config) {
      config_file = custom_config;
    }

    logger.info("Using configuration file: " + config_file);

    try {
        var user_config = yaml.safeLoad(fs.readFileSync(config_file, 'utf8'));
        config = deep_merge_config(this, user_config);

    } catch (e) {
        logger.error(e);
        return false;
    }

    //Set log level options
    logger.SetLevel(this.log);
    shell.config.verbose = (this.log == "debug");

    return true;
};

// Recusrsively merge config and custom, overriding the base value with custom values
function deep_merge_config(base, custom) {

    Object.keys(custom).forEach(function(key) {
        if (!base.hasOwnProperty(key) || typeof base[key] !== 'object') {
            base[key] = custom[key];
        } else {
            base[key] = deep_merge_config(base[key], custom[key]);
        }
    });

    return base;
}

exports.config = config;
