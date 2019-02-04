/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import * as webdriver from 'selenium-webdriver';
declare var browser: any;

// TODO (juliemr): remove this method once this becomes a protractor plugin
export function verifyNoBrowserErrors() {
  browser.manage().logs().get('browser').then(function(browserLog: any[]) {
    const errors: any[] = browserLog
                              .filter(logEntry => {
                                const msg = logEntry.message;
                                return (logEntry.level.value >= webdriver.logging.Level.INFO.value);
                              })
                              .map(logEntry => logEntry.message);
    if (errors.length) {
      fail(
          'Expected no warnings or errors in the browser console, but found:' +
          '\n\n\n' + errors.join('\n\n') + '\n\n');
    }
  });
}
