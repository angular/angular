import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-hero-list-auto-page'));
}

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-hero-list-auto'));
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-hero-list-auto'), webdriver.By.css('ul'));
}

export async function getHeroesList(driver: webdriver.WebDriver) {
  const container = await getComponentContainer(driver);
  return container.findElements(webdriver.By.css('li'));
}
