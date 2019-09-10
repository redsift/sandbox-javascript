describe('install', () => {
  test('run', async () => {
    const install = require('../../root/usr/bin/redsift/install.js');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
    await install.final;
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});