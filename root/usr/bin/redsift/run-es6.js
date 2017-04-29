/* global Buffer */
/* global process */
/*jslint node: true */
'use strict';

// Provides bootstrapping for the to be launched nodes
const Nano = require('nanomsg');
const FS = require('fs');
const path = require('path');
const protocol = require('./protocol.js');

// -------- Init

const init = require('./init.js');

const nodes = init.nodes;

const SIFT_ROOT = init.SIFT_ROOT;
const SIFT_JSON = init.SIFT_JSON;
const IPC_ROOT = init.IPC_ROOT;
const DRY = init.DRY;

const sift = init.sift;

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
  var js = n.implementation.javascript;
  var node = null;
  var nodeErr = null;
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
    let req = protocol.fromEncodedMessage(JSON.parse(msg));
    // console.log('REQ:', req);
    const decodeTime = process.hrtime(start);
    const startNode = process.hrtime();

    var rep = null;
    try {
      if (nodeErr) {
        throw nodeErr;
      }
      rep = node(req);
    } catch (computeErr) {
      console.error(computeErr.stack);
      var err = {
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
        reply.send(protocol.toEncodedMessage(value, diff, decodeTime, nodeTime));
      })
      .catch(function (error) {
        console.error(error.stack);
        var err = {
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
