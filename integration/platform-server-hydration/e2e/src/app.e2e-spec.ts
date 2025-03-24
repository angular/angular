import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('App E2E Tests', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should reply click event', async () => {
    const divElement = element(by.css('#divElement'));
    expect(await divElement.getText()).toContain('click not triggered');

    // Trigger click
    await divElement.click();

    // Bootstrap client application
    await bootstrapClientApp();

    expect(await divElement.getText()).toContain('click triggered');
  });
});
