/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors} from '../../../../../test-utils';

describe('testability example', () => {
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

  describe('using task tracking', () => {
    it('times out with a list of tasks', async () => {
      await driver.get(`${baseUrl}/testability/whenStable/`);

      // Script that runs in the browser and calls whenStable with a timeout.
      const waitWithResultScript = `
        var done = arguments[arguments.length - 1];
        var rootEl = document.querySelector('example-app');
        var testability = window.getAngularTestability(rootEl);
        testability.whenStable(function() {
          done();
        }, 1000);
      `;

      const startButton = await driver.findElement(webdriver.By.css('.start-button'));
      await startButton.click();

      await driver.executeAsyncScript(waitWithResultScript);
      const statusEl = await driver.findElement(webdriver.By.css('.status'));
      expect(await statusEl.getText()).not.toContain('done');
    });
  });
});
