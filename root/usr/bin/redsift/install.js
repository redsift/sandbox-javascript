/* global Promise */
/* global process */
var child = require('child_process');
var fs = require('fs');
var path = require('path');

var MAX_STDERR_BUFFER = 1024 * 1024;

// -------- Main

if (process.argv.length < 3) {
    throw new Error('No nodes to execute');
}

var nodes = process.argv.slice(2);

var SIFT_ROOT = process.env.SIFT_ROOT;

if (!SIFT_ROOT) {
	throw new Error('Environment SIFT_ROOT not set');
}

if (!path.isAbsolute(SIFT_ROOT)) {
	throw new Error('Environment SIFT_ROOT "' + SIFT_ROOT + '" must be absolute');
}

var sift = JSON.parse(fs.readFileSync(path.join(SIFT_ROOT, 'sift.json'), 'utf8'));

if ((sift.dag === undefined) || (sift.dag.nodes === undefined)) {
	throw new Error('Sift does not contain any nodes');
}

var paths = sift.dag.nodes.map(function (n) {
	return path.join(SIFT_ROOT, path.dirname(n.implementation.javascript));
});

var map = {};
nodes.forEach(function (i) {
	var js = paths[i];
	if (js === undefined) {
		throw new Error('Node #' + i + ' is not known');
	}
	map[js] = true;
});

var final = Object.keys(map).reduce(function (last, pathToInstall) {
	var file;
	try {
		file = fs.statSync(path.join(pathToInstall, 'package.json'));
	}
	catch (e) {
		// not an error if missing
		console.log('Skipping', pathToInstall);
		return last;
	}
	
	if (file.isDirectory()) {
		throw new Error('package.json is a directory in ' + pathToInstall);
	}
	
	return last.then(function() {
		console.log('Performing npm install in', pathToInstall);
		
		return new Promise(function(ok, ko) {
			child.exec('npm install', { cwd: pathToInstall, maxBuffer: MAX_STDERR_BUFFER }, function (err, stdout, stderr) {
				if (err) {
					console.error(stderr);
					ko('npm installed failed in ' + pathToInstall + ' exit code:' + err.code);
					return
				}
				ok();
			});
		});
	});
}, Promise.resolve());
	
final.then(function() {
	process.exit(0);
}).catch(function(err) {
	console.error(err);
	process.exit(-1);
});


