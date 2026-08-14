import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-open-close-page'));
}

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-open-close'));
}

export async function getToggleButton(driver: webdriver.WebDriver) {
  const comp = await getComponent(driver);
  return comp.findElement(webdriver.By.xpath('.//button[normalize-space()="Toggle Open/Close"]'));
}

export async function getLoggingCheckbox(driver: webdriver.WebDriver) {
  return locate(
    driver,
    webdriver.By.css('app-open-close-page'),
    webdriver.By.css('section > input[type="checkbox"]'),
  );
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  return locate(driver, webdriver.By.css('app-open-close'), webdriver.By.css('div'));
}
