/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('simpleForm example', () => {
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
    await driver.get(`${baseUrl}/simpleForm`);
    await waitForAngular(driver);
  });

  it('should update the domain model as you type', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await inputs[0].sendKeys('Nancy');
    await waitForAngular(driver);

    await inputs[1].click();
    await inputs[1].sendKeys('Drew');
    await waitForAngular(driver);

    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[0].getText()).toEqual('First name value: Nancy');
    expect(await paragraphs[2].getText()).toEqual(
      'Form value: { "first": "Nancy", "last": "Drew" }',
    );
  });

  it('should report the validity correctly', async () => {
    let paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[1].getText()).toEqual('First name valid: false');
    expect(await paragraphs[3].getText()).toEqual('Form valid: false');

    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await inputs[0].sendKeys('a');
    await waitForAngular(driver);

    paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[1].getText()).toEqual('First name valid: true');
    expect(await paragraphs[3].getText()).toEqual('Form valid: true');
  });
});
