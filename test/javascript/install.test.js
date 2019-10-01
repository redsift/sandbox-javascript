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

  test.only('process.env.NPM_TOKEN', async () => {
    process.env.NPM_TOKEN = 'token';
    const install = require('../../root/usr/bin/redsift/install.js');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
    await install.final;
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});