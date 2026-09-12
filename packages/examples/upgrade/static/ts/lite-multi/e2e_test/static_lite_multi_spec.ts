/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('upgrade/static (lite with multiple downgraded modules)', () => {
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

  it('should correctly bootstrap multiple downgraded modules', async () => {
    const navButtons = await driver.findElements(webdriver.By.css('nav button'));
    await navButtons[1].click();
    await waitForAngular(driver);

    const mainContent = await driver.findElement(webdriver.By.css('main'));
    expect(await mainContent.getText()).toBe('Component B');

    const updatedNavButtons = await driver.findElements(webdriver.By.css('nav button'));
    await updatedNavButtons[0].click();
    await waitForAngular(driver);

    expect(await mainContent.getText()).toBe('Component A | ng1(ng2)');
  });
});
