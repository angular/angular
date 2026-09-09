/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  bootstrapClientApp,
  getElement,
  getWebDriver,
  navigateTo,
  verifyNoBrowserErrors,
} from './util';

describe('Http TransferState Lazy On Init', () => {
  beforeEach(async () => {
    await navigateTo('http-transferstate-lazy-on-init');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should transfer http state in lazy component', async () => {
    expect(await (await getElement('div.one')).getText()).toBe('API 1 response');

    // Bootstrap the client side app and retest the contents
    await bootstrapClientApp();
    expect(await (await getElement('div.one')).getText()).toBe('API 1 response');

    // Validate that there were no HTTP calls to '/api'.
    const requests = await getWebDriver().executeScript(() => {
      return performance.getEntriesByType('resource');
    });
    const apiRequests = (requests as {name: string}[])
      .filter(({name}) => name.includes('/api'))
      .map(({name}) => name);

    expect(apiRequests).toEqual([]);
  });
});
