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
