var path = require('path');

//Tasks required by this command
var tasks = [require('./../tasks/assets'), require('./../tasks/html'), require('./../tasks/styles'), require('./../tasks/scripts')];

exports.execute = function() {
  
    tasks.forEach(function(task) {
      task.init();
      task.processAll();
    });
};
