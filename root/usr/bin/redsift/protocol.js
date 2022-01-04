'use strict';

const convert = require('./convert.js');
const fs = require('fs');
const path = require('path');

function flattenNestedArrays(value) {
  if (Array.isArray(value)) {
    if (value.length === 1 && Array.isArray(value[0])) {
      return flattenNestedArrays(value[0]);
    }
    return value;
  }
  return [value];
}

function getFileContent(d) {
  return fs.readFileSync(
    path.join(process.env.IPC_ROOT, Buffer.from(d.value, 'base64').toString())
  );
}

function fromEncodedMessageFile(body) {
  ['in', 'with'].forEach(function (k) {
    if (k in body) {
      body[k].data.forEach((d) => {
        d.value = getFileContent(d);
      });
    }
  });

  if ('get' in body) {
    body.get.forEach(function (g) {
      g.data.forEach((d) => {
        d.value = getFileContent(d);
      });
    });
  }

  return body;
}

function fromEncodedMessage(body) {
  ['in', 'with'].forEach(function (k) {
    if (k in body) {
      body[k] = convert.b64Decode(body[k]);
    }
  });

  if ('get' in body) {
    body.get.forEach(function (g) {
      g = convert.b64Decode(g);
    });
  }

  return body;
}

function toEncodedMessage(value, diff, decodeTime, nodeTime) {
  const startEncode = process.hrtime();
  // if node() returns a Promise.all([...]), remove the nesting
  const flat = flattenNestedArrays(value);
  //console.log('REP-FLAT:', flat);
  flat.forEach(function (i) {
    i = convert.b64Encode(i);
  });
  const encodeTime = process.hrtime(startEncode);
  return JSON.stringify({
    out: flat,
    stats: {
      result: diff,
      decode: decodeTime,
      node: nodeTime,
      encode: encodeTime,
    },
  });
}

module.exports = {
  fromEncodedMessageFile,
  fromEncodedMessage,
  toEncodedMessage,
  flattenNestedArrays,
};
