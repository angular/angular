/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import {logging, WebDriver} from 'selenium-webdriver';

declare var browser: WebDriver;
declare var expect: any;

// TODO (juliemr): remove this method once this becomes a protractor plugin
export async function verifyNoBrowserErrors() {
  const browserLog = await browser.manage().logs().get('browser');
  const collectedErrors: any[] = [];

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

    if (logEntry.level.value >= logging.Level.INFO.value) {
      collectedErrors.push(msg);
    }
  });

  expect(collectedErrors).toEqual([]);
}
