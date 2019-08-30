const protocol = require('../../root/usr/bin/redsift/protocol.js');
const fs = require('fs');
const uuid = require('uuid/v4');
const capnp = require('capnp');
const convert = require('../../root/usr/bin/redsift/convert.js');

jest.mock('fs');

describe('protocol', () => {
  describe('fromEncodedCapnpMessage func', () => {
    test('in, with', () => {
      const KERASH_KEY = 'rstid:kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const X_UUID = uuid();
      const a = uuid();
      const b = uuid();
      const body = [{
        a,
        b
      }];
      const header = [{
        key: 'Content-Type',
        value: ['application/json']
      }, {
        key: 'REQUEST_UUID',
        value: [X_UUID]
      }];
      const value = {
        statusCode: 200,
        header,
        body: Buffer.from(JSON.stringify(body))
      };
      const req = [{
        name: "api_rpc",
        key: KERASH_KEY,
        value,
        epoch: 0,
        generation: 0
      }];

      // Return capnp buffer readFileSync to be used in fromEncodedCapnpMessage
      const capnpBuffer = capnp.serialize(convert.rpcSchema.RpcResponse, value).toString('base64');
      fs.readFileSync.mockReturnValue(capnpBuffer);

      const res = protocol.fromEncodedCapnpMessage(req);
      const decodedBodyJSON = JSON.parse(Buffer.from(res[0].value.body).toString());
      expect(decodedBodyJSON).toEqual(body);
      expect(res[0].value.header).toEqual(header);
    });

    //Get
    test('get', () => {
      const KERASH_KEY = 'rstid:kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const X_UUID = uuid();
      const a = uuid();
      const b = uuid();
      const value = [{
        a,
        b
      }];
      const body = {
        get: {
          bucket: 'api_scan',
          data: [{
            key: KERASH_KEY,
            value: Buffer.from(JSON.stringify(value)),
            epoch: 1567606880,
            generation: 0
          }]
        }
      };
      const req = {
        statusCode: 200,
        header: [{
          key: 'Content-Type',
          value: ['application/json']
        }, {
          key: 'X-UUID',
          value: [X_UUID]
        }],
        body
      };
      fs.readFileSync.mockReturnValue(req);

      const res = protocol.fromEncodedCapnpMessage(req);
      res.body.get.data.map(d => {
        expect(d.value.toString()).toEqual(JSON.stringify(value));
      });
    });
  });

  describe('fromEncodedMessageFile func', () => {
    test('in, with', () => {
      const NOT_KERASH = 'rstid:not_kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const a = uuid();
      const b = uuid();
      const value = [{
        a,
        b
      }];

      fs.readFileSync.mockReturnValue(value);

      const req = {
        in: {
          bucket: 'api_scan',
          data: [{
            key: NOT_KERASH,
            value: 'aXBjZGF0YTA2NDA2NDc1OQ==',
            epoch: 1567760776,
            generation: 0
          }]
        }
      };
      const res = protocol.fromEncodedMessageFile(req);
      res.in.data.map(d => {
        expect(d.value).toEqual(value);
      });
    });

    test('get', () => {
      const NOT_KERASH = 'rstid:not_kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const a = uuid();
      const b = uuid();
      const value = [{
        a,
        b
      }];

      fs.readFileSync.mockReturnValue(value);

      const body = {
        get: {
          bucket: 'api_scan',
          data: [{
            key: NOT_KERASH,
            value,
            epoch: 1567606880,
            generation: 0
          }]
        }
      };
      const req = {
        statusCode: 200,
        header: [{
          key: 'Content-Type',
          value: ['application/json']
        }],
        body
      };
      const res = protocol.fromEncodedMessageFile(req);
      res.body.get.data.map(d => {
        expect(d.value).toEqual(value);
      });
    });
  });

  describe('fromEncodedMessage func', () => {
    test('in, with', () => {
      const NOT_KERASH = 'rstid:not_kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const a = uuid();
      const b = uuid();
      const value = [{
        a,
        b
      }];
      const data = JSON.stringify([{
        key: NOT_KERASH,
        value,
        epoch: 1567760776,
        generation: 0
      }]).toString('base64');
      const req = {
        in: {
          bucket: 'api_scan',
          data
        }
      };
      const res = protocol.fromEncodedMessage(req);
      JSON.parse(res.in.data).map(d => {
        expect(d.value).toEqual(value);
      });
    });

    test('get', () => {
      const NOT_KERASH = 'rstid:not_kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const a = uuid();
      const b = uuid();
      const value = [{
        a,
        b
      }];

      const data = JSON.stringify([{
        key: NOT_KERASH,
        value,
        epoch: 1567760776,
        generation: 0
      }]).toString('base64');

      const body = {
        get: {
          bucket: 'api_scan',
          data
        }
      };
      const req = {
        statusCode: 200,
        header: [{
          key: 'Content-Type',
          value: ['application/json']
        }],
        body
      };
      const res = protocol.fromEncodedMessage(req);
      JSON.parse(res.body.get.data).map(d => {
        expect(d.value).toEqual(value);
      });
    });
  });

  test('toEncodedCapnpMessage, func', () => {
    const start = process.hrtime();
    const startNode = process.hrtime();
    const decodeTime = process.hrtime(start);
    const nodeTime = process.hrtime(startNode);
    const diff = process.hrtime(start);
    const a = uuid();
    const b = uuid();
    const data = { a, b };
    const value = [[{
      value: {
        body: Buffer.from(JSON.stringify(data)).toString('base64')
      }
    }]];
    const res = protocol.toEncodedCapnpMessage(value, diff, decodeTime, nodeTime);
    const json = JSON.parse(res);

    expect(json).toHaveProperty('out');
    expect(json).toHaveProperty('stats');
    expect(json.stats).toHaveProperty('result');
    expect(json.stats).toHaveProperty('decode');
    expect(json.stats).toHaveProperty('node');
    expect(json.stats).toHaveProperty('encode');
    //TODO: Decode the res and compare - do value as proper request.
    //expect(json.out).toEqual(value);
  });

  test('toEncodedMessage func', () => {
    const start = process.hrtime();
    const startNode = process.hrtime();
    const decodeTime = process.hrtime(start);
    const nodeTime = process.hrtime(startNode);
    const diff = process.hrtime(start);
    const a = uuid();
    const b = uuid();
    const value = [{
      a,
      b
    }];
    const res = protocol.toEncodedMessage(value, diff, decodeTime, nodeTime);
    const json = JSON.parse(res);

    expect(json).toHaveProperty('out');
    expect(json).toHaveProperty('stats');
    expect(json.stats).toHaveProperty('result');
    expect(json.stats).toHaveProperty('decode');
    expect(json.stats).toHaveProperty('node');
    expect(json.stats).toHaveProperty('encode');
    expect(json.out).toEqual(value);
  });
});