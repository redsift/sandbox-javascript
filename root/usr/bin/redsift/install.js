var npm = require('npm');
npm.load(function (err) {
	// catch errors
	npm.commands.install([ ], function (err, data) {
		console.error(err);
	});
	npm.on('log', function (message) {
		console.log(message);
	});
});