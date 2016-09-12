var logger = require('./../lib/logger');
var config = require('./../lib/config').config;
var ghpages = require('gh-pages');


exports.execute = function() {
    logger.info("Publishing to gh-pages..");
    ghpages.publish(config.dest, {
            logger: function(message) {
                logger.log(message);
            },
        },
        function(err) {
            if (err) {
                logger.error("Error while deploying: " + err);
            }
            else {
              logger.done("Published!");
            }
        });
}
