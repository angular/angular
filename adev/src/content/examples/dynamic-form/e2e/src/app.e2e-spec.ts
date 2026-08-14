import * as webdriver from 'selenium-webdriver';

describe('Dynamic Form', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

  it('should submit form', async () => {
    const firstNameElement = (
      await driver.findElements(webdriver.By.css('input[id=firstName]'))
    )[0];
    expect(await firstNameElement.getAttribute('value')).toEqual('Bombasto');

    const emailElement = (await driver.findElements(webdriver.By.css('input[id=emailAddress]')))[0];
    const email = 'test@test.com';
    await emailElement.sendKeys(email);
    expect(await emailElement.getAttribute('value')).toEqual(email);

    await (await driver.findElement(webdriver.By.css('select option[value="solid"]'))).click();
    await (await driver.findElements(webdriver.By.css('button')))[0].click();

    const strongs = await driver.findElements(webdriver.By.css('strong'));
    let found = false;
    for (const s of strongs) {
      if ((await s.getText()).includes('Saved the following values')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
