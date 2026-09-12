/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createWebDriver, verifyNoBrowserErrors, waitForAngular} from '../../../../test-utils';

describe('pipe', () => {
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
    await driver.get(`${baseUrl}/pipes`);
    await waitForAngular(driver);
  }

  describe('async', () => {
    it('should resolve and display promise', async () => {
      await loadPage();
      const spans = await driver.findElements(webdriver.By.css('async-promise-pipe span'));
      expect(await spans[0].getText()).toEqual('Wait for it...');
      const button = await driver.findElement(webdriver.By.css('async-promise-pipe button'));
      await button.click();
      await waitForAngular(driver);
      const updatedSpans = await driver.findElements(webdriver.By.css('async-promise-pipe span'));
      expect(await updatedSpans[0].getText()).toEqual('Wait for it... hi there!');
    });
  });

  describe('lowercase/uppercase', () => {
    it('should work properly', async () => {
      await loadPage();
      const input = await driver.findElement(webdriver.By.css('lowerupper-pipe input'));
      await input.sendKeys('Hello World!');
      await waitForAngular(driver);
      const pres = await driver.findElements(webdriver.By.css('lowerupper-pipe pre'));
      expect(await pres[0].getText()).toEqual("'hello world!'");
      expect(await pres[1].getText()).toEqual("'HELLO WORLD!'");
    });
  });

  describe('titlecase', () => {
    it('should work properly', async () => {
      await loadPage();
      const ps = await driver.findElements(webdriver.By.css('titlecase-pipe p'));
      expect(await ps[0].getText()).toEqual('Some String');
      expect(await ps[1].getText()).toEqual('This Is Mixed Case');
      expect(await ps[2].getText()).toEqual("It's Non-trivial Question");
      expect(await ps[3].getText()).toEqual('One,two,three');
      expect(await ps[4].getText()).toEqual('True|false');
      expect(await ps[5].getText()).toEqual('Foo-vs-bar');
    });
  });

  describe('keyvalue', () => {
    it('should work properly', async () => {
      await loadPage();
      const divs = await driver.findElements(webdriver.By.css('keyvalue-pipe div'));
      expect(await divs[0].getText()).toEqual('1:bar');
      expect(await divs[1].getText()).toEqual('2:foo');
      expect(await divs[2].getText()).toEqual('1:bar');
      expect(await divs[3].getText()).toEqual('2:foo');
    });
  });

  describe('number', () => {
    it('should work properly', async () => {
      await loadPage();
      const examples = await driver.findElements(webdriver.By.css('number-pipe p'));
      expect(await examples[0].getText()).toEqual('No specified formatting: 3.142');
      expect(await examples[1].getText()).toEqual(
        'With digitsInfo parameter specified: 0,003.14159',
      );
      expect(await examples[2].getText()).toEqual(
        'With digitsInfo and locale parameters specified: 0\u202f003,14159',
      );
    });
  });

  describe('percent', () => {
    it('should work properly', async () => {
      await loadPage();
      const examples = await driver.findElements(webdriver.By.css('percent-pipe p'));
      expect(await examples[0].getText()).toEqual('A: 26%');
      expect(await examples[1].getText()).toEqual('B: 0,134.950%');
      expect(await examples[2].getText()).toEqual('B: 0\u202f134,950 %');
    });
  });

  describe('currency', () => {
    it('should work properly', async () => {
      await loadPage();
      const examples = await driver.findElements(webdriver.By.css('currency-pipe p'));
      expect(await examples[0].getText()).toEqual('A: $0.26');
      expect(await examples[1].getText()).toEqual('A: CA$0.26');
      expect(await examples[2].getText()).toEqual('A: CAD0.26');
      expect(await examples[3].getText()).toEqual('B: CA$0,001.35');
      expect(await examples[4].getText()).toEqual('B: $0,001.35');
      expect(await examples[5].getText()).toEqual('B: 0\u202f001,35 $CA');
      expect(await examples[6].getText()).toEqual('B: CLP1');
    });
  });
});
