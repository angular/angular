/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapClientApp, getElement, navigateTo, verifyNoBrowserErrors} from './util';

describe('TransferState', () => {
  beforeEach(async () => {
    await navigateTo('transferstate');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should transfer component state', async () => {
    // Test the contents from the server.
    expect(await (await getElement('div')).getText()).toEqual('5');

    // Bootstrap the client side app and retest the contents
    await bootstrapClientApp();
    expect(await (await getElement('div')).getText()).toEqual('50');
  });
});
