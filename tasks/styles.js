var logger = require('./../lib/logger');
var glob = require("glob");
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var config = require('./../lib/config').config;

var postcssProcessor = postcss([autoprefixer({
    browsers: ['last 2 versions']
})]);
var includePaths;

exports.watch_pattern = '**/*.scss';
exports.watch_dir = function() {
    return config.styles; // export as function to get loaded result
};

exports.init = function() {
    includePaths = ["node_modules/"]; //Add project's node_modules in include paths
}

exports.processAll = function() {
    logger.info("Processing SCSS files..");
    processDir(config.styles);
};

exports.processFile = function(filepath) {
    if (path.parse(filepath).name.startsWith("_")) {
        //In case of files starting with '_', compile entire dir as they can be included from multiple sources
        //We can improve this to compile only files that are needed.
        logger.info("Partial file has been changed.. Processing all files.");
        processDir(config.styles);
    } else {
        logger.info("Processing SCSS file: " + filepath);
        var absolutePath = path.join(config.styles, filepath);
        processScssFile(absolutePath);
    }
}

exports.processFileDeleted = function(filepath) {
    //Do nothing for now, a fresh build should not generate this file anyways
}

function processDir(src) {
    var globMatch = path.join('/**/!(_)*.scss');
    var scssFiles = glob.sync(globMatch, {
        root: config.styles
    });

    scssFiles.forEach(function(scssPath) {
        logger.debug("Processing Stylesheet: " + scssPath);
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

    var result = "";
    //Compile SCSS
    try {
        console.log("Included: " + includePaths);
        result = sass.renderSync({
            file: scssInPath,
            outputStyle: config.minify ? 'compressed' : 'expanded',
            includePaths: includePaths,
            outFile: scssOutPath,
            sourceMap: true, // or an absolute or relative (to outFile) path
        });
    } catch (error) {
        logger.debug(error.status);
        logger.debug(error.column);
        logger.debug(error.message);
        logger.debug(error.line);
    }

    // Post CSS processing
    if (result.css) {
        try {
            postcssProcessor
                .process(result.css, {
                    from: scssInPath,
                    to: scssOutPath,
                    map: {
                        inline: false,
                        prev: result.map.toString()
                    },
                })
                .then(function(result) {
                    fs.writeFileSync(scssOutPath, result.css);
                    if (result.map) fs.writeFileSync(scssMapOutPath, result.map);
                });

        } catch (error) {
            logger.debug(error);
        }
    }

    logger.debug(result.stats);
}