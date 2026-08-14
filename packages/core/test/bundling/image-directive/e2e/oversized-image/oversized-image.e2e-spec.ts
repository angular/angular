/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver} from '../browser-logs-util';

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
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if rendered image size is much smaller than intrinsic size', async () => {
    await driver.get(`${baseUrl}/e2e/oversized-image-failing`);
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);

    expect(logs.length).toEqual(1);

    const expectedMessageRegex = /the intrinsic image is significantly larger than necessary\./;
    expect(expectedMessageRegex.test(logs[0].message)).toBeTruthy();
  });
});
