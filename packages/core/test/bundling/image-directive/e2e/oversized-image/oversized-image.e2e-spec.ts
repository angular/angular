/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element, ExpectedConditions} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should not warn if there is no oversized image', async () => {
    await browser.get('/e2e/oversized-image-passing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if rendered image size is much smaller than intrinsic size', async () => {
    await browser.get('/e2e/oversized-image-failing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);

    expect(logs.length).toEqual(1);

    const expectedMessageRegex = /the intrinsic image is significantly larger than necessary\./;
    expect(expectedMessageRegex.test(logs[0].message)).toBeTruthy();
  });
});
