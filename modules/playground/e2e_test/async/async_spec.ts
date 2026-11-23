/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {
  createWebDriver,
  verifyNoBrowserErrors,
  waitForAngular,
} from '../../../../packages/examples/test-utils/index.js';

describe('async', () => {
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
    await driver.get(`${baseUrl}/`);
    await waitForAngular(driver);
  });

  it('should work with synchronous actions', async () => {
    const increment = await driver.findElement(webdriver.By.css('#increment'));
    const actionBtn = await increment.findElement(webdriver.By.css('.action'));
    await actionBtn.click();
    await waitForAngular(driver);

    const val = await increment.findElement(webdriver.By.css('.val'));
    expect(await val.getText()).toEqual('1');
  });

  it('should wait for asynchronous actions', async () => {
    const timeout = await driver.findElement(webdriver.By.css('#delayedIncrement'));
    const val = await timeout.findElement(webdriver.By.css('.val'));

    // At this point, the async action is still pending, so the count should still be 0.
    expect(await val.getText()).toEqual('0');

    const actionBtn = await timeout.findElement(webdriver.By.css('.action'));
    await actionBtn.click();
    await waitForAngular(driver);

    expect(await val.getText()).toEqual('1');
  });

  it('should notice when asynchronous actions are cancelled', async () => {
    const timeout = await driver.findElement(webdriver.By.css('#delayedIncrement'));
    const val = await timeout.findElement(webdriver.By.css('.val'));

    expect(await val.getText()).toEqual('0');

    const actionBtn = await timeout.findElement(webdriver.By.css('.action'));
    await actionBtn.click();

    const cancelBtn = await timeout.findElement(webdriver.By.css('.cancel'));
    await cancelBtn.click();
    await waitForAngular(driver);

    expect(await val.getText()).toEqual('0');
  });

  it('should wait for a series of asynchronous actions', async () => {
    const timeout = await driver.findElement(webdriver.By.css('#multiDelayedIncrements'));
    const val = await timeout.findElement(webdriver.By.css('.val'));

    expect(await val.getText()).toEqual('0');

    const actionBtn = await timeout.findElement(webdriver.By.css('.action'));
    await actionBtn.click();
    await waitForAngular(driver);

    expect(await val.getText()).toEqual('10');
  });

  it('should wait via frameworkStabilizer', async () => {
    const whenAllStable = async (): Promise<any> => {
      return await driver.executeAsyncScript('window.frameworkStabilizers[0](arguments[0]);');
    };

    const timeout = await driver.findElement(webdriver.By.css('#multiDelayedIncrements'));
    const val = await timeout.findElement(webdriver.By.css('.val'));

    expect(await val.getText()).toEqual('0');

    const actionBtn = await timeout.findElement(webdriver.By.css('.action'));
    await actionBtn.click();

    await whenAllStable();
    expect(await val.getText()).toEqual('10');

    await whenAllStable();
  });
});
