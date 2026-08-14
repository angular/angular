import * as webdriver from 'selenium-webdriver';

describe('Routing with Custom Matching', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

  it('should display Routing with Custom Matching', async () => {
    expect(await (await driver.findElement(webdriver.By.css('h2'))).getText()).toEqual(
      'Routing with Custom Matching',
    );
  });
});
