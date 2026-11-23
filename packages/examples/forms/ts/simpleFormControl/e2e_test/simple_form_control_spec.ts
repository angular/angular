/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('simpleFormControl example', () => {
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
    beforeEach(async () => {
      await driver.get(`${baseUrl}/simpleFormControl`);
      await waitForAngular(driver);
    });

    it('should populate the form control value in the DOM', async () => {
      const input = await driver.findElement(webdriver.By.css('input'));
      const valueP = await driver.findElement(webdriver.By.css('p:first-of-type'));
      expect(await input.getAttribute('value')).toEqual('value');
      expect(await valueP.getText()).toEqual('Value: value');
    });

    it('should update the value as user types', async () => {
      const input = await driver.findElement(webdriver.By.css('input'));
      await input.click();
      await input.sendKeys('s!');
      await waitForAngular(driver);

      const valueP = await driver.findElement(webdriver.By.css('p:first-of-type'));
      expect(await valueP.getText()).toEqual('Value: values!');
    });

    it('should show the correct validity state', async () => {
      const statusP = await driver.findElement(webdriver.By.css('p:last-of-type'));
      expect(await statusP.getText()).toEqual('Validation status: VALID');

      const input = await driver.findElement(webdriver.By.css('input'));
      await input.click();
      await input.clear();
      await input.sendKeys('a');
      await waitForAngular(driver);

      expect(await statusP.getText()).toEqual('Validation status: INVALID');
    });

    it('should set the value programmatically', async () => {
      const button = await driver.findElement(webdriver.By.css('button'));
      await button.click();
      await waitForAngular(driver);

      const input = await driver.findElement(webdriver.By.css('input'));
      expect(await input.getAttribute('value')).toEqual('new value');
    });
  });
});
