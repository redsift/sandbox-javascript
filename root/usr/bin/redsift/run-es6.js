/* global Buffer */
/* global process */
/*jslint node: true */
'use strict';

// Provides bootstrapping for the to be launched nodes
const Nano = require('nanomsg');
const path = require('path');
const protocol = require('./protocol.js');

// -------- Init
const init = require('./init.js');

const nodes = init.nodes;

const SIFT_SCHEMA_VERSION_2 = 2;
const KERASH_KEY = 'rstid:kerash';
const SIFT_ROOT = init.SIFT_ROOT;
const SIFT_JSON = init.SIFT_JSON;
const IPC_ROOT = init.IPC_ROOT;
const DRY = init.DRY;

const sift = init.sift;

const isSchema2 = sift['schema-version'] === SIFT_SCHEMA_VERSION_2;
const detectCapnProtocol = (req) => {
  if (isSchema2 && req.in.data) {
    try {
      return req.in.data.filter((d) => d.key.startsWith(KERASH_KEY)) ? true : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return false;
};

// -------- Main

let one = false;
nodes.forEach(function (i) {
  const n = sift.dag.nodes[i];

  if (n === undefined ||
    n.implementation === undefined ||
    (n.implementation.javascript === undefined)) {
    throw new Error('implementation not supported by run at node #' + i);
  }

  one = true;
  const js = n.implementation.javascript;
  let node = null;
  let nodeErr = null;
  try {
    node = require(path.join(SIFT_ROOT, js));
  } catch (err) {
    nodeErr = err;
  }

  if (DRY) {
    // Dry run, for testing or warming compiler
    return;
  }

  const reply = Nano.socket('rep');
  reply.rcvmaxsize(-1);
  reply.connect('ipc://' + path.join(IPC_ROOT, i + '.sock'));
  reply.on('data', function (msg) {
    const start = process.hrtime();
    let req = JSON.parse(msg);
    const isCapnProto = detectCapnProtocol(req);

    if (isSchema2) {
      console.debug('Schema version 2');
      if (isCapnProto) {
        console.debug(`Cap'n Proto Schema detected`);
        req = protocol.fromEncodedCapnpMessage(req);
      } else {
        req = protocol.fromEncodedMessageFile(req);
      }
    } else {
      console.debug('Schema version 1');
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
        if (isCapnProto) {
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

if (!one) {
  throw new Error('No javascript implementations');
}
