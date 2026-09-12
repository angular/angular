/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive (oversized-image)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should not warn if there is no oversized image', async () => {
    await driver.get(`${baseUrl}/e2e/oversized-image-passing`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if rendered image size is much smaller than intrinsic size', async () => {
    await driver.get(`${baseUrl}/e2e/oversized-image-failing`);
    const expectedMessageRegex = /the intrinsic image is significantly larger than necessary\./;
    const logs = await waitForBrowserLogs(
      driver,
      webdriver.logging.Level.WARNING,
      1,
      10000,
      (l) => expectedMessageRegex.test(l.message) || l.message.includes('NG02960'),
    );

    expect(logs.length).toEqual(1);
    expect(expectedMessageRegex.test(logs[0].message)).toBeTruthy();
  });
});
