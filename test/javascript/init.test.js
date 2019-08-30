const init = require('../../root/usr/bin/redsift/init.js');

describe('init', () => {
  test('check properties', () => {
    expect(init).toHaveProperty('nodes');
    expect(init).toHaveProperty('SIFT_ROOT');
    expect(init).toHaveProperty('SIFT_JSON');
    expect(init).toHaveProperty('IPC_ROOT');
    expect(init).toHaveProperty('DRY');
    expect(init).toHaveProperty('sift');
  });
});