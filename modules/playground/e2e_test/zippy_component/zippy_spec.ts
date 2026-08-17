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

describe('Zippy Component', function () {
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

  describe('zippy', function () {
    beforeEach(async function () {
      await driver.get(`${baseUrl}/`);
      await waitForAngular(driver);
    });

    it("should change the zippy title depending on it's state", async function () {
      const zippyTitle = await driver.findElement(webdriver.By.css('.zippy__title'));
      expect(await zippyTitle.getText()).toEqual('▾ Details');
      await zippyTitle.click();
      await waitForAngular(driver);
      expect(await zippyTitle.getText()).toEqual('▸ Details');
    });

    it('should have zippy content', async function () {
      const content = await driver.findElement(webdriver.By.css('.zippy__content'));
      expect(await content.getText()).toEqual('This is some content.');
    });

    it('should toggle when the zippy title is clicked', async function () {
      const zippyTitle = await driver.findElement(webdriver.By.css('.zippy__title'));
      const content = await driver.findElement(webdriver.By.css('.zippy__content'));

      await zippyTitle.click();
      await waitForAngular(driver);
      expect(await content.isDisplayed()).toEqual(false);

      await zippyTitle.click();
      await waitForAngular(driver);
      expect(await content.isDisplayed()).toEqual(true);
    });
  });
});
