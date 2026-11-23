/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

describe('Image performance warnings (oversized)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should warn if rendered image size is much smaller than intrinsic size', async () => {
    await driver.get(`${baseUrl}/e2e/image-perf-warnings-oversized`);
    const expectedMessageRegex = /has intrinsic file dimensions much larger than/;
    const logs = await waitForBrowserLogs(driver, webdriver.logging.Level.WARNING, 1, 10000, (l) =>
      expectedMessageRegex.test(l.message),
    );

    expect(logs.length).toEqual(1);
    expect(expectedMessageRegex.test(logs[0].message)).toBeTruthy();
  });

  // https://github.com/angular/angular/issues/57941
  it('should NOT warn if rendered SVG image size is much smaller that intrinsic size', async () => {
    await driver.get(`${baseUrl}/e2e/svg-no-perf-oversized-warnings`);
    // Wait for load event
    await new Promise((resolve) => setTimeout(resolve, 600));

    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    // Please note that prior to shipping the fix, it was logging a warning
    // for the SVG image (see the attached issue above).
    expect(logs.length).toEqual(0);
  });
});
