import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-hero-list-enter-leave-page'));
}

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-hero-list-enter-leave'));
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-hero-list-enter-leave'), webdriver.By.css('ul'));
}

export async function getHeroesList(driver: webdriver.WebDriver) {
  const container = await getComponentContainer(driver);
  return container.findElements(webdriver.By.css('li'));
}
