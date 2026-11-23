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

describe('hello world', function () {
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

  describe('hello world app', function () {
    it('should greet', async function () {
      await driver.get(`${baseUrl}/`);
      await waitForAngular(driver);

      expect(await getComponentText(driver, 'hello-app', '.greeting')).toEqual('hello world!');
    });

    it('should change greeting', async function () {
      await driver.get(`${baseUrl}/`);
      await waitForAngular(driver);

      await clickComponentButton(driver, 'hello-app', '.changeButton');
      await waitForAngular(driver);
      expect(await getComponentText(driver, 'hello-app', '.greeting')).toEqual('howdy world!');
    });
  });
});

function getComponentText(driver: webdriver.WebDriver, selector: string, innerSelector: string) {
  return driver.executeScript(
    `return document.querySelector("${selector}").querySelector("${innerSelector}").textContent`,
  );
}

function clickComponentButton(
  driver: webdriver.WebDriver,
  selector: string,
  innerSelector: string,
) {
  return driver.executeScript(
    `return document.querySelector("${selector}").querySelector("${innerSelector}").click()`,
  );
}
