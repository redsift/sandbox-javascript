const protocol = require('../../root/usr/bin/redsift/protocol.js');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const capnp = require('capnp');
const convert = require('../../root/usr/bin/redsift/convert.js');

jest.mock('fs');

describe('protocol', () => {
  const fileName = 'ZmlsZW5hbWU=';
  const dataValue = {
    foo: 'bar',
  };

  const inReq = () => {
    return {
      in: {
        bucket: 'in',
        data: [
          {
            name: 'in_name',
            key: 'in_key',
            value: fileName,
            epoch: 0,
            generation: 0,
          },
        ],
      },
    };
  };

  const withReq = () => {
    return {
      with: {
        bucket: 'with',
        data: [
          {
            name: 'with_name',
            key: 'with_key',
            value: fileName,
            epoch: 0,
            generation: 0,
          },
        ],
      },
    };
  };

  const getReq = () => {
    return {
      get: [
        {
          bucket: 'get1',
          key: '*',
          data: [
            {
              name: 'get1',
              key: 'get_key1',
              value: fileName,
              epoch: 0,
              generation: 0,
            },
          ],
        },
        {
          bucket: 'get2',
          key: '*',
          data: [
            {
              name: 'get2',
              key: 'get_key2',
              value: fileName,
              epoch: 0,
              generation: 0,
            },
          ],
        },
      ],
    };
  };

  describe('fromEncodedCapnpMessage func', () => {
    test('in', () => {
      const KERASH_KEY = 'rstid:kerash:01DKYADEK8YVR3Y8011BVW5Z0T';
      const X_UUID = uuid();
      const a = uuid();
      const b = uuid();
      const body = [
        {
          a,
          b,
        },
      ];
      const header = [
        {
          key: 'Content-Type',
          value: ['application/json'],
        },
        {
          key: 'REQUEST_UUID',
          value: [X_UUID],
        },
      ];

      const value = {
        requestUri: 'https://hello.com/abc',
        header,
        body: Buffer.from(JSON.stringify(body)),
      };

      const req = {
        in: {
          bucket: 'api',
          data: [
            {
              name: 'api_rpc',
              key: KERASH_KEY,
              value: 'ZmlsZW5hbWU=',
              epoch: 0,
              generation: 0,
            },
          ],
        },
      };

      // Return capnp buffer readFileSync to be used in fromEncodedCapnpMessage
      const capnpBuffer = capnp.serialize(convert.rpcSchema.RpcRequest, value);
      fs.readFileSync.mockReturnValue(capnpBuffer);

      const res = protocol.fromEncodedCapnpMessage(req);
      const decodedBodyJSON = JSON.parse(
        Buffer.from(res.in.data[0].value.body).toString()
      );
      expect(decodedBodyJSON).toEqual(body);
      expect(res.in.data[0].value.header).toEqual(header);
    });

    // With
    test('with', () => {
      fs.readFileSync.mockReturnValue(JSON.stringify(dataValue));

      const res = protocol.fromEncodedCapnpMessage(withReq());
      const decodedValueJSON = JSON.parse(
        Buffer.from(res.with.data[0].value).toString()
      );
      expect(decodedValueJSON).toEqual(dataValue);
    });

    // Get
    test('get', () => {
      fs.readFileSync.mockReturnValue(JSON.stringify(dataValue));

      const res = protocol.fromEncodedCapnpMessage(getReq());
      const decodedValueJSON1 = JSON.parse(
        Buffer.from(res.get[0].data[0].value).toString()
      );
      expect(decodedValueJSON1).toEqual(dataValue);

      const decodedValueJSON2 = JSON.parse(
        Buffer.from(res.get[1].data[0].value).toString()
      );
      expect(decodedValueJSON2).toEqual(dataValue);
    });
  });

  describe('fromEncodedMessageFile func', () => {
    test('in', () => {
      fs.readFileSync.mockReturnValue(dataValue);

      const res = protocol.fromEncodedMessageFile(inReq());
      res.in.data.map((d) => {
        expect(d.value).toEqual(dataValue);
      });
    });

    test('with', () => {
      fs.readFileSync.mockReturnValue(dataValue);

      const res = protocol.fromEncodedMessageFile(withReq());
      res.with.data.map((d) => {
        expect(d.value).toEqual(dataValue);
      });
    });

    test('get', () => {
      fs.readFileSync.mockReturnValue(dataValue);

      const res = protocol.fromEncodedMessageFile(getReq());
      res.get.map((g) => {
        g.data.map((d) => {
          expect(d.value).toEqual(dataValue);
        });
      });
    });
  });

  describe('fromEncodedMessage func', () => {
    test('in', () => {
      const res = protocol.fromEncodedMessage(inReq());
      res.in.data.map((d) => {
        expect(d.value.toString()).toEqual(Buffer.from(fileName, 'base64').toString());
      });
    });

    test('with', () => {
      const res = protocol.fromEncodedMessage(withReq());
      res.with.data.map((d) => {
        expect(d.value.toString()).toEqual(Buffer.from(fileName, 'base64').toString());
      });
    });

    test('get', () => {
      const res = protocol.fromEncodedMessage(getReq());
      res.get.map((g) => {
        g.data.map((d) => {
          expect(d.value.toString()).toEqual(Buffer.from(fileName, 'base64').toString());
        });
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
    const value = [
      [
        {
          value: {
            body: Buffer.from(JSON.stringify(data)).toString('base64'),
          },
        },
      ],
    ];
    const res = protocol.toEncodedCapnpMessage(
      value,
      diff,
      decodeTime,
      nodeTime
    );
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
    const value = [
      {
        a,
        b,
      },
    ];
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
