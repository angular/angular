/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from './util';

describe('Http TransferState Lazy', function() {
  it('should transfer http state in lazy component', function() {
    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    browser.driver.get(browser.baseUrl + 'http-transferstate-lazy');

    // Test the contents from the server.
    const serverDiv = browser.driver.findElement(by.css('div'));
    expect(serverDiv.getText()).toBe('API response');

    // Bootstrap the client side app and retest the contents
    browser.executeScript('doBootstrap()');
    expect(element(by.css('div')).getText()).toBe('API response');

    // Make sure there were no client side errors.
    verifyNoBrowserErrors();
  });
});
