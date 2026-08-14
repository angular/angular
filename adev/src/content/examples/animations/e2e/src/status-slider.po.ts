import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-status-slider-page'));
}

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-status-slider'));
}

export async function getToggleButton(driver: webdriver.WebDriver) {
  const comp = await getComponent(driver);
  return comp.findElement(webdriver.By.xpath('.//button[normalize-space()="Toggle Status"]'));
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-status-slider'), webdriver.By.css('div'));
}
