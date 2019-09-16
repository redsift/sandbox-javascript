describe('install', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // this is important - it clears the cache
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('run', async () => {
    const install = require('../../root/usr/bin/redsift/install.js');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
    await install.final;
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('process.env.NPM_TOKEN', () => {
    process.env.NPM_TOKEN = 'token';
    try {
      require('../../root/usr/bin/redsift/install.js');
      expect(true).toEqual(false); // If error caught this will fail the test
    } catch (e) {
      expect(e).toEqual(new Error('failed to populate ~/.npmrc with NPM_TOKEN var'));
    }
  });
});