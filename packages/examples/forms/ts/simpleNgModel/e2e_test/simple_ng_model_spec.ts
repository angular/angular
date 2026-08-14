/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('simpleNgModel example', () => {
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
    await driver.get(`${baseUrl}/simpleNgModel`);
    await waitForAngular(driver);
  });

  it('should update the domain model as you type', async () => {
    const input = await driver.findElement(webdriver.By.css('input'));
    await input.click();
    await input.sendKeys('Carson');
    await waitForAngular(driver);

    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[0].getText()).toEqual('Value: Carson');
  });

  it('should report the validity correctly', async () => {
    let paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[1].getText()).toEqual('Valid: false');

    const input = await driver.findElement(webdriver.By.css('input'));
    await input.click();
    await input.sendKeys('a');
    await waitForAngular(driver);

    paragraphs = await driver.findElements(webdriver.By.css('p'));
    expect(await paragraphs[1].getText()).toEqual('Valid: true');
  });

  it('should set the value by changing the domain model', async () => {
    const button = await driver.findElement(webdriver.By.css('button'));
    await button.click();
    await waitForAngular(driver);

    const input = await driver.findElement(webdriver.By.css('input'));
    expect(await input.getAttribute('value')).toEqual('Nancy');
  });
});
