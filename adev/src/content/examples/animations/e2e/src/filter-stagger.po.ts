import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-hero-list-page'));
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-hero-list-page'), webdriver.By.css('ul'));
}

export async function getHeroesList(driver: webdriver.WebDriver) {
  const container = await getComponentContainer(driver);
  return container.findElements(webdriver.By.css('li'));
}

export async function getInput(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-hero-list-page'), webdriver.By.css('input'));
}
