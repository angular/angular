/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver} from '../../packages/examples/test-utils';

describe('Playground', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should run an Angular application in the preview', async () => {
    await driver.get(`${baseUrl}/playground`);

    await driver.wait(async () => {
      try {
        await driver.switchTo().defaultContent();
        const previewFrame = await driver.findElement(
          webdriver.By.css('iframe.adev-embedded-editor-preview[src^="http"]'),
        );
        await driver.switchTo().frame(previewFrame);
        const appRoot = await driver.findElement(webdriver.By.css('app-root'));
        const text = await appRoot.getText();
        if (text.includes('Hello world!')) {
          return true;
        }
      } catch {
        // Ignore errors while the preview iframe and Angular app are still loading.
      }
      await driver.sleep(1000);
      return false;
    }, 90_000);
  });
});
