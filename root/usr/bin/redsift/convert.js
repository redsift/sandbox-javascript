const capnp = require('capnp');
const rpcSchema = capnp.import(__dirname + '/schema/rpc2.capnp');

const b64Decode = (d) => {
  if (d.data instanceof Array) {
    d.data.forEach(function (i) {
      if (i.value) {
        i.value = Buffer.from(i.value, 'base64');
      }
    });
  } else if (d.data && d.data.value) {
    d.data.value = Buffer.from(d.data.value, 'base64');
  }
  return d;
}

const b64Encode = (i) => {
  if (i != null && i.value != null && i.value != undefined) {
    let str = i.value;
    if (!(typeof str === 'string' || str instanceof String) && !(str instanceof Buffer)) {
      str = JSON.stringify(i.value);
    }
    // Encode the data struct as base64
    i.value = Buffer.from(str).toString('base64');
  }
  return i;
}

const decodeCapnProto = (d) => {
  return capnp.parse(rpcSchema.RpcRequest, d);
}

const encodeCapnProto = (d) => {
  return capnp.serialize(rpcSchema.RpcResponse, d);
}

module.exports = {
  rpcSchema,
  b64Decode,
  b64Encode,
  decodeCapnProto,
  encodeCapnProto,
};