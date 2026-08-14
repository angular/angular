/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('reactiveRadioButtons example', () => {
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
    await driver.get(`${baseUrl}/reactiveRadioButtons`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].isSelected()).toBe(false);
    expect(await inputs[1].isSelected()).toBe(true);
    expect(await inputs[2].isSelected()).toBe(false);

    const p = await driver.findElement(webdriver.By.css('p'));
    expect(await p.getText()).toEqual('Form value: { "food": "lamb" }');
  });

  it('update model and other buttons as the UI value changes', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await waitForAngular(driver);

    expect(await inputs[0].isSelected()).toBe(true);
    expect(await inputs[1].isSelected()).toBe(false);
    expect(await inputs[2].isSelected()).toBe(false);

    const p = await driver.findElement(webdriver.By.css('p'));
    expect(await p.getText()).toEqual('Form value: { "food": "beef" }');
  });
});
