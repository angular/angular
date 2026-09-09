import * as webdriver from 'selenium-webdriver';
import {AppPage} from './app.po';
import {createWebDriver, verifyNoBrowserErrors} from './driver-util';

describe('cli-signal-inputs App', () => {
  let driver: webdriver.WebDriver;
  let page: AppPage;
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4210';

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

  it('should show greet message', async () => {
    expect(await page.getGreetText()).toEqual('John - transformed-fallback');
    expect(await page.getUnboundLastNameGreetText()).toEqual('John - initial-unset');
  });

  it('should update greet message when last name is set', async () => {
    expect(await page.getGreetText()).toEqual('John - transformed-fallback');
    await page.setLastName();
    expect(await page.getGreetText()).toEqual('John - ng-Doe');
    await page.unsetLastName();
    expect(await page.getGreetText()).toEqual('John - transformed-fallback');
  });

  it('should properly query via `viewChildren`', async () => {
    expect(await page.getGreetCount()).toEqual('Greet component count: 2');
  });

  afterEach(async () => {
    await verifyNoBrowserErrors(driver);
  });
});
