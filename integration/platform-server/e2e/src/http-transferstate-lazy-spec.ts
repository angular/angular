/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('Http TransferState Lazy', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('http-transferstate-lazy');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should transfer http state in lazy component', async () => {
    // Test the contents from the server.
    expect(await element(by.css('div.one')).getText()).toBe('API 1 response');
    expect(await element(by.css('div.two')).getText()).toBe('API 2 response');

    // Bootstrap the client side app and retest the contents
    await bootstrapClientApp();
    expect(await element(by.css('div.one')).getText()).toBe('API 1 response');
    expect(await element(by.css('div.two')).getText()).toBe('API 2 response');

    // Validate that there were no HTTP calls to '/api'.
    const requests = await browser.executeScript(() => {
      return performance.getEntriesByType('resource');
    });
    const apiRequests = (requests as {name: string}[])
      .filter(({name}) => name.includes('/api'))
      .map(({name}) => name);

    expect(apiRequests).toEqual([]);
  });
});
