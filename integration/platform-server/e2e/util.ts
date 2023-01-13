/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import * as webdriver from 'selenium-webdriver';
declare var browser: any;
declare var expect: any;

export function verifyNoBrowserErrors() {
  browser.manage().logs().get('browser').then(function(browserLog: any[]) {
    const errors: any[] = [];
    browserLog.filter(logEntry => {
      const msg = logEntry.message;
      console.log('>> ' + msg);
      if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
        errors.push(msg);
      }
    });
    expect(errors).toEqual([]);
  });
}
