import * as webdriver from 'selenium-webdriver';

describe('forms-overview App', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  it('should display a title', async () => {
    expect(await driver.findElement(webdriver.By.css('h1, h2')).getText()).toEqual(
      'Forms Overview',
    );
  });
});
