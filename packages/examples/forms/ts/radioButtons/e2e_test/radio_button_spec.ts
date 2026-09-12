/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('radioButtons example', () => {
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
    await driver.get(`${baseUrl}/radioButtons`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].isSelected()).toBe(false);
    expect(await inputs[1].isSelected()).toBe(true);
    expect(await inputs[2].isSelected()).toBe(false);

    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[0].getText()).toEqual('Form value: { "food": "lamb" }');
    expect(await paragraphs[1].getText()).toEqual('myFood value: lamb');
  });

  it('update model and other buttons as the UI value changes', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await waitForAngular(driver);

    expect(await inputs[0].isSelected()).toBe(true);
    expect(await inputs[1].isSelected()).toBe(false);
    expect(await inputs[2].isSelected()).toBe(false);

    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[0].getText()).toEqual('Form value: { "food": "beef" }');
    expect(await paragraphs[1].getText()).toEqual('myFood value: beef');
  });
});
