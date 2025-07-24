/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* tslint:disable:no-console  */
import {browser} from 'protractor';
import {logging} from 'selenium-webdriver';

export async function collectBrowserLogs(
  loggingLevel: logging.Level,
  collectMoreSevereErrors: boolean = false,
): Promise<logging.Entry[]> {
  const browserLog = await browser.manage().logs().get('browser');
  const collectedLogs: logging.Entry[] = [];

  browserLog.forEach((logEntry) => {
    const msg = logEntry.message;

    console.log('>> ' + msg, logEntry);

    if (
      (!collectMoreSevereErrors && logEntry.level.value === loggingLevel.value) ||
      (collectMoreSevereErrors && logEntry.level.value >= loggingLevel.value)
    ) {
      collectedLogs.push(logEntry);
    }
  });
  return collectedLogs;
}

export async function verifyNoBrowserErrors() {
  const logs = await collectBrowserLogs(
    logging.Level.INFO,
    true /* collect more severe errors too */,
  );
  expect(logs).toEqual([]);
}
