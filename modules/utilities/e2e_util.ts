/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {browser} from 'protractor';
import * as webdriver from 'selenium-webdriver';

declare var expect: any;

export function openBrowser(config: {
  url?: string;
  params?: {name: string; value: any}[];
  ignoreBrowserSynchronization?: boolean;
}) {
  if (config.ignoreBrowserSynchronization) {
    browser.ignoreSynchronization = true;
  }
  const urlParams: string[] = [];
  if (config.params) {
    config.params.forEach((param) => urlParams.push(param.name + '=' + param.value));
  }
  const url = encodeURI(config.url + '?' + urlParams.join('&'));
  browser.get(url);
  if (config.ignoreBrowserSynchronization) {
    browser.sleep(2000);
  }
}

/**
 * @experimental This API will be moved to Protractor.
 */
export function verifyNoBrowserErrors() {
  // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
  // so that the browser logs can be read out!
  browser.executeScript('1+1');
  browser
    .manage()
    .logs()
    .get('browser')
    .then(function (browserLog: any) {
      const filteredLog = browserLog.filter(function (logEntry: any) {
        if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
          console.log('>> ' + logEntry.message);
        }
        return logEntry.level.value > webdriver.logging.Level.WARNING.value;
      });
      expect(filteredLog).toEqual([]);
    });
}
