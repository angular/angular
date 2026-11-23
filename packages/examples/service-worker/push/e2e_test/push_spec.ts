/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../test-utils';

describe('SW `SwPush` example', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  afterEach(async () => {
    await verifyNoBrowserErrors(driver);
  });

  it('should be enabled', async () => {
    await driver.get(`${baseUrl}/push`);
    await waitForAngular(driver);
    const appElem = await driver.findElement(webdriver.By.css('example-app'));
    expect(await appElem.getText()).toBe('SW enabled: true');
  });
});
