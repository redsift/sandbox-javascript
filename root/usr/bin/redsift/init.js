'use strict';

const fs = require('fs');
const path = require('path');
const processLength = (process.env.ENV === 'test') ? 0 : 3;

if (process.argv.length < processLength) {
  throw new Error('No nodes to execute');
}

const nodes = (process.env.ENV === 'test') ? [0] : process.argv.slice(2);

const SIFT_ROOT = path.resolve(process.env.SIFT_ROOT);
const SIFT_JSON = process.env.SIFT_JSON;
const IPC_ROOT = process.env.IPC_ROOT;
const DRY = (process.env.DRY === 'true');

if (!SIFT_ROOT) {
  throw new Error('Environment SIFT_ROOT not set');
}

if (!path.isAbsolute(SIFT_ROOT)) {
  throw new Error('Environment SIFT_ROOT "' + SIFT_ROOT + '" must be absolute');
}

if (!SIFT_JSON) {
  throw new Error('Environment SIFT_JSON not set');
}

if (!IPC_ROOT) {
  throw new Error('Environment IPC_ROOT not set');
}

if (DRY) {
  console.log('Unit Test Mode');
}

const sift = JSON.parse(fs.readFileSync(path.join(SIFT_ROOT, SIFT_JSON), 'utf8'));

if ((sift.dag === undefined) || (sift.dag.nodes === undefined)) {
  throw new Error('Sift does not contain any nodes');
}

module.exports = {
  nodes: nodes,
  SIFT_ROOT: SIFT_ROOT,
  SIFT_JSON: SIFT_JSON,
  IPC_ROOT: IPC_ROOT,
  DRY: DRY,
  sift: sift
};
