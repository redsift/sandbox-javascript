/* global Promise */
/* global process */
'use strict';

var child = require('child_process');
var fs = require('fs');
var path = require('path');

var MAX_STDERR_BUFFER = 1024 * 1024;

// -------- Init

var init = require('./init.js');

var nodes = init.nodes;

var SIFT_ROOT = init.SIFT_ROOT;
var SIFT_JSON = init.SIFT_JSON;

var sift = init.sift;

// -------- Main

var paths = sift.dag.nodes.map(function (n) {
	if (n.implementation === undefined) {
		return '';
	}
	
	var js = n.implementation.javascript;
	return path.join(SIFT_ROOT, path.dirname(js));
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
					return;
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


