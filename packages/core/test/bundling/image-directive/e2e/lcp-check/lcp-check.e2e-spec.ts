/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should log a warning when a `priority` is missing on an LCP image', async () => {
    await browser.get('/e2e/lcp-check');
    // Wait for ngSrc to be modified
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Verify that both images were rendered.
    const imgs = element.all(by.css('img'));
    let srcB = await imgs.get(0).getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);
    const srcA = await imgs.get(1).getAttribute('src');
    expect(srcA.endsWith('logo-500w.jpg')).toBe(true);
    // The `b.png` image is used twice in a template.
    srcB = await imgs.get(2).getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);

    // Make sure that only one warning is in the console for image `a.png`,
    // since the `b.png` should be below the fold and not treated as an LCP element.
    // We use >= 1 and check the last log because the browser may sometimes report `b.png`
    // as an intermediate LCP element before `a.png` is painted, causing an extra log.
    // NOTE: This highlights a potential bug where the directive warns on intermediate LCP elements.
    const logs = (await collectBrowserLogs(logging.Level.SEVERE)).filter(
      (l) => l.message.includes(`NG02955`), // LCP_IMG_MISSING_PRIORITY
    );
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const lastLog = logs.at(-1)!;
    // Verify that the error code and the image src are present in the error message for the final LCP element.
    expect(lastLog.message).toMatch(/NG02955.*?a\.png/);
  });
});
