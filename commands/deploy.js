var logger = require('./../lib/logger');
var config = require('./../config/config').config;
var ghpages = require('gh-pages');


exports.execute = function() {
    if(config.publish.dest != "gh-pages") {
      logger.error("Publish destination is not yet supported!");
      process.exit(1);
    }

    logger.info("Publishing " + config.publish.src + " to gh-pages..");
    ghpages.publish(config.publish.src, {
            clone: config.publish.temp,
            logger: function(message) {
                logger.info(message);
            },
        },
        function(err) {
            if (err) {
                logger.error("Error while deploying: " + err);
                process.exit(1);
            }
            else {
              logger.info("Published!");
            }
        });
}
