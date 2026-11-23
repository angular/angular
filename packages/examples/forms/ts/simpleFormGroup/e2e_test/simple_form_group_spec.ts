/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('formControlName example', () => {
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
      await driver.get(`${baseUrl}/simpleFormGroup`);
      await waitForAngular(driver);
    });

    it('should populate the form control values in the DOM', async () => {
      const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
      const lastInput = await driver.findElement(webdriver.By.css('[formControlName="last"]'));
      expect(await firstInput.getAttribute('value')).toEqual('Nancy');
      expect(await lastInput.getAttribute('value')).toEqual('Drew');
    });

    it('should show the error when the form is invalid', async () => {
      const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
      await firstInput.click();
      await firstInput.clear();
      await firstInput.sendKeys('a');
      await waitForAngular(driver);

      const errorDiv = await driver.findElement(webdriver.By.css('div'));
      expect(await errorDiv.getText()).toEqual('Name is too short.');
    });

    it('should set the value programmatically', async () => {
      const button = await driver.findElement(webdriver.By.css('button:not([type="submit"])'));
      await button.click();
      await waitForAngular(driver);

      const firstInput = await driver.findElement(webdriver.By.css('[formControlName="first"]'));
      const lastInput = await driver.findElement(webdriver.By.css('[formControlName="last"]'));
      expect(await firstInput.getAttribute('value')).toEqual('Carson');
      expect(await lastInput.getAttribute('value')).toEqual('Drew');
    });
  });
});
