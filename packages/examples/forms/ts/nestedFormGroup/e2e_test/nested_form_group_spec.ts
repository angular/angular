/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('nestedFormGroup example', () => {
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
    await driver.get(`${baseUrl}/nestedFormGroup`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
    const lastInput = await driver.findElement(webdriver.By.css('[formControlName="last"]'));
    expect(await firstInput.getAttribute('value')).toEqual('Nancy');
    expect(await lastInput.getAttribute('value')).toEqual('Drew');
  });

  it('should show the error when name is invalid', async () => {
    const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
    await firstInput.click();
    await firstInput.clear();
    await firstInput.sendKeys('a');
    await waitForAngular(driver);

    const p = await driver.findElement(webdriver.By.css('p'));
    expect(await p.getText()).toEqual('Name is invalid.');
  });

  it('should set the value programmatically', async () => {
    const button = await driver.findElement(webdriver.By.css('button:not([type="submit"])'));
    await button.click();
    await waitForAngular(driver);

    const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
    const lastInput = await driver.findElement(webdriver.By.css('[formControlName="last"]'));
    expect(await firstInput.getAttribute('value')).toEqual('Bess');
    expect(await lastInput.getAttribute('value')).toEqual('Marvin');
  });
});
