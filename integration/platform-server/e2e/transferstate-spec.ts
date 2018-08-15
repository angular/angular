/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from './util';

describe('TransferState', function() {
  it('should transfer component state', function() {
    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    browser.driver.get(browser.baseUrl + 'transferstate');

    // Test the contents from the server.
    const serverDiv = browser.driver.findElement(by.css('div'));
    expect(serverDiv.getText()).toEqual('5');

    // Bootstrap the client side app and retest the contents
    browser.executeScript('doBootstrap()');
    expect(element(by.css('div')).getText()).toEqual('50');

    // Make sure there were no client side errors.
    verifyNoBrowserErrors();
  });
});
