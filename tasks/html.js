var logger = require('./../lib/logger');
var fs = require('fs');

var markoc = require('marko/compiler');
// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();

function Html () {

  markoc.configure({
      writeToDisk: false,
      preserveWhitespace: !global.config.project.html.minify
  });
}

var p = Html.prototype

p.build = function() {
    var template = require('./../web/index.marko');
    var out = fs.createWriteStream('public/index.html', {
        encoding: 'utf8'
    });

    // Render the template to 'index.html'
    template.render({
        name: 'World!'
    }, out);
};

module.exports = Html;
