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

describe('http', function () {
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

  describe('fetching', function () {
    it('should fetch and display people', async function () {
      await driver.get(`${baseUrl}/`);
      await waitForAngular(driver);
      expect(await getComponentText(driver, 'http-app', '.people')).toEqual('hello, Jeff');
    });
  });
});

function getComponentText(driver: webdriver.WebDriver, selector: string, innerSelector: string) {
  return driver.executeScript<string>(
    `return document.querySelector("${selector}").querySelector("${innerSelector}").textContent.trim()`,
  );
}
