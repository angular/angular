/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';
import {bootstrapClientApp, navigateTo, verifyNoBrowserErrors} from './util';

describe('TransferState', () => {
  beforeEach(async () => {
    // Don't wait for Angular since it is not bootstrapped automatically.
    await browser.waitForAngularEnabled(false);

    // Load the page without waiting for Angular since it is not bootstrapped automatically.
    await navigateTo('transferstate');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should transfer component state', async () => {
    // Test the contents from the server.
    expect(await element(by.css('div')).getText()).toEqual('5');

    // Bootstrap the client side app and retest the contents
    await bootstrapClientApp();
    expect(await element(by.css('div')).getText()).toEqual('50');
  });
});
