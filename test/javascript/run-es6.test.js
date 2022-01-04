const protocol = require('../../root/usr/bin/redsift/protocol.js');

jest.mock('../../root/usr/bin/redsift/protocol.js', () => ({
  fromEncodedMessageFile: jest.fn(),
  fromEncodedMessage: jest.fn(),
  toEncodedMessage: jest.fn(),
}));

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
    jest.spyOn(global.console, 'log');
    test('true', () => {
      require('../../root/usr/bin/redsift/run-es6.js');
      expect(console.log).toHaveBeenCalledWith('Detected Dry run');
    });
  });

  describe('getRpcBucketNamesFromSift', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('get _rpc exports from sift json', () => {
      const rpcExportBuckets = run.getRpcBucketNamesFromSift();
      expect(rpcExportBuckets).toEqual({ api_rpc: true });
    });
  });

  describe('getRpcBucketNamesFromSift', () => {
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('get _rpc exports from sift json', () => {
      const rpcExportBuckets = run.getRpcBucketNamesFromSift();
      expect(rpcExportBuckets).toEqual({ api_rpc: true });
    });
  });

  describe('detectNodeRpcOutput', () => {
    const init = require('../../root/usr/bin/redsift/init.js');
    // Setting schema version 2
    process.env.SIFT_JSON = 'sift-schema2.json';
    const run = require('../../root/usr/bin/redsift/run-es6.js');
    test('detect isApiRpcOutput', () => {
      const rpcBucketNames = run.getRpcBucketNamesFromSift();
      const isApiRpcOutput = run.detectNodeRpcOutput(
        init.sift.dag.nodes[0].outputs,
        rpcBucketNames
      );
      expect(isApiRpcOutput).toEqual(true);
    });
  });
});
