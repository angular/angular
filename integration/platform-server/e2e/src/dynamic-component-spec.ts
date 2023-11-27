import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('Dynamic component E2E Tests', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('dynamic-component');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should display: dynamic works!', async () => {
    // Test the contents from the server.
    expect(await element(by.css('p')).getText()).toContain('dynamic works!');

    await bootstrapClientApp();

    // Retest the contents after the client bootstraps.
    expect(await element(by.css('p')).getText()).toContain('dynamic works!');
  });
});
