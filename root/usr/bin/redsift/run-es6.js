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
const KERASH_KEY = 'rstid:kerash';
const RPC_KEY = '_rpc'
const SIFT_ROOT = init.SIFT_ROOT;
const IPC_ROOT = init.IPC_ROOT;
const DRY = init.DRY;
const sift = init.sift;
const isSchema2 = sift['schema-version'] === SIFT_SCHEMA_VERSION_2;

// Detects Capn'Proto Protocol based on KERASH_KEY identifer 
const detectCapnProtocol = (req) => {
  if (isSchema2 && req.in.data) {
    try {
      return req.in.data.filter((d) => d.key.startsWith(KERASH_KEY)).length ? true : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return false;
};

// Finds the matching node bucket outputs based on bucket in request
const findBucketNodes = (bucket) => {
  return sift.dag.nodes.map((node) => {
    if (node.input && node.input.bucket === bucket) {
      return node.outputs;
    }
  }).filter(output => !!output);
};

// Do we have _rpc outputs defined for the sift?
const getRpcBucketNamesFromSift = () => {
  const bucketNames = [];
  if (sift.dag && sift.dag.outputs) {
    Object.keys(sift.dag.outputs.exports || {}).forEach(key => {
      if (sift.dag.outputs.exports[key].import == RPC_KEY) {
        bucketNames.push(key); // Push the bucket name if _rpc
      }
    });
  }
  return bucketNames;
};

const rpcBucketNames = getRpcBucketNamesFromSift();

// Does the rpc outputs match the bucket name for the node?
const detectNodeRpcOutput = (nodeOutputs, rpcBucketNames) => {
  const matches = rpcBucketNames.filter(key => {
    nodeOutputs.filter(output => {
      return output[key] ? true : false;
    });
    return nodeOutputs.length ? true : false;
  });
  return matches.length > 0 ? true : false
};

// -------- Main
let hasImplementations = false;
nodes.forEach(function (i) {
  const n = sift.dag.nodes[i];

  if (n === undefined ||
    n.implementation === undefined ||
    (n.implementation.javascript === undefined)) {
    throw new Error('implementation not supported by run at node #' + i);
  }

  hasImplementations = true;
  const js = n.implementation.javascript;
  let node = null;
  let nodeErr = null;
  try {
    node = require(path.join(SIFT_ROOT, js));
  } catch (err) {
    nodeErr = err;
  }

  if (DRY) { // Dry run, for testing or warming compiler
    console.log('Detected Dry run');
    return;
  }

  const reply = Nano.socket('rep');
  reply.rcvmaxsize(-1);
  reply.connect('ipc://' + path.join(IPC_ROOT, i + '.sock'));
  reply.on('data', function (msg) {
    const start = process.hrtime();
    let req = JSON.parse(msg);

    const nodeOutputs = findBucketNodes(req.in.bucket);
    const isApiRpc = detectNodeRpcOutput(nodeOutputs, rpcBucketNames);
    const isCapnProto = detectCapnProtocol(req);

    if (isSchema2 && isApiRpc) {
      //console.debug(`Schema version 2 and _rpc output detected for bucket: ${req.in.bucket}`);
      if (isCapnProto) {
        //console.debug(`Cap'n Proto Schema detected for bucket: ${req.in.bucket}`);
        req = protocol.fromEncodedCapnpMessage(req);
      } else {
        req = protocol.fromEncodedMessageFile(req);
      }
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
        lineNumber: computeErr.lineNumber
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
        if (isApiRpc && isCapnProto) {
          reply.send(protocol.toEncodedCapnpMessage(value, diff, decodeTime, nodeTime));
        } else {
          reply.send(protocol.toEncodedMessage(value, diff, decodeTime, nodeTime));
        }

      })
      .catch(function (error) {
        console.error(error.stack);
        const err = {
          message: error.message,
          stack: error.stack,
          fileName: error.fileName,
          lineNumber: error.lineNumber
        };
        const diff = process.hrtime(start);
        reply.send(JSON.stringify({ error: err, stats: { result: diff } }));
      });
  });
});

if (!hasImplementations) {
  throw new Error('No javascript implementations');
}

// For testing mainly
module.exports = {
  detectCapnProtocol,
  findBucketNodes,
  getRpcBucketNamesFromSift,
  detectNodeRpcOutput
}
