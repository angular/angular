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

  // TODO: renable this test once the @angular/ssr has been update
  // Context: https://github.com/angular/angular/pull/63057
  // SSR relies on lastSuccessfulNavigation which went through a breaking change.
  // 1. FW needs to be released with the breaking change.
  // 2. @angular/ssr needs to be updated to use the new API & released
  // 3. We need to update the @angular/ssr to the said release.
  xit('should reply click event', async () => {
    const divElement = element(by.css('#divElement'));
    expect(await divElement.getText()).toContain('click not triggered');

    // Trigger click
    await divElement.click();

    // Bootstrap client application
    await bootstrapClientApp();

    expect(await divElement.getText()).toContain('click triggered');
  });
});
