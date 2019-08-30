'use strict';

const convert = require('./convert.js');
const fs = require('fs');
const path = require('path');

const readFileContent = (file) => {
  const filename = path.join(process.env.IPC_ROOT, file)
  return fs.readFileSync(filename);
}

function flattenNestedArrays(value) {
  if (Array.isArray(value)) {
    if (value.length === 1 && Array.isArray(value[0])) {
      return flattenNestedArrays(value[0]);
    }
    return value;
  }
  return [value];
}

function fromEncodedCapnpMessage(body) {
  ['in', 'with'].forEach(function (k) {
    if (k in body) {
      body[k].data.forEach(d => {
        const fileName = Buffer.from(d.value, 'base64').toString();
        const fileContent = readFileContent(fileName);
        d.value = convert.decodeCapnProto(fileContent);
      });
    }
  });

  if ('get' in body) {
    body.get.forEach(function (g) {
      const fileName = Buffer.from(g.value, 'base64').toString();
      const fileContent = readFileContent(fileName);
      g = convert.decodeCapnProto(fileContent);
    });
  }

  return body;
}

function fromEncodedMessageFile(body) {
  ['in', 'with'].forEach(function (k) {
    if (k in body) {
      body[k].data.forEach(d => {
        const fileContent = readFileContent(d.value);
        d.value = convert.b64Decode(fileContent);
      });
    }
  });

  if ('get' in body) {
    body.get.forEach(function (g) {
      const fileContent = readFileContent(g.value);
      g = convert.b64Decode(fileContent);
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

function toEncodedCapnpMessage(value, diff, decodeTime, nodeTime) {
  const startEncode = process.hrtime();
  const flat = flattenNestedArrays(value);
  flat.forEach(function (i) {
    i.value.body = Buffer.from(i.value.body, 'base64');
    i.value = convert.encodeCapnProto(i.value).toString('base64');
  });
  const encodeTime = process.hrtime(startEncode);
  return JSON.stringify({ out: flat, stats: { result: diff, decode: decodeTime, node: nodeTime, encode: encodeTime } });
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
  return JSON.stringify({ out: flat, stats: { result: diff, decode: decodeTime, node: nodeTime, encode: encodeTime } });
}

module.exports = {
  fromEncodedCapnpMessage: fromEncodedCapnpMessage,
  fromEncodedMessageFile: fromEncodedMessageFile,
  fromEncodedMessage: fromEncodedMessage,
  toEncodedCapnpMessage: toEncodedCapnpMessage,
  toEncodedMessage: toEncodedMessage
};
