/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('selectControl example', () => {
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
    await driver.get(`${baseUrl}/selectControl`);
    await waitForAngular(driver);
  });

  it('should initially select the placeholder option', async () => {
    const options = await driver.findElements(webdriver.By.css('option'));
    expect(await options[0].isSelected()).toBe(true);
  });

  it('should update the model when the value changes in the UI', async () => {
    const select = await driver.findElement(webdriver.By.css('select'));
    const options = await driver.findElements(webdriver.By.css('option'));
    await select.click();
    await options[1].click();
    await waitForAngular(driver);

    const p = await driver.findElement(webdriver.By.css('p'));
    expect(await p.getText()).toEqual(
      'Form value: { "state": { "name": "Arizona", "abbrev": "AZ" } }',
    );
  });
});
