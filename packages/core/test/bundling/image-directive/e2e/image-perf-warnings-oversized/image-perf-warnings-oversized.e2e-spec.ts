/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('Image performance warnings', () => {
  it('should warn if rendered image size is much smaller than intrinsic size', async () => {
    await browser.get('/e2e/image-perf-warnings-oversized');
    // Wait for load event
    await new Promise((resolve) => setTimeout(resolve, 600));
    const logs = await collectBrowserLogs(logging.Level.WARNING);

    expect(logs.length).toEqual(1);

    const expectedMessageRegex = /has intrinsic file dimensions much larger than/;
    expect(expectedMessageRegex.test(logs[0].message)).toBeTruthy();
  });

  // https://github.com/angular/angular/issues/57941
  it('should NOT warn if rendered SVG image size is much smaller that intrinsic size', async () => {
    await browser.get('/e2e/svg-no-perf-oversized-warnings');
    // Wait for load event
    await new Promise((resolve) => setTimeout(resolve, 600));

    const logs = await collectBrowserLogs(logging.Level.WARNING);
    // Please note that prior to shipping the fix, it was logging a warning
    // for the SVG image (see the attached issue above).
    expect(logs.length).toEqual(0);
  });
});
