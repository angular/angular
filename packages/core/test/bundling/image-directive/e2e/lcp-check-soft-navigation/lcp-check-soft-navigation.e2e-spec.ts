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
  it('should log a warning when `priority` is missing on a soft navigation LCP image', async () => {
    await browser.get('/e2e/lcp-check-soft-navigation');

    await element(by.id('navigate-to-soft-navigation-lcp')).click();

    expect(await browser.getCurrentUrl()).toContain('/e2e/lcp-check-soft-navigation-target');
    const imageSrc = await element(by.id('soft-navigation-lcp')).getAttribute('src');
    expect(imageSrc.endsWith('logo-1500w.jpg')).toBe(true);

    // Allow the image paint and the PerformanceObserver callback to complete.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const logs = (await collectBrowserLogs(logging.Level.SEVERE)).filter((log) =>
      log.message.includes('NG02955'),
    );
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((log) => /NG02955.*?logo-1500w\.jpg/.test(log.message))).toBe(true);
  });

  it('should ignore a later interaction contentful paint that is not a soft navigation', async () => {
    await browser.get('/e2e/lcp-check-soft-navigation');
    await element(by.id('navigate-to-soft-navigation-lcp')).click();

    const softNavigationUrl = await browser.getCurrentUrl();
    expect(softNavigationUrl).toContain('/e2e/lcp-check-soft-navigation-target');

    // Confirm that this test established an active soft navigation.
    await new Promise((resolve) => setTimeout(resolve, 500));
    const softNavigationLogs = await collectBrowserLogs(logging.Level.SEVERE);
    expect(softNavigationLogs.some((log) => /NG02955.*?logo-1500w\.jpg/.test(log.message))).toBe(
      true,
    );

    await element(by.id('render-image-without-navigation')).click();

    expect(await browser.getCurrentUrl()).toEqual(softNavigationUrl);
    const imageSrc = await element(by.id('non-navigation-image')).getAttribute('src');
    expect(imageSrc.endsWith('logo-500w.jpg')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const logs = (await collectBrowserLogs(logging.Level.SEVERE)).filter(
      (log) => log.message.includes('NG02955') && log.message.includes('logo-500w.jpg'),
    );
    expect(logs).toEqual([]);
  });
});
