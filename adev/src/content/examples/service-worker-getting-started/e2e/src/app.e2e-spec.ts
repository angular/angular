import * as webdriver from 'selenium-webdriver';

describe('sw-example App', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  it('should display welcome message', async () => {
    expect(await (await driver.findElement(webdriver.By.css('h1, app-root h1'))).getText()).toEqual(
      'Welcome to Service Workers!',
    );
  });

  it('should display the Angular logo', async () => {
    const imgs = await driver.findElements(webdriver.By.css('img'));
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('should show a header for the list of links', async () => {
    const listHeader = await driver.findElement(webdriver.By.css('app-root > h2'));
    expect(await listHeader.getText()).toEqual('Here are some links to help you start:');
  });

  it('should show a list of links', async () => {
    const items = await driver.findElements(webdriver.By.css('ul > li > h2 > a'));

    expect(items.length).toBe(4);
    expect(await items[0].getText()).toBe('Angular Service Worker Intro');
    expect(await items[1].getText()).toBe('Tour of Heroes');
    expect(await items[2].getText()).toBe('CLI Documentation');
    expect(await items[3].getText()).toBe('Angular blog');
  });

  // Check for a rejected promise as the service worker is not enabled
  it('SwUpdate.checkForUpdate() should return a rejected promise', async () => {
    const button = await driver.findElement(webdriver.By.css('button'));
    const rejectMessage = await driver.findElement(webdriver.By.css('p'));
    await button.click();
    expect(await rejectMessage.getText()).toContain('rejected: ');
  });
});
