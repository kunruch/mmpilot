var chalk = require('chalk');

exports.log = function(message) {
	console.log(message);
};

exports.done = function(message) {
	console.log(chalk.blue(message));
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
