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

describe('Template-Driven Forms', function () {
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

  it('should display errors', async function () {
    await driver.get(`${baseUrl}/`);
    await waitForAngular(driver);

    const forms = await driver.findElements(webdriver.By.css('form'));
    const input = await driver.findElement(webdriver.By.css('#creditCard'));
    const firstName = await driver.findElement(webdriver.By.css('#firstName'));

    await input.sendKeys('invalid');
    await firstName.click();
    await waitForAngular(driver);

    const innerHTML = await driver.executeScript<string>(
      'return arguments[0].innerHTML;',
      forms[0],
    );
    expect(innerHTML).toContain('is invalid credit card number');
  });
});
