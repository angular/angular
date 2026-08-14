/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('ngIf', () => {
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

  async function loadPage() {
    await driver.get(`${baseUrl}/ngIf`);
    await waitForAngular(driver);
  }

  describe('ng-if-simple', () => {
    const comp = 'ng-if-simple';
    it('should hide/show content', async () => {
      await loadPage();
      const compEl = await driver.findElement(webdriver.By.css(comp));
      expect(await compEl.getText()).toEqual('hide show = true\nText to show');
      const button = await driver.findElement(webdriver.By.css(`${comp} button`));
      await button.click();
      await waitForAngular(driver);
      expect(await compEl.getText()).toEqual('show show = false');
    });
  });

  describe('ng-if-else', () => {
    const comp = 'ng-if-else';
    it('should hide/show content', async () => {
      await loadPage();
      const compEl = await driver.findElement(webdriver.By.css(comp));
      expect(await compEl.getText()).toEqual('hide show = true\nText to show');
      const button = await driver.findElement(webdriver.By.css(`${comp} button`));
      await button.click();
      await waitForAngular(driver);
      expect(await compEl.getText()).toEqual(
        'show show = false\nAlternate text while primary text is hidden',
      );
    });
  });

  describe('ng-if-then-else', () => {
    const comp = 'ng-if-then-else';

    it('should hide/show content', async () => {
      await loadPage();
      const compEl = await driver.findElement(webdriver.By.css(comp));
      expect(await compEl.getText()).toEqual(
        'hideSwitch Primary show = true\nPrimary text to show',
      );
      const buttons = await driver.findElements(webdriver.By.css(`${comp} button`));
      await buttons[1].click();
      await waitForAngular(driver);
      expect(await compEl.getText()).toEqual(
        'hideSwitch Primary show = true\nSecondary text to show',
      );
      const updatedButtons = await driver.findElements(webdriver.By.css(`${comp} button`));
      await updatedButtons[0].click();
      await waitForAngular(driver);
      expect(await compEl.getText()).toEqual(
        'showSwitch Primary show = false\nAlternate text while primary text is hidden',
      );
    });
  });

  describe('ng-if-as', () => {
    const comp = 'ng-if-as';
    it('should hide/show content', async () => {
      await loadPage();
      const compEl = await driver.findElement(webdriver.By.css(comp));
      expect(await compEl.getText()).toEqual('Next User\nWaiting... (user is null)');
      const button = await driver.findElement(webdriver.By.css(`${comp} button`));
      await button.click();
      await waitForAngular(driver);
      expect(await compEl.getText()).toEqual('Next User\nHello Smith, John!');
    });
  });
});
