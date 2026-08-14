/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../test-utils';

describe('SW `SwRegistrationOptions` example', () => {
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

  it('not register the SW by default', async () => {
    await driver.get(`${baseUrl}/registration-options`);
    await waitForAngular(driver);
    const appElem = await driver.findElement(webdriver.By.css('example-app'));
    expect(await appElem.getText()).toBe('SW enabled: false');
  });

  it('register the SW when navigating to `?sw=true`', async () => {
    await driver.get(`${baseUrl}/registration-options?sw=true`);
    await waitForAngular(driver);
    const appElem = await driver.findElement(webdriver.By.css('example-app'));
    expect(await appElem.getText()).toBe('SW enabled: true');
  });
});
