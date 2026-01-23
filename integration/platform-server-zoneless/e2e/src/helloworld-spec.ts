import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('Hello world E2E Tests', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('helloworld');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should display: Hello world!', async () => {
    // Test the contents from the server.
    expect(await element(by.css('div')).getText()).toEqual('Hello world!');

    await bootstrapClientApp();

    // Retest the contents after the client bootstraps.
    expect(await element(by.css('div')).getText()).toEqual('Hello world!');
  });

  it('should re-use component styles rendered on the server', async () => {
    expect(await element(by.css('style[ng-app-id="ng"]')).getText()).not.toBeNull();

    await bootstrapClientApp();

    // Make sure the server styles get reused by the client.
    expect(await element(by.css('style[ng-app-id="ng"]')).isPresent()).toBeFalsy();
    expect(await element(by.css('style[ng-style-reused]')).isPresent()).toBeTruthy();
    expect(await element(by.css('style')).getText()).toBe('');
  });
});
