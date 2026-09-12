/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('ngModelGroup example', () => {
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
    await driver.get(`${baseUrl}/ngModelGroup`);
    await waitForAngular(driver);
  });

  it('should populate the UI with initial values', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].getAttribute('value')).toEqual('Nancy');
    expect(await inputs[1].getAttribute('value')).toEqual('J');
    expect(await inputs[2].getAttribute('value')).toEqual('Drew');
  });

  it('should show the error when name is invalid', async () => {
    const inputs = await driver.findElements(webdriver.By.css('input'));
    await inputs[0].click();
    await inputs[0].clear();
    await inputs[0].sendKeys('a');
    await waitForAngular(driver);

    const p = await driver.findElement(webdriver.By.css('p'));
    expect(await p.getText()).toEqual('Name is invalid.');
  });

  it('should set the value when changing the domain model', async () => {
    const buttons = await driver.findElements(webdriver.By.css('button'));
    await buttons[1].click();
    await waitForAngular(driver);

    const inputs = await driver.findElements(webdriver.By.css('input'));
    expect(await inputs[0].getAttribute('value')).toEqual('Bess');
    expect(await inputs[1].getAttribute('value')).toEqual('S');
    expect(await inputs[2].getAttribute('value')).toEqual('Marvin');
  });
});
