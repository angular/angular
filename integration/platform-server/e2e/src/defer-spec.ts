import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('Defer E2E Tests', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('defer');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should text in defered component with input', async () => {
    // Test the contents from the server.
    expect(await element(by.css('p')).getText()).toEqual('Hydrate Never works!');

    await bootstrapClientApp();

    // Retest the contents after the client bootstraps.
    expect(await element(by.css('p')).getText()).toEqual('Hydrate Never works!');
  });
});
