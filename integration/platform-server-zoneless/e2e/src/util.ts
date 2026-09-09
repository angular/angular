/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

let driver: webdriver.WebDriver | null = null;
let serviceInitialized = false;

export function getWebDriver(): webdriver.WebDriver {
  if (!driver) {
    const chromeDriverBin = process.env['CHROMEDRIVER_BIN'] || process.env['CHROMEDRIVER'];
    if (!serviceInitialized && chromeDriverBin) {
      const service = new chrome.ServiceBuilder(chromeDriverBin).build();
      chrome.setDefaultService(service);
      serviceInitialized = true;
    }

    const options = new chrome.Options();
    const chromeBin = process.env['CHROME_BIN'] || process.env['CHROME_HEADLESS_BIN'];
    if (chromeBin) {
      options.setChromeBinaryPath(chromeBin);
    }
    options.headless();
    options.addArguments(
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--mute-audio',
    );

    driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();
  }
  return driver;
}

export async function quitWebDriver(): Promise<void> {
  if (driver) {
    await driver.quit();
    driver = null;
  }
}

export async function verifyNoBrowserErrors(): Promise<void> {
  const browserLog = await getWebDriver().manage().logs().get('browser');
  const errors: string[] = [];

  for (const {message, level} of browserLog) {
    console.log('>> ' + message);
    if (level.value >= webdriver.logging.Level.INFO.value) {
      errors.push(message);
    }
  }

  expect(errors).toEqual([]);
}

export async function navigateTo(url: string): Promise<void> {
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4209/';
  await getWebDriver().get(baseUrl + url);
}

export async function bootstrapClientApp(): Promise<void> {
  await getWebDriver().executeScript('doBootstrap()');
}

export async function getElement(selector: string): Promise<webdriver.WebElement> {
  return getWebDriver().findElement(webdriver.By.css(selector));
}

export async function isElementPresent(selector: string): Promise<boolean> {
  const elements = await getWebDriver().findElements(webdriver.By.css(selector));
  return elements.length > 0;
}
