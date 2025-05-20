/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element, ElementHelper} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

// Verifies that both images used in a component were rendered.
async function verifyImagesPresent(element: ElementHelper) {
  const imgs = element.all(by.css('img'));
  const srcA = await imgs.get(0).getAttribute('src');
  expect(srcA.endsWith('a.png')).toBe(true);
  const srcB = await imgs.get(1).getAttribute('src');
  expect(srcB.endsWith('b.png')).toBe(true);
}

describe('NgOptimizedImage directive', () => {
  it('should log a warning when there is no preconnect for priority images', async () => {
    await browser.get('/e2e/preconnect-check');

    await verifyImagesPresent(element);

    // Make sure that only one warning is in the console for both images,
    // because they both have the same base URL (which is used to look for
    // corresponding `<link rel="preconnect">` tags).
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(1);

    // Verify that the error code and a raw image src are present in the
    // error message.
    expect(logs[0].message).toMatch(/NG02956.*?a\.png/);
  });

  it('should not produce any warnings in the console when a preconnect tag is present', async () => {
    await browser.get('/e2e/preconnect-check?preconnect');

    await verifyImagesPresent(element);

    // Make sure there are no browser logs.
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });
});
