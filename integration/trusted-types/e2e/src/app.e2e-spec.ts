import * as webdriver from 'selenium-webdriver';
import {AppPage} from './app.po';
import {createWebDriver, verifyNoBrowserErrors} from './driver-util';

describe('trusted-types App', () => {
  let driver: webdriver.WebDriver;
  let page: AppPage;
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4213';

  beforeAll(() => {
    driver = createWebDriver();
    page = new AppPage(driver, baseUrl);
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('trusted-types app is running!');
  });

  it('should sanitize and inject bound innerHTML', async () => {
    await page.navigateTo();
    expect(await page.getBoundHtmlText()).toEqual('Hello from bound HTML');
    expect(await page.boundHtmlIframeIsPresent()).toBe(false);
  });

  it('should directly inject SafeHtml bound to innerHTML', async () => {
    await page.navigateTo();
    expect(await page.getBoundSafeHtmlText()).toEqual('Hello from bound SafeHtml');
    expect(await page.boundSafeHtmlIframeIsPresent()).toBe(true);
  });

  it('should replace element with outerHTML contents', async () => {
    await page.navigateTo();
    expect(await page.getOuterHTMLText()).toBe('Hello from second outerHTML');
  });

  it('should load iframe', async () => {
    await page.navigateTo();
    await page.switchToIframe();
    expect(await page.getHeaderText()).toEqual('Hello from iframe');
    await page.switchToDefaultContent();
  });

  it('should load embed', async () => {
    await page.navigateTo();
    await page.switchToEmbed();
    expect(await page.getHeaderText()).toEqual('Hello from embed');
    await page.switchToDefaultContent();
  });

  it('should load object', async () => {
    await page.navigateTo();
    await page.switchToObject();
    expect(await page.getHeaderText()).toEqual('Hello from object');
    await page.switchToDefaultContent();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    await verifyNoBrowserErrors(driver);
  });
});
