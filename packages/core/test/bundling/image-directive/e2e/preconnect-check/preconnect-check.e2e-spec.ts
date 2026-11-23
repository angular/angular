/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

// Verifies that both images used in a component were rendered.
async function verifyImagesPresent(driver: webdriver.WebDriver) {
  const imgs = await driver.findElements(webdriver.By.css('img'));
  const srcA = await imgs[0].getAttribute('src');
  expect(srcA.endsWith('a.png')).toBe(true);
  const srcB = await imgs[1].getAttribute('src');
  expect(srcB.endsWith('b.png')).toBe(true);
}

describe('NgOptimizedImage directive (preconnect-check)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should log a warning when there is no preconnect for priority images', async () => {
    await driver.get(`${baseUrl}/e2e/preconnect-check`);

    await verifyImagesPresent(driver);

    // Make sure that only one warning is in the console for both images,
    // because they both have the same base URL (which is used to look for
    // corresponding `<link rel="preconnect">` tags).
    const logs = await waitForBrowserLogs(driver, webdriver.logging.Level.WARNING, 1, 10000, (l) =>
      l.message.includes('NG02956'),
    );
    expect(logs.length).toEqual(1);

    // Verify that the error code and a raw image src are present in the
    // error message.
    expect(logs[0].message).toMatch(/NG02956.*?a\.png/);
  });

  it('should not produce any warnings in the console when a preconnect tag is present', async () => {
    await driver.get(`${baseUrl}/e2e/preconnect-check?preconnect`);

    await verifyImagesPresent(driver);

    // Make sure there are no browser logs.
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });
});
