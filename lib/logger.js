var chalk = require('chalk');

exports.debug = function(message) {
	if(global.config.project.debug) {
		console.log(chalk.blue(message));
	}
};

exports.log = function(message) {
	console.log(message);
};

exports.done = function(message) {
	console.log(chalk.green(message));
};

exports.info = function(message) {
	console.log(chalk.cyan(message));
};

exports.warn = function(message) {
	console.log(chalk.yellow(message));
};

exports.error = function(message) {
	console.log(chalk.red(message));
};