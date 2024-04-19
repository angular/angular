/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as webdriver from 'selenium-webdriver';
import {browser} from 'protractor';

export async function verifyNoBrowserErrors(): Promise<void> {
  const browserLog = await browser.manage().logs().get('browser');
  const errors: string[] = [];

  for (const {message, level} of browserLog) {
    console.log('>> ' + message);
    if (level.value >= webdriver.logging.Level.INFO.value) {
      errors.push(message);
    }
  }

  expect(errors).toEqual([]);
}

export async function navigateTo(url: string): Promise<void> {
  await browser.driver.get(browser.baseUrl + url);
}

export async function bootstrapClientApp(): Promise<void> {
  await browser.executeScript('doBootstrap()');
}
