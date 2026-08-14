/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('nestedFormArray example', () => {
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
    await driver.get(`${baseUrl}/nestedFormArray`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].getAttribute('value')).toEqual('SF');
    expect(await inputs[1].getAttribute('value')).toEqual('NY');
  });

  it('should add inputs programmatically', async () => {
    let inputs = await driver.findElements(webdriver.By.css('input'));
    expect(inputs.length).toBe(2);

    const buttons = await driver.findElements(webdriver.By.css('button'));
    await buttons[1].click();
    await waitForAngular(driver);

    inputs = await driver.findElements(webdriver.By.css('input'));
    expect(inputs.length).toBe(3);
  });

  it('should set the value programmatically', async () => {
    const buttons = await driver.findElements(webdriver.By.css('button'));
    await buttons[2].click();
    await waitForAngular(driver);

    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].getAttribute('value')).toEqual('LA');
    expect(await inputs[1].getAttribute('value')).toEqual('MTV');
  });
});
