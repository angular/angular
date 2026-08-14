import * as webdriver from 'selenium-webdriver';
import {locate} from './util';

export function getPage(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-toggle-animations-child-page'));
}

export function getComponent(driver: webdriver.WebDriver) {
  return driver.findElement(webdriver.By.css('app-open-close-toggle'));
}

export async function getToggleButton(driver: webdriver.WebDriver) {
  const comp = await getComponent(driver);
  return comp.findElement(webdriver.By.xpath('.//button[normalize-space()="Toggle Open/Closed"]'));
}

export async function getToggleAnimationsButton(driver: webdriver.WebDriver) {
  const comp = await getComponent(driver);
  return comp.findElement(webdriver.By.xpath('.//button[normalize-space()="Toggle Animations"]'));
}

export async function getComponentContainer(driver: webdriver.WebDriver) {
  const comp = await getComponent(driver);
  const divs = await comp.findElements(webdriver.By.css('div'));
  return divs[0];
}
