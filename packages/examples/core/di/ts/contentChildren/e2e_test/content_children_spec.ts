/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('contentChildren example', () => {
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

  beforeEach(async () => {
    await driver.get(`${baseUrl}/di/contentChildren`);
    await waitForAngular(driver);
  });

  it('should query content children', async () => {
    const resultTopLevel = await driver.findElement(webdriver.By.css('.top-level'));
    expect(await resultTopLevel.getText()).toEqual('Top level panes: 1, 2');

    const button = await driver.findElement(webdriver.By.css('button'));
    await button.click();
    await waitForAngular(driver);

    expect(await resultTopLevel.getText()).toEqual('Top level panes: 1, 2, 3');
  });

  it('should query nested content children', async () => {
    const resultNested = await driver.findElement(webdriver.By.css('.nested'));
    expect(await resultNested.getText()).toEqual('Arbitrary nested panes: 1, 2');

    const button = await driver.findElement(webdriver.By.css('button'));
    await button.click();
    await waitForAngular(driver);

    expect(await resultNested.getText()).toEqual('Arbitrary nested panes: 1, 2, 3, 3_1, 3_2');
  });
});
