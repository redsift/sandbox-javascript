describe('run es6', () => {
  test('execute - no error thrown', () => {
    try {
      const run = require('../../root/usr/bin/redsift/run-es6.js');
    } catch (e) {
      expect(true).toEqual(false);
    }
  });
});