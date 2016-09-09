var logger = require('./../lib/logger');
var fs = require('fs');
var path = require('path');

var markoc = require('marko/compiler');
// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();

var html_src_path = path.join(global.config.project_root, global.config.project.html);
var html_dest_path =path.join(global.config.project_root, global.config.project.dest, global.config.project.html);

exports.build = function() {
    markoc.configure({
        writeToDisk: false,
        preserveWhitespace: !global.config.project.minify
    });

    processDir(html_src_path);

    var template = require('./../web/index.marko');
    var out = fs.createWriteStream('./web/public/index.html', {
        encoding: 'utf8'
    });

    // Render the template to 'index.html'
    template.render({
        name: 'World!'
    }, out);
};

function processDir(src) {

}
