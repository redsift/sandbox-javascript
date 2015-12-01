/* global process */
var npm = require('npm');
var SERVER = 'server';

try {
	process.chdir(SERVER);
}
catch (err) {
	console.warn('Could not change directory to', SERVER, ', likely no server implementation');
	// not an error
	process.exit(0);
}

npm.load(function (err) {
	// catch errors
	npm.commands.install([ ], function (err, data) {
		console.error(err);
	});
	npm.on('log', function (message) {
		console.log(message);
	});
});