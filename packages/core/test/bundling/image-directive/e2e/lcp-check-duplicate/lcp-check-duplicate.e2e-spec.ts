/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {browser, by, element} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should log a warning when a `priority` is missing on an LCP image', async () => {
    await browser.get('/e2e/lcp-check-duplicate');
    // Verify that both images were rendered.
    const imgs = element.all(by.css('img'));
    let srcB = await imgs.get(0).getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);
    let srcA = await imgs.get(1).getAttribute('src');
    expect(srcA.endsWith('a.png')).toBe(true);
    // The `b.png` and `a.png` images are used twice in a template.
    srcB = await imgs.get(2).getAttribute('src');
    expect(srcB.endsWith('b.png')).toBe(true);
    srcA = await imgs.get(3).getAttribute('src');
    expect(srcA.endsWith('a.png')).toBe(true);

    // Make sure that no warnings are in the console for image `a.png`,
    // since the first instance has the `priority` attribute, and is the LCP element.
    const logs = await collectBrowserLogs(logging.Level.SEVERE);
    expect(logs.length).toEqual(0);
  });
});
