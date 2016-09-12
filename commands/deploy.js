var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var ghpages = require('gh-pages');


exports.execute = function() {
    ghpages.publish(config.dest,
        function(err) {
            logger.error("Error while deploying: " + err);
        });
}
