import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

let serviceInitialized = false;

export function createWebDriver(): webdriver.WebDriver {
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

  return new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();
}

export async function verifyNoBrowserErrors(driver: webdriver.WebDriver): Promise<void> {
  const logs = await driver.manage().logs().get(webdriver.logging.Type.BROWSER);
  expect(logs).not.toContain(
    jasmine.objectContaining({
      level: webdriver.logging.Level.SEVERE,
    } as webdriver.logging.Entry),
  );
}
