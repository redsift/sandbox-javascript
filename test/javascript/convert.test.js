const convert = require('../../root/usr/bin/redsift/convert.js');
const { v4: uuid } = require('uuid');

describe('b64Decode', () => {
  test('d.data instanceof Array', () => {
    const a = uuid();
    const b = uuid();
    const d = {
      data: [{
        value: Buffer.from(a).toString('base64')
      }, {
        value: Buffer.from(b).toString('base64')
      }]
    };
    const result = convert.b64Decode(d);
    result.data.map((d) => {
      expect([a, b]).toContain(d.value.toString());
    });
  });
  test('d.data[].value not present', () => {
    const a = uuid();
    const d = {
      data: { body: Buffer.from(a).toString('base64') }
    };
    const result = convert.b64Decode(d);
    expect(result).toEqual(d);
  });

  test('d.data && d.data.value', () => {
    const a = uuid();
    const d = {
      data: { value: Buffer.from(a).toString('base64') }
    };
    const result = convert.b64Decode(d);
    expect(a).toContain(result.data.value.toString());
  });
  test('d.data.value not present', () => {
    const a = uuid();
    const d = {
      data: { body: Buffer.from(a).toString('base64') }
    };
    const result = convert.b64Decode(d);
    expect(result).toEqual(d);
  });
});

describe('b64Encode', () => {
  test('value is string', () => {
    const a = uuid();
    const aEncoded = Buffer.from(a).toString('base64');
    const i = {
      value: a
    };
    const result = convert.b64Encode(i);
    expect(result.value).toEqual(aEncoded);
  });

  test('value is json', () => {
    const a = uuid();
    const b = uuid();
    const i = {
      value: {
        a,
        b
      }
    };
    const encodedResult = convert.b64Encode(i);
    const decodedResult = convert.b64Decode({
      data: encodedResult
    });
    expect(encodedResult).toEqual(decodedResult.data);
  });
});