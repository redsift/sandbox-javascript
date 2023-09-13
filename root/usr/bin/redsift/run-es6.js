/* global Buffer */
/* global process */
/*jslint node: true */
'use strict';

const Nano = require('nanomsg');
const path = require('path');
const protocol = require('./protocol.js');

// -------- Init variables
const init = require('./init.js');
const nodes = init.nodes;
const SIFT_SCHEMA_VERSION_2 = 2;
const RPC_KEY = '_rpc';
const SIFT_ROOT = init.SIFT_ROOT;
const IPC_ROOT = init.IPC_ROOT;
const DRY = init.DRY;
const sift = init.sift;
const isSchema2 = sift['schema-version'] === SIFT_SCHEMA_VERSION_2;

// Do we have _rpc outputs defined for the sift?
const getRpcBucketNamesFromSift = () => {
  const bucketNames = {};
  if (sift.dag && sift.dag.outputs) {
    Object.keys(sift.dag.outputs.exports || {}).forEach((key) => {
      if (sift.dag.outputs.exports[key].import == RPC_KEY) {
        bucketNames[key] = true; // Add the bucket name if _rpc
      }
    });
  }
  return bucketNames;
};

const rpcBucketNames = getRpcBucketNamesFromSift();

// Does the rpc outputs match the bucket name for the node?
const detectNodeRpcOutput = (nodeOutputs, rpcBucketNames) => {
  let matched = false;
  Object.keys(nodeOutputs).forEach((key) => {
    if (rpcBucketNames[key]) {
      matched = true;
    }
  });

  return matched;
};

// -------- Main
let hasImplementations = false;
(async () => {
  await Promise.all(
    nodes.map(async function (i) {
      const n = sift.dag.nodes[i];

      if (
        n === undefined ||
        n.implementation === undefined ||
        n.implementation.javascript === undefined
      ) {
        throw new Error('implementation not supported by run at node #' + i);
      }

      hasImplementations = true;
      const js = n.implementation.javascript;
      let node = null;
      let nodeErr = null;

      try {
        // Try to import as ES module
        const { default: defaultFunc } = await import(path.join(SIFT_ROOT, js));
        node = defaultFunc;
        if (typeof node !== 'function') {
          if (typeof node.default === 'function') {
            // For some reason, using "export default" with ESBuild requires this.
            node = node.default;
          } else {
            throw new Error(
              'Failed to import node. Trying to require node instead.'
            );
          }
        }
      } catch (err) {
        nodeErr = err;
      }

      if (!node || nodeErr) {
        // Fallback to CommonJS require
        try {
          node = require(path.join(SIFT_ROOT, js));
        } catch (err) {
          nodeErr = err;
        }
      }

      if (DRY) {
        // Dry run, for testing or warming compiler
        console.log('Detected Dry run');
        return;
      }
      const reply = Nano.socket('rep');
      reply.rcvmaxsize(-1);
      reply.connect('ipc://' + path.join(IPC_ROOT, i + '.sock'));
      reply.on('data', function (msg) {
        const start = process.hrtime();
        let req = JSON.parse(msg);
        const isApiRpcOutput = detectNodeRpcOutput(n.outputs, rpcBucketNames);
        if (isSchema2) {
          //console.debug(`Schema version 2 and _rpc output detected for bucket: ${req.in.bucket}`);
          req = protocol.fromEncodedMessageFile(req);
        } else {
          //console.debug(`Schema version 1 for for bucket: ${req.in.bucket}`);
          req = protocol.fromEncodedMessage(JSON.parse(msg));
        }

        const decodeTime = process.hrtime(start);
        const startNode = process.hrtime();

        let rep = null;
        try {
          if (nodeErr) {
            throw nodeErr;
          }
          rep = node(req);
        } catch (computeErr) {
          console.error(computeErr.stack);
          const err = {
            message: computeErr.message,
            stack: computeErr.stack,
            fileName: computeErr.fileName,
            lineNumber: computeErr.lineNumber,
          };
          reply.send(JSON.stringify({ error: err }));
          return;
        }

        //console.log('REP:', rep);
        if (!Array.isArray(rep)) {
          // coerce into an array
          rep = [rep];
        }
        Promise.all(rep)
          .then(function (value) {
            //console.log('REP-VALUE:', value);
            const nodeTime = process.hrtime(startNode);
            const diff = process.hrtime(start);
            reply.send(
              protocol.toEncodedMessage(value, diff, decodeTime, nodeTime)
            );
          })
          .catch(function (error) {
            console.error(error.stack);
            const err = {
              message: error.message,
              stack: error.stack,
              fileName: error.fileName,
              lineNumber: error.lineNumber,
            };
            const diff = process.hrtime(start);
            reply.send(JSON.stringify({ error: err, stats: { result: diff } }));
          });
      });
    })
  );

  if (!hasImplementations) {
    throw new Error('No javascript implementations');
  }
})();

// For testing mainly
module.exports = {
  getRpcBucketNamesFromSift,
  detectNodeRpcOutput,
};
