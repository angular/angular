/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('upgrade/static (lite with multiple downgraded modules and shared root module)', () => {
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

  it('should share the same injectable instance across downgraded modules A and B', async () => {
    const compA = await driver.findElement(webdriver.By.css('ng2-a'));
    const compB = await driver.findElement(webdriver.By.css('ng2-b'));
    expect(await compA.getText()).toBe('Component A (Service ID: 2)');
    expect(await compB.getText()).toBe('Component B (Service ID: 2)');
  });

  it('should use a different injectable instance on downgraded module C', async () => {
    const compC = await driver.findElement(webdriver.By.css('ng2-c'));
    expect(await compC.getText()).toBe('Component C (Service ID: 1)');
  });
});
