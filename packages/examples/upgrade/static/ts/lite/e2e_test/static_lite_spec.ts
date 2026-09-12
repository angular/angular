/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../../test-utils';
import {expectToBeAHero, expectToHaveName} from './e2e_util';

describe('upgrade/static (lite)', () => {
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
    await driver.get(`${baseUrl}/`);
    await waitForAngular(driver);
  }

  const expectHeroes = async (isShown: boolean, ng1HeroCount = 3, statusMessage = 'Ready') => {
    const showHideBtn = await driver.findElement(webdriver.By.css('button'));
    expect(await showHideBtn.getText()).toBe(isShown ? 'Hide heroes' : 'Show heroes');

    const ng2HeroesList = await driver.findElements(webdriver.By.css('.ng2-heroes'));
    expect(ng2HeroesList.length > 0).toBe(isShown);
    if (isShown) {
      const ng2HeroesHeader = await ng2HeroesList[0].findElement(webdriver.By.css('h1'));
      const ng2HeroesExtra = await ng2HeroesList[0].findElement(webdriver.By.css('.extra'));
      expect(await ng2HeroesHeader.getText()).toBe('Heroes');
      expect(await ng2HeroesExtra.getText()).toBe(`Status: ${statusMessage}`);
    }

    const ng1Heroes = await driver.findElements(webdriver.By.css('.ng1-hero'));
    expect(ng1Heroes.length).toBe(isShown ? ng1HeroCount : 0);
    if (isShown) {
      for (const ng1Hero of ng1Heroes) {
        await expectToBeAHero(ng1Hero);
      }
    }
  };

  beforeEach(loadPage);

  it('should initially not render the heroes', async () => expectHeroes(false));

  it('should toggle the heroes when clicking the "show/hide" button', async () => {
    let showHideBtn = await driver.findElement(webdriver.By.css('button'));
    await showHideBtn.click();
    await waitForAngular(driver);
    await expectHeroes(true);

    showHideBtn = await driver.findElement(webdriver.By.css('button'));
    await showHideBtn.click();
    await waitForAngular(driver);
    await expectHeroes(false);
  });

  it('should add a new hero when clicking the "add" button', async () => {
    let showHideBtn = await driver.findElement(webdriver.By.css('button'));
    await showHideBtn.click();
    await waitForAngular(driver);

    const ng2HeroesAddBtn = await driver.findElement(
      webdriver.By.xpath("//button[text()='Add Hero']"),
    );
    await ng2HeroesAddBtn.click();
    await waitForAngular(driver);

    await expectHeroes(true, 4, 'Added hero Kamala Khan');
    const ng1Heroes = await driver.findElements(webdriver.By.css('.ng1-hero'));
    await expectToHaveName(ng1Heroes[ng1Heroes.length - 1], 'Kamala Khan');
  });

  it('should remove a hero when clicking its "remove" button', async () => {
    let showHideBtn = await driver.findElement(webdriver.By.css('button'));
    await showHideBtn.click();
    await waitForAngular(driver);

    let ng1Heroes = await driver.findElements(webdriver.By.css('.ng1-hero'));
    await expectToHaveName(ng1Heroes[0], 'Superman');

    const removeBtn = await ng1Heroes[0].findElement(
      webdriver.By.xpath(".//button[text()='Remove']"),
    );
    await removeBtn.click();
    await waitForAngular(driver);

    await expectHeroes(true, 2, 'Removed hero Superman');
    ng1Heroes = await driver.findElements(webdriver.By.css('.ng1-hero'));
    const firstHeroName = await ng1Heroes[0].findElement(webdriver.By.css('h2')).getText();
    expect(firstHeroName).not.toBe('Superman');
  });
});
