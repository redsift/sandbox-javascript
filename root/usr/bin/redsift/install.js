/* global Promise */
/* global process */
'use strict';

const child = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_STDERR_BUFFER = 1024 * 1024;

// -------- Init

const init = require('./init.js');

const nodes = init.nodes;

const SIFT_ROOT = init.SIFT_ROOT;

const sift = init.sift;

// -------- Main
if (process.env.NPM_TOKEN && process.env.NPM_TOKEN.length > 0) {
	try {
		fs.writeFileSync('/home/sandbox/.npmrc', process.env.NPM_TOKEN, { flag: 'a' })
	} catch (e) {
		throw new Error('failed to populate ~/.npmrc with NPM_TOKEN var')
	}
}

let map = {};
nodes.forEach(function (i) {
	const n = sift.dag.nodes[i];
	if (n === undefined) {
		throw new Error('Node #' + i + ' is not known');
	}

	if (n.implementation === undefined ||
		n.implementation.javascript === undefined) {
		throw new Error('implementation not supported by install at node #' + i);
	}

	const js = path.join(SIFT_ROOT, path.dirname(n.implementation.javascript));
	map[js] = true;
});

const final = Object.keys(map).reduce(function (last, pathToInstall) {
	let file;
	try {
		file = fs.statSync(path.join(pathToInstall, 'package.json'));
	} catch (e) {
		// not an error if missing
		console.log('Skipping', pathToInstall);
		return last;
	}

	if (file.isDirectory()) {
		throw new Error('package.json is a directory in ' + pathToInstall);
	}

	return last.then(function () {
		console.log('Performing npm install in', pathToInstall);

		return new Promise(function (resolve, reject) {
			child.exec('npm install', { cwd: pathToInstall, maxBuffer: MAX_STDERR_BUFFER }, function (err, stdout, stderr) {
				if (err) {
					console.error(stderr);
					reject('npm installed failed in ' + pathToInstall + ' exit code:' + err.code);
					return;
				}
				resolve();
			});
		});
	});
}, Promise.resolve());

final.then(function () {
	process.exit(0);
}).catch(function (err) {
	console.error(err);
	process.exit(-1);
});

module.exports = {
	final
}