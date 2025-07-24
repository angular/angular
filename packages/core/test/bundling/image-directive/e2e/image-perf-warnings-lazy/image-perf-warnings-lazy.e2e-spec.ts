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

describe('Image performance warnings', () => {
  it('should log a warning when a LCP image is loaded lazily', async () => {
    await browser.get('/e2e/image-perf-warnings-lazy');
    // Wait for load event
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Verify that both images were rendered.
    const imgs = element.all(by.css('img'));
    let srcA = await imgs.get(0).getAttribute('src');
    expect(srcA.endsWith('a.png')).toBe(true);
    let srcB = await imgs.get(1).getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);

    // Make sure that only one warning is in the console for image `a.png`,
    // since the `b.png` should be below the fold and not treated as an LCP element.
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(1);
    // Verify that the error code and the image src are present in the error message.
    expect(logs[0].message).toMatch(/NG0913.*?a\.png/);
  });
});
