/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';

const isTitleCased = (text: string) =>
  text.split(/\s+/).every((word) => word[0] === word[0].toUpperCase());

export async function expectToBeAHero(actualNg1Hero: webdriver.WebElement): Promise<void> {
  const title = await actualNg1Hero.findElement(webdriver.By.css('.title')).getText();
  const name = await actualNg1Hero.findElement(webdriver.By.css('h2')).getText();
  const description = await actualNg1Hero.findElement(webdriver.By.css('p')).getText();

  expect(title).toBe('Super Hero');
  expect(isTitleCased(name)).toBe(true);
  expect(description.length).toBeGreaterThan(0);
}

export async function expectToHaveName(
  actualNg1Hero: webdriver.WebElement,
  expectedName: string,
): Promise<void> {
  const name = await actualNg1Hero.findElement(webdriver.By.css('h2')).getText();
  expect(name).toBe(expectedName);
}
