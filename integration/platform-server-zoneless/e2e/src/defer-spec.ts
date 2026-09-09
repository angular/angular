import {bootstrapClientApp, getElement, navigateTo, verifyNoBrowserErrors} from './util';

describe('Defer E2E Tests', () => {
  beforeEach(async () => {
    await navigateTo('defer');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should text in defered component with input', async () => {
    // Test the contents from the server.
    expect(await (await getElement('p')).getText()).toEqual('Hydrate Never works!');

    await bootstrapClientApp();

    // Retest the contents after the client bootstraps.
    expect(await (await getElement('p')).getText()).toEqual('Hydrate Never works!');
  });
});
