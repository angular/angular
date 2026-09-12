/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('formBuilder example', () => {
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
    await driver.get(`${baseUrl}/formBuilder`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].getAttribute('value')).toEqual('Nancy');
    expect(await inputs[1].getAttribute('value')).toEqual('Drew');
  });

  it('should update the validation status', async () => {
    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[1].getText()).toEqual('Validation status: VALID');

    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await inputs[0].clear();
    await inputs[0].sendKeys('a');
    await waitForAngular(driver);

    const updatedParagraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await updatedParagraphs[1].getText()).toEqual('Validation status: INVALID');
  });
});
