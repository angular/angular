/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('ngComponentOutlet', () => {
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

  describe('ng-component-outlet-example', () => {
    it('should render simple', async () => {
      await driver.get(`${baseUrl}/ngComponentOutlet`);
      await waitForAngular(driver);
      const helloWorlds = await driver.findElements(webdriver.By.css('hello-world'));
      const texts = await Promise.all(helloWorlds.map((el) => el.getText()));
      expect(texts).toEqual(['Hello World!']);
    });
  });
});
