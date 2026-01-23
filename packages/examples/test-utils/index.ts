/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {logging, WebDriver} from 'selenium-webdriver';

declare var browser: WebDriver;
declare var expect: any;

// TODO (juliemr): remove this method once this becomes a protractor plugin
export async function verifyNoBrowserErrors() {
  const browserLog = await browser.manage().logs().get('browser');
  const collectedErrors: any[] = [];

  browserLog.forEach((logEntry) => {
    const msg = logEntry.message;

    console.log('>> ' + msg, logEntry);

    if (logEntry.level.value >= logging.Level.INFO.value) {
      collectedErrors.push(msg);
    }
  });

  expect(collectedErrors).toEqual([]);
}
