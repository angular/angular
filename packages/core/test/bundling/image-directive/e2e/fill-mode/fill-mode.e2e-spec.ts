/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {browser} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should not warn when an image in the fill mode is rendered correctly', async () => {
    await browser.get('/e2e/fill-mode-passing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if an image in the fill mode has zero height after rendering', async () => {
    await browser.get('/e2e/fill-mode-failing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);

    expect(logs.length).toEqual(1);
    // Image loading order is not guaranteed, so all logs, rather than single entry
    // needs to be checked in order to test whether a given error message is present.
    const expectErrorMessageInLogs = (logs: logging.Entry[], message: string) => {
      expect(logs.some((log) => {
        return log.message.includes(message);
      })).toBeTruthy();
    };

    expectErrorMessageInLogs(
        logs,
        'NG02952: The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
            'with the `ngSrc=\\"/e2e/logo-500w.jpg\\"`) has detected that the height ' +
            'of the fill-mode image is zero. This is likely because the containing element ' +
            'does not have the CSS \'position\' property set to one of the following: ' +
            '\\"relative\\", \\"fixed\\", or \\"absolute\\". To fix this problem, ' +
            'make sure the container element has the CSS \'position\' ' +
            'property defined and the height of the element is not zero.');
  });
});
