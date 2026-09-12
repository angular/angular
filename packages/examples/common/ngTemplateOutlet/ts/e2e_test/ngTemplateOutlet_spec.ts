/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('ngTemplateOutlet', () => {
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

  describe('ng-template-outlet-example', () => {
    it('should render', async () => {
      await driver.get(`${baseUrl}/ngTemplateOutlet`);
      await waitForAngular(driver);
      const spans = await driver.findElements(webdriver.By.css('ng-template-outlet-example span'));
      const texts = await Promise.all(spans.map((el) => el.getText()));
      expect(texts).toEqual(['Hello', 'Hello World!', 'Ahoj Svet!']);
    });
  });
});
