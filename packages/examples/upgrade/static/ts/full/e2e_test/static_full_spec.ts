/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';

describe('upgrade/static (full)', () => {
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

  it('should render the `ng2-heroes` component', async () => {
    const h1 = await driver.findElement(webdriver.By.css('h1'));
    expect(await h1.getText()).toEqual('Heroes');

    const ps = await driver.findElements(webdriver.By.css('p'));
    expect(await ps[0].getText()).toEqual('There are 3 heroes.');
  });

  it('should render 3 ng1-hero components', async () => {
    const heroComponents = await driver.findElements(webdriver.By.css('ng1-hero'));
    expect(heroComponents.length).toEqual(3);
  });

  it('should add a new hero when the "Add Hero" button is pressed', async () => {
    const buttons = await driver.findElements(webdriver.By.css('button'));
    const addHeroButton = buttons[buttons.length - 1];
    expect(await addHeroButton.getText()).toEqual('Add Hero');
    await addHeroButton.click();
    await waitForAngular(driver);

    const heroComponents = await driver.findElements(webdriver.By.css('ng1-hero'));
    const lastHeroName = await heroComponents[heroComponents.length - 1]
      .findElement(webdriver.By.css('h2'))
      .getText();
    expect(lastHeroName).toEqual('Kamala Khan');
  });

  it('should remove a hero when the "Remove" button is pressed', async () => {
    let heroComponents = await driver.findElements(webdriver.By.css('ng1-hero'));
    const firstHeroName = await heroComponents[0].findElement(webdriver.By.css('h2')).getText();
    expect(firstHeroName).toEqual('Superman');

    const removeHeroButton = await heroComponents[0].findElement(
      webdriver.By.xpath(".//button[text()='Remove']"),
    );
    expect(await removeHeroButton.getText()).toEqual('Remove');
    await removeHeroButton.click();
    await waitForAngular(driver);

    heroComponents = await driver.findElements(webdriver.By.css('ng1-hero'));
    expect(heroComponents.length).toEqual(2);

    const newFirstHeroName = await heroComponents[0].findElement(webdriver.By.css('h2')).getText();
    expect(newFirstHeroName).toEqual('Wonder Woman');
  });
});
