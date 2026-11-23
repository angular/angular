/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('contentChild example', () => {
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
    await driver.get(`${baseUrl}/di/contentChild`);
    await waitForAngular(driver);
  });

  it('should query content child', async () => {
    const result = await driver.findElement(webdriver.By.css('div'));
    expect(await result.getText()).toEqual('pane: 1');

    const button = await driver.findElement(webdriver.By.css('button'));
    await button.click();
    await waitForAngular(driver);

    expect(await result.getText()).toEqual('pane: 2');
  });
});
