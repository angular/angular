/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

describe('Image performance warnings (lazy)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should log a warning when a LCP image is loaded lazily', async () => {
    await driver.get(`${baseUrl}/e2e/image-perf-warnings-lazy`);
    // Verify that both images were rendered.
    const imgs = await driver.findElements(webdriver.By.css('img'));
    let srcA = await imgs[0].getAttribute('src');
    expect(srcA.endsWith('a.png')).toBe(true);
    let srcB = await imgs[1].getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);

    // Make sure that only one LCP performance warning is in the console for image `a.png`,
    // since `b.png` should be below the fold and not treated as an LCP element.
    const logs = await waitForBrowserLogs(driver, webdriver.logging.Level.WARNING, 1, 10000, (l) =>
      l.message.includes('NG0913'),
    );
    expect(logs.length).toEqual(1);
    // Verify that the error code and the image src are present in the error message.
    expect(logs[0].message).toMatch(/NG0913.*?a\.png/);
  });
});
