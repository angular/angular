import * as webdriver from 'selenium-webdriver';
import {
  bootstrapClientApp,
  getWebDriver,
  navigateTo,
  quitWebDriver,
  verifyNoBrowserErrors,
} from './util';

describe('App E2E Tests', () => {
  let driver: webdriver.WebDriver;

  beforeAll(() => {
    driver = getWebDriver();
  });

  afterAll(async () => {
    await quitWebDriver();
  });

  beforeEach(async () => {
    await navigateTo('');
  });

  afterEach(async () => {
    // Make sure there were no client side errors.
    await verifyNoBrowserErrors();
  });

  it('should replay click event', async () => {
    const divElement = await driver.findElement(webdriver.By.css('#divElement'));
    expect(await divElement.getText()).toContain('click not triggered');

    // Trigger click
    await divElement.click();

    // Bootstrap client application
    await bootstrapClientApp();

    expect(await divElement.getText()).toContain('click triggered');
  });
});
