import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-querying'));
}

export async function getToggleButton(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-querying'), webdriver.By.className('toggle'));
}

export async function getComponentSection(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-querying'), webdriver.By.css('section'));
}
