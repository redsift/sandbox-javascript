describe('init', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('check properties', () => {
    const init = require('../../root/usr/bin/redsift/init.js');
    expect(init).toHaveProperty('nodes');
    expect(init).toHaveProperty('SIFT_ROOT');
    expect(init).toHaveProperty('SIFT_JSON');
    expect(init).toHaveProperty('IPC_ROOT');
    expect(init).toHaveProperty('DRY');
    expect(init).toHaveProperty('sift');
  });

  test('dry run', () => {
    process.env.DRY = true;
    jest.spyOn(global.console, 'log')
    test.only('true', () => {
      require('../../root/usr/bin/redsift/init.js');
      expect(console.log).toHaveBeenCalledWith('Detected Dry run');
    });
  });

  test('process error', () => {
    process.env.ENV = 'stg';
    process.env.DRY = false;
    try {
      require('../../root/usr/bin/redsift/init.js');
    } catch (e) {
      expect(e).toEqual(new Error('No nodes to execute'));
    }
  });

  test('Environment SIFT_ROOT not set', () => {
    delete process.env.SIFT_ROOT;
    process.env.DRY = false;
    process.env.ENV = 'test';
    try {
      require('../../root/usr/bin/redsift/init.js');
      expect(true).toEqual(false);
    } catch (e) {
      expect(e).toEqual(new Error('Environment SIFT_ROOT not set'));
    }
  });

  test('Environment SIFT_JSON not set', () => {
    delete process.env.SIFT_JSON;
    process.env.SIFT_ROOT = 'test/';
    process.env.DRY = false;
    process.env.ENV = 'test';
    try {
      require('../../root/usr/bin/redsift/init.js');
    } catch (e) {
      expect(e).toEqual(new Error('Environment SIFT_JSON not set'));
    }
  });

  test('Environment IPC_ROOT not set', () => {
    delete process.env.IPC_ROOT;
    process.env.SIFT_JSON = 'sift.json';
    try {
      require('../../root/usr/bin/redsift/init.js');
    } catch (e) {
      expect(e).toEqual(new Error('Environment IPC_ROOT not set'));
    }
  });

  test('No such file or directory', () => {
    const SIFT_ROOT = 'bananas';
    process.env.SIFT_ROOT = SIFT_ROOT;
    process.env.IPC_ROOT = 'root/usr/ipc';
    process.env.DRY = false;
    process.env.ENV = 'test';
    try {
      require('../../root/usr/bin/redsift/init.js');
    } catch (e) {
      expect(e.code).toEqual('ENOENT');
    }
  });


  test('Sift does not contain any nodes', () => {
    process.env.SIFT_ROOT = 'test/bad';
    try {
      require('../../root/usr/bin/redsift/init.js');
    } catch (e) {
      expect(e).toEqual(new Error('Sift does not contain any nodes'));
    }
  });
});