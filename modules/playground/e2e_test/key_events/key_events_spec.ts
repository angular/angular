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

const Key = webdriver.Key;

describe('key_events', function () {
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

  it('should display correct key names', async function () {
    const areas = await driver.findElements(webdriver.By.css('.sample-area'));
    const firstArea = areas[0];
    expect(await firstArea.getText()).toEqual('(none)');

    await firstArea.click();

    // testing different key categories:
    await firstArea.sendKeys(Key.ENTER);
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('enter');

    await firstArea.sendKeys(Key.chord(Key.SHIFT, Key.ENTER));
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('shift.enter');

    await firstArea.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.ENTER));
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('control.shift.enter');

    await firstArea.sendKeys(' ');
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('space');

    await firstArea.sendKeys('u');
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('u');

    await firstArea.sendKeys(Key.chord(Key.CONTROL, 'b'));
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('control.b');

    await firstArea.sendKeys(Key.F1);
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('f1');

    await firstArea.sendKeys(Key.chord(Key.ALT, Key.F1));
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('alt.f1');

    await firstArea.sendKeys(Key.chord(Key.CONTROL, Key.F1));
    await waitForAngular(driver);
    expect(await firstArea.getText()).toEqual('control.f1');
  });

  it('should correctly react to the specified key', async function () {
    const areas = await driver.findElements(webdriver.By.css('.sample-area'));
    const secondArea = areas[1];
    await secondArea.click();
    await secondArea.sendKeys(Key.chord(Key.SHIFT, Key.ENTER));
    await waitForAngular(driver);
    expect(await secondArea.getText()).toEqual('You pressed shift.enter!');
  });

  it('should not react to incomplete keys', async function () {
    const areas = await driver.findElements(webdriver.By.css('.sample-area'));
    const secondArea = areas[1];
    await secondArea.click();
    await secondArea.sendKeys(Key.ENTER);
    await waitForAngular(driver);
    expect(await secondArea.getText()).toEqual('');
  });

  it('should not react to keys with more modifiers', async function () {
    const areas = await driver.findElements(webdriver.By.css('.sample-area'));
    const secondArea = areas[1];
    await secondArea.click();
    await secondArea.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.ENTER));
    await waitForAngular(driver);
    expect(await secondArea.getText()).toEqual('');
  });
});
