import {Builder} from 'selenium-webdriver';
import {
  ServiceBuilder,
  Options as ChromeOptions,
  setDefaultService,
} from 'selenium-webdriver/chrome.js';

export function configureDriver() {
  const options = new ChromeOptions();
  const service = new ServiceBuilder(process.env['CHROMEDRIVER_BIN']!);

  options.headless();
  options.addArguments('--no-sandbox');
  options.setChromeBinaryPath(process.env['CHROME_BIN']!);

  setDefaultService(service.build());

  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}
