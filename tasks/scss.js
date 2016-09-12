var logger = require('./../lib/logger');
var sass = require('node-sass');
var glob = require("glob");
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var config = require('./../lib/config').config;

exports.build = function() {
    processDir(config.styles);
};

function processDir(src) {
    var globMatch = path.join('/**/!(_)*.scss');
    var scssFiles = glob.sync(globMatch, {
        root: config.styles
    });

    scssFiles.forEach(function(scssPath) {
        logger.debug("Processing SCSS file: " + scssPath);
        processScssFile(scssPath);
    });
}

function processScssFile(scssPath) {
    var scssRelativePath = path.relative(config.styles, scssPath);
    var scssInPath = path.join(config.styles, scssRelativePath);
    var scssOutDir = path.dirname(path.join(config.styles_dest, scssRelativePath));
    var scssOutName = path.parse(scssPath).name + ".css";
    var scssMapOutName = path.parse(scssPath).name + ".css.map";
    var scssOutPath = path.join(scssOutDir, scssOutName);
    var scssMapOutPath = path.join(scssOutDir, scssMapOutName);

    logger.debug("SCSS In Path: " + scssInPath);
    logger.debug("SCSS Out Path: " + scssOutPath);
    logger.debug("SCSS Map Out Path: " + scssMapOutPath);

    shell.mkdir('-p', scssOutDir);

    var result = sass.renderSync({
        file: scssInPath,
        outputStyle: config.minify ? 'compressed' : 'expanded',
        outFile: scssOutPath,
        sourceMap: true, // or an absolute or relative (to outFile) path
    });

    if (result.css) {
        fs.writeFile(scssOutPath, result.css, function(err) {
            if (err) {
                logger.error(err);
            }
        });
    }

    if (result.map) {
        fs.writeFile(scssMapOutPath, result.map, function(err) {
            if (err) {
                logger.error(err);
            }
        });
    }
    logger.debug(result.stats);
}
