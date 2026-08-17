/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('Location', () => {
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

  it('should verify paths', async () => {
    await driver.get(`${baseUrl}/location/#/bar/baz`);
    await waitForAngular(driver);
    const pathCode = await driver.findElement(webdriver.By.css('path-location code'));
    const hashCode = await driver.findElement(webdriver.By.css('hash-location code'));
    expect(await pathCode.getText()).toEqual('/location');
    expect(await hashCode.getText()).toEqual('/bar/baz');
  });
});
