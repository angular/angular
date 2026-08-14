/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver} from '../browser-logs-util';

describe('NgOptimizedImage directive (basic)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should render an image with an updated `src`', async () => {
    await driver.get(`${baseUrl}/e2e/basic`);
    const imgs = await driver.findElements(webdriver.By.css('img'));
    const src = await imgs[0].getAttribute('src');
    expect(/angular\.svg/.test(src)).toBe(true);

    // Since there are no preconnect tags on a page,
    // we expect a log in a console that mentions that.
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    expect(logs.length).toEqual(1);

    // Verify that the error code and a raw image src are present.
    expect(logs[0].message).toMatch(/NG02956.*?a\.png/);
  });
});
