/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* tslint:disable:no-console  */
import {browser} from 'protractor';

const yargs = require('yargs');
import * as webdriver from 'selenium-webdriver';

let cmdArgs: {'bundles': boolean};

declare var expect: any;

export function readCommandLine(extraOptions?: {[key: string]: any}) {
  const options: {[key: string]: any} = {
    'bundles': {describe: 'Whether to use the angular bundles or not.', default: false}
  };
  if (extraOptions) {
    for (const key in extraOptions) {
      options[key] = extraOptions[key];
    }
  }

  cmdArgs = yargs.usage('Angular e2e test options.').options(options).help('ng-help').wrap(40).argv;
  return cmdArgs;
}

export function openBrowser(config: {
  url: string,
  params?: {name: string, value: any}[],
  ignoreBrowserSynchronization?: boolean
}) {
  if (config.ignoreBrowserSynchronization) {
    browser.ignoreSynchronization = true;
  }
  let params = config.params || [];
  if (!params.some((param) => param.name === 'bundles')) {
    params = params.concat([{name: 'bundles', value: cmdArgs.bundles}]);
  }

  const urlParams: string[] = [];
  params.forEach((param) => { urlParams.push(param.name + '=' + param.value); });
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
  browser.manage().logs().get('browser').then(function(browserLog: any) {
    const filteredLog = browserLog.filter(function(logEntry: any) {
      if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
        console.log('>> ' + logEntry.message);
      }
      return logEntry.level.value > webdriver.logging.Level.WARNING.value;
    });
    expect(filteredLog).toEqual([]);
  });
}
