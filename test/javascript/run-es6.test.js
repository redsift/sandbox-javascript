describe('run es6', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  test('execute - no error thrown', () => {
    try {
      require('../../root/usr/bin/redsift/run-es6.js');
    } catch (e) {
      console.log(e);
      expect(true).toEqual(false);
    }
  });

  describe('dry run', () => {
    process.env.DRY = true;
    jest.spyOn(global.console, 'log')
    test('true', () => {
      require('../../root/usr/bin/redsift/run-es6.js');
      expect(console.log).toHaveBeenCalledWith('Detected Dry run');
    });
  });

  describe('detectCapnProtocol', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('true', () => {
      const req = {
        in: {
          bucket: 'api_scan',
          data: [{
            key: 'rstid:kerash:01DMN8M07XAMSDFE5FXGK1WZY8',
            value: 'aXBjZGF0YTM2NTE1OTEyNA==',
            epoch: 1568376750,
            generation: 0
          }]
        }
      };
      const result = run.detectCapnProtocol(req);
      expect(result).toEqual(true);
    });
    test('false', () => {
      const req = {
        in: {
          bucket: 'api_scan',
          data: [{
            key: 'rstid:tada:01DMN8M07XAMSDFE5FXGK1WZY8',
            value: 'aXBjZGF0YTM2NTE1OTEyNA==',
            epoch: 1568376750,
            generation: 0
          }]
        }
      };
      const result = run.detectCapnProtocol(req);
      expect(result).toEqual(false);
    });
    test('console.log error', () => {
      const req = {
        in: {
          data: [{
            bananas: 1234
          }]
        }
      };
      const result = run.detectCapnProtocol(req);
      expect(result).toEqual(false);
      expect(run.detectCapnProtocol).toThrow(TypeError);
    });
    test('no req.in.data', () => {
      const req = {
        in: {}
      };
      const result = run.detectCapnProtocol(req);
      expect(result).toEqual(false);
    });
  });

  describe('findBucketNodes', () => {
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('get node config from req.in.bucket', () => {
      const bucketName = 'api_scan';
      const outputs = [{ "api_rpc": {} }]; // this is from the outputs in sift-schema2.json
      const result = run.findBucketNodes(bucketName);
      expect(result).toEqual(outputs);
    })
  });

  describe('getRpcBucketNamesFromSift', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('get _rpc exports from sift json', () => {
      const rpcExportBuckets = run.getRpcBucketNamesFromSift();
      expect(rpcExportBuckets).toEqual(['api_rpc']);
    });
  });

  describe('getRpcBucketNamesFromSift', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('get _rpc exports from sift json', () => {
      const rpcExportBuckets = run.getRpcBucketNamesFromSift();
      expect(rpcExportBuckets).toEqual(['api_rpc']);
    });
  });

  describe('detectNodeRpcOutput', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('detect isApiRpc', () => {
      const bucketName = 'api_scan';
      const nodeOutputs = run.findBucketNodes(bucketName);
      const rpcBucketNames = run.getRpcBucketNamesFromSift();
      const isApiRpc = run.detectNodeRpcOutput(nodeOutputs, rpcBucketNames);
      expect(isApiRpc).toEqual(true);
    });
  });
});