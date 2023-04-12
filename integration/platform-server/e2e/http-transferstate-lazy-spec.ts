/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from './util';

describe('Http TransferState Lazy', () => {
  it('should transfer http state in lazy component', async () => {
    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    browser.driver.get(browser.baseUrl + 'http-transferstate-lazy');

    // Test the contents from the server.
    const serverDivOne = browser.driver.findElement(by.css('div.one'));
    expect(serverDivOne.getText()).toBe('API 1 response');

    const serverDivTwo = browser.driver.findElement(by.css('div.two'));
    expect(serverDivTwo.getText()).toBe('API 2 response');

    // Bootstrap the client side app and retest the contents
    browser.executeScript('doBootstrap()');
    expect(element(by.css('div.one')).getText()).toBe('API 1 response');
    expect(element(by.css('div.two')).getText()).toBe('API 2 response');

    // Validate that there were no HTTP calls to '/api'.
    const requests = await browser.driver.executeScript(() => {
      return window.performance.getEntriesByType('resource');
    });
    const apiRequests = (requests as any)
      .filter(({name}) => name.includes('/api'))
      .map(({name}) => name);

    expect(apiRequests).toEqual([]);

    // Make sure there were no client side errors.
    verifyNoBrowserErrors();
  });
});
