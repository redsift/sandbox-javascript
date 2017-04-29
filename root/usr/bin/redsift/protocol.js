'use strict';

function flattenNestedArrays(value) {
  if (Array.isArray(value)) {
    if (value.length === 1 && Array.isArray(value[0])) {
      return flattenNestedArrays(value[0]);
    }
    return value;
  }
  return [value];
}

function b64Decode(d) {
  if (d.data instanceof Array) {
    d.data.forEach(function (i) {
      if (i.value) {
        i.value = new Buffer(i.value, 'base64');
      }
    });
  } else if (d.data && d.data.value) {
    d.data.value = new Buffer(d.data.value, 'base64');
  }
  return d;
}

function b64Encode(i) {
  if (i != null && i.value != null && i.value != undefined) {
    var str = i.value;
    if (!(typeof str === 'string' || str instanceof String) && !(str instanceof Buffer)) {
      str = JSON.stringify(i.value);
    }
    // Encode the data struct as base64
    i.value = new Buffer(str).toString('base64');
  }
  return i;
}

function fromEncodedMessage(body) {
  ['in', 'with'].forEach(function (k) {
    if (k in body) {
      body[k] = b64Decode(body[k]);
    }
  });

  if ('lookup' in body) {
    body.lookup.forEach(function (l) {
      l = b64Decode(l);
    });
  }

  return body;
}

function toEncodedMessage(value, diff, decodeTime, nodeTime) {
  const startEncode = process.hrtime();
  // if node() returns a Promise.all([...]), remove the nesting
  var flat = flattenNestedArrays(value);
  //console.log('REP-FLAT:', flat);
  flat.forEach(function (i) {
    i = b64Encode(i);
  });
  const encodeTime = process.hrtime(startEncode);
  return JSON.stringify({ out: flat, stats: { result: diff, decode: decodeTime, node: nodeTime, encode: encodeTime } });
}

module.exports = {
  fromEncodedMessage: fromEncodedMessage,
  toEncodedMessage: toEncodedMessage
};
