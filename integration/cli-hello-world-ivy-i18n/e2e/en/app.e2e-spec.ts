import * as webdriver from 'selenium-webdriver';
import {AppPage} from '../app.po';
import {createWebDriver, verifyNoBrowserErrors} from '../driver-util';

describe('cli-hello-world-ivy App (en)', () => {
  let driver: webdriver.WebDriver;
  let page: AppPage;
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4203';

  beforeAll(() => {
    driver = createWebDriver();
    page = new AppPage(driver, baseUrl);
  });

  afterAll(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    await page.navigateTo();
  });

  it('should display title', async () => {
    expect(await page.getHeading()).toEqual('Hello cli-hello-world-ivy-i18n!');
  });

  it('should display the locale', async () => {
    expect(await page.getParagraph('locale')).toEqual('en-US');
  });

  it('the date pipe should show the localized month', async () => {
    await page.navigateTo();
    expect(await page.getParagraph('date')).toEqual('January');
  });

  afterEach(async () => {
    await verifyNoBrowserErrors(driver);
  });
});
