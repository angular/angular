import * as webdriver from 'selenium-webdriver';

describe('Forms Tests', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  it('should display correct title', async () => {
    const h1s = await driver.findElements(webdriver.By.css('h1'));
    expect(await h1s[0].getText()).toEqual('Actor Form');
  });

  it('should not display message before submit', async () => {
    const h2s = await driver.findElements(webdriver.By.css('h2'));
    expect(h2s.length === 0 || !(await h2s[0].isDisplayed())).toBe(true);
  });

  it('should hide form after submit', async () => {
    const ele = (await driver.findElements(webdriver.By.css('h1')))[0];
    expect(await ele.isDisplayed()).toBe(true);

    const b = (await driver.findElements(webdriver.By.css('button[type=submit]')))[0];
    await b.click();
    const h1s = await driver.findElements(webdriver.By.css('h1'));
    expect(h1s.length === 0 || !(await h1s[0].isDisplayed())).toBe(true);
  });

  it('should display message after submit', async () => {
    const b = (await driver.findElements(webdriver.By.css('button[type=submit]')))[0];
    await b.click();
    expect(await (await driver.findElement(webdriver.By.css('h2'))).getText()).toContain(
      'You submitted the following',
    );
  });

  it('should hide form after submit', async () => {
    const studioEle = (await driver.findElements(webdriver.By.css('input[name=studio]')))[0];
    expect(await studioEle.isDisplayed()).toBe(true);

    const submitButtonEle = (await driver.findElements(webdriver.By.css('button[type=submit]')))[0];
    await submitButtonEle.click();
    const studioEles = await driver.findElements(webdriver.By.css('input[name=studio]'));
    expect(studioEles.length === 0 || !(await studioEles[0].isDisplayed())).toBe(true);
  });

  it('should reflect submitted data after submit', async () => {
    const studioEle = (await driver.findElements(webdriver.By.css('input[name=studio]')))[0];
    const value = await studioEle.getAttribute('value');
    const test = 'testing 1 2 3';
    const newValue = value + test;

    await studioEle.sendKeys(test);
    expect(await studioEle.getAttribute('value')).toEqual(newValue);

    const b = (await driver.findElements(webdriver.By.css('button[type=submit]')))[0];
    await b.click();

    const divs = await driver.findElements(webdriver.By.css('div'));
    let foundStudio = false;
    let foundNewValue = false;
    for (const d of divs) {
      const text = await d.getText();
      if (text.includes('Studio')) foundStudio = true;
      if (text.includes(newValue)) foundNewValue = true;
    }
    expect(foundStudio).toBe(true, 'cannot locate "Studio" label');
    expect(foundNewValue).toBe(true, `cannot locate div with this text: ${newValue}`);
  });
});
