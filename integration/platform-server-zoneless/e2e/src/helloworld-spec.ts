import {
  bootstrapClientApp,
  getElement,
  isElementPresent,
  navigateTo,
  verifyNoBrowserErrors,
} from './util';

describe('Hello world E2E Tests', () => {
  beforeEach(async () => {
    await navigateTo('helloworld');
  });

  afterEach(async () => {
    await verifyNoBrowserErrors();
  });

  it('should display: Hello world!', async () => {
    // Test the contents from the server.
    expect(await (await getElement('div')).getText()).toEqual('Hello world!');

    await bootstrapClientApp();

    // Retest the contents after the client bootstraps.
    expect(await (await getElement('div')).getText()).toEqual('Hello world!');
  });

  it('should re-use component styles rendered on the server', async () => {
    expect(await (await getElement('style[ng-app-id="ng"]')).getText()).not.toBeNull();

    await bootstrapClientApp();

    // Make sure the server styles get reused by the client.
    expect(await isElementPresent('style[ng-app-id="ng"]')).toBeFalsy();
    expect(await isElementPresent('style[ng-style-reused]')).toBeTruthy();
    expect(await (await getElement('style')).getText()).toBe('');
  });
});
