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

export async function collectBrowserLogs(
    loggingLevel: logging.Level,
    collectMoreSevereErrors: boolean = false): Promise<logging.Entry[]> {
  const browserLog = await browser.manage().logs().get('browser');
  const collectedLogs: logging.Entry[] = [];

  browserLog.forEach(logEntry => {
    const msg = logEntry.message;

    // Since we currently use the `ts_devserver` from the Bazel TypeScript rules, which does
    // fallback to the "index.html" file for HTML5 pushState routing but does always serve the
    // expected fallback with a 404 status code, the browser will print a message about the 404,
    // while the page loaded properly. Ideally the "ts_devserver" would allow us to opt-in for
    // just returning a 200 status code, but the devserver is intended to be kept manually, so
    // we manually filter this error before ensuring there are no console errors.
    // TODO: This is a current limitation of using the "ts_devserver" with Angular routing.
    // Tracked with: TOOL-629
    if (msg.includes(
            `Failed to load resource: the server responded with a status of 404 (Not Found)`)) {
      return;
    }

    console.log('>> ' + msg, logEntry);

    if ((!collectMoreSevereErrors && logEntry.level.value === loggingLevel.value) ||
        (collectMoreSevereErrors && logEntry.level.value >= loggingLevel.value)) {
      collectedLogs.push(logEntry);
    }
  });
  return collectedLogs;
}

export async function verifyNoBrowserErrors() {
  const logs =
      await collectBrowserLogs(logging.Level.INFO, true /* collect more severe errors too */);
  expect(logs).toEqual([]);
}
