import * as webdriver from 'selenium-webdriver';
import {AppPage} from '../app.po';
import {createWebDriver, verifyNoBrowserErrors} from '../driver-util';

describe('cli-hello-world-ivy App (fr)', () => {
  let driver: webdriver.WebDriver;
  let page: AppPage;
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4204';

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
    expect(await page.getHeading()).toEqual('Bonjour cli-hello-world-ivy-i18n!');
  });

  it('should display the locale', async () => {
    expect(await page.getParagraph('locale')).toEqual('fr');
  });

  it('the date pipe should show the localized month', async () => {
    await page.navigateTo();
    expect(await page.getParagraph('date')).toEqual('janvier');
  });

  afterEach(async () => {
    await verifyNoBrowserErrors(driver);
  });
});
