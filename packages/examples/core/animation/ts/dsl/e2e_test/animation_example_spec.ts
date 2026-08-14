/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('animation example', () => {
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

  describe('index view', () => {
    it('should list out the current collection of items', async () => {
      await driver.get(`${baseUrl}/animation/dsl/`);
      await waitForAngular(driver);
      const container = await driver.findElement(webdriver.By.css('.toggle-container'));
      expect(await container.getText()).toEqual('Look at this box');
    });
  });
});
