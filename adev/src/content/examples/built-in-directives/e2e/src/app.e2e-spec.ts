import * as webdriver from 'selenium-webdriver';

describe('Built-in Directives', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

  it('should have title Built-in Directives', async () => {
    const title = (await driver.findElements(webdriver.By.css('h1')))[0];
    expect(await title.getText()).toEqual('Built-in Directives');
  });

  it('should change first Teapot header', async () => {
    const firstLabel = (await driver.findElements(webdriver.By.css('p')))[0];
    const firstInput = (await driver.findElements(webdriver.By.css('input')))[0];

    expect(await firstLabel.getText()).toEqual('Current item name: Teapot');
    await firstInput.sendKeys('abc');
    expect(await firstLabel.getText()).toEqual('Current item name: Teapotabc');
  });

  it('should modify sentence when modified checkbox checked', async () => {
    const modifiedChkbxLabel = (
      await driver.findElements(webdriver.By.css('input[type="checkbox"]'))
    )[1];
    const modifiedSentence = (await driver.findElements(webdriver.By.css('div')))[1];

    await modifiedChkbxLabel.click();
    expect(await modifiedSentence.getText()).toContain('modified');
  });

  it('should modify sentence when normal checkbox checked', async () => {
    const normalChkbxLabel = (
      await driver.findElements(webdriver.By.css('input[type="checkbox"]'))
    )[4];
    const normalSentence = (await driver.findElements(webdriver.By.css('div')))[7];

    await normalChkbxLabel.click();
    expect(await normalSentence.getText()).toContain('normal weight and, extra large');
  });

  it('should toggle app-item-detail', async () => {
    const toggleButton = (await driver.findElements(webdriver.By.css('button')))[3];
    const toggledDiv = (await driver.findElements(webdriver.By.css('app-item-detail')))[0];

    await toggleButton.click();
    expect(await toggledDiv.isDisplayed()).toBe(true);
  });

  it('should hide app-item-detail', async () => {
    const hiddenMessage = (await driver.findElements(webdriver.By.css('p')))[10];
    const hiddenDiv = (await driver.findElements(webdriver.By.css('app-item-detail')))[2];

    expect(await hiddenMessage.getText()).toContain('in the DOM');
    expect(await hiddenDiv.isDisplayed()).toBe(true);
  });

  it('should have 10 lists each containing the string Teapot', async () => {
    const boxes = await driver.findElements(webdriver.By.css('.box'));
    const teapotBoxes: webdriver.WebElement[] = [];
    for (const b of boxes) {
      if ((await b.getText()).includes('Teapot')) {
        teapotBoxes.push(b);
      }
    }
    expect(teapotBoxes.length).toBe(10);
  });

  it('should switch case', async () => {
    const tvRadioButton = (await driver.findElements(webdriver.By.css('input[type="radio"]')))[3];
    const tvDiv = driver.findElement(webdriver.By.css('app-lost-item'));

    const fishbowlRadioButton = (
      await driver.findElements(webdriver.By.css('input[type="radio"]'))
    )[4];
    const fishbowlDiv = driver.findElement(webdriver.By.css('app-unknown-item'));

    await tvRadioButton.click();
    expect(await tvDiv.getText()).toContain('Television');
    await fishbowlRadioButton.click();
    expect(await fishbowlDiv.getText()).toContain('mysterious');
  });
});
