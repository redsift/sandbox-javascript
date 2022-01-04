const protocol = require('../../root/usr/bin/redsift/protocol.js');
const fs = require('fs');
const { v4: uuid } = require('uuid');

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

  describe('flattenNestedArrays func', () => {
    test('nested array', () => {
      const result = protocol.flattenNestedArrays([['a']]);
      expect(result).toEqual(['a']);
    });
    test('no array', () => {
      const result = protocol.flattenNestedArrays('a');
      expect(result).toEqual(['a']);
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
        expect(d.value.toString()).toEqual(
          Buffer.from(fileName, 'base64').toString()
        );
      });
    });

    test('with', () => {
      const res = protocol.fromEncodedMessage(withReq());
      res.with.data.map((d) => {
        expect(d.value.toString()).toEqual(
          Buffer.from(fileName, 'base64').toString()
        );
      });
    });

    test('get', () => {
      const res = protocol.fromEncodedMessage(getReq());
      res.get.map((g) => {
        g.data.map((d) => {
          expect(d.value.toString()).toEqual(
            Buffer.from(fileName, 'base64').toString()
          );
        });
      });
    });
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
