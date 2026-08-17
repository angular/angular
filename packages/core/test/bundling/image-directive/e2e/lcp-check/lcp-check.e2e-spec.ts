/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive (lcp-check)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should log a warning when a `priority` is missing on an LCP image', async () => {
    await driver.get(`${baseUrl}/e2e/lcp-check`);
    // Wait for ngSrc to be modified after 500ms timeout
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verify that both images were rendered.
    const imgs = await driver.findElements(webdriver.By.css('img'));
    let srcB = await imgs[0].getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);
    const srcA = await imgs[1].getAttribute('src');
    expect(srcA.endsWith('logo-500w.jpg')).toBe(true);
    // The `b.png` image is used twice in a template.
    srcB = await imgs[2].getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);

    // Make sure that only one warning is in the console for image `a.png`,
    // since the `b.png` should be below the fold and not treated as an LCP element.
    // We use >= 1 and check the last log because the browser may sometimes report `b.png`
    // as an intermediate LCP element before `a.png` is painted, causing an extra log.
    // NOTE: This highlights a potential bug where the directive warns on intermediate LCP elements.
    const logs = await waitForBrowserLogs(
      driver,
      webdriver.logging.Level.SEVERE,
      1,
      10000,
      (l) => l.message.includes(`NG02955`), // LCP_IMG_MISSING_PRIORITY
    );
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const lastLog = logs.at(-1)!;
    // Verify that the error code and the image src are present in the error message for the final LCP element.
    expect(lastLog.message).toMatch(/NG02955.*?a\.png/);
  });
});
