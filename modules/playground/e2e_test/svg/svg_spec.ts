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

describe('SVG', function () {
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

  it('should display SVG component contents', async function () {
    const texts = await driver.findElements(webdriver.By.css('g text'));
    expect(await texts[0].getText()).toEqual('Hello');
  });
});
