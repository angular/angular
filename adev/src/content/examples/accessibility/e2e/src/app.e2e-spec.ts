import * as webdriver from 'selenium-webdriver';

describe('Accessibility example e2e tests', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  it('should display Accessibility Example', async () => {
    expect(await driver.findElement(webdriver.By.css('h1')).getText()).toEqual(
      'Accessibility Example',
    );
  });

  it('should take a number and change progressbar width', async () => {
    const input = driver.findElement(webdriver.By.css('input'));
    await input.sendKeys('16');
    expect(await input.getAttribute('value')).toEqual('16');
    expect(
      await driver
        .findElement(webdriver.By.css('app-example-progressbar div'))
        .getCssValue('width'),
    ).toBe('48px');
  });
});
