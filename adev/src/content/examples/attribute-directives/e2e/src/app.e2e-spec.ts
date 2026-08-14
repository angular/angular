import * as webdriver from 'selenium-webdriver';

describe('Attribute directives', () => {
  let driver: webdriver.WebDriver;
  const title = 'My First Attribute Directive';

  beforeAll(async () => {
    await driver.get('');
  });

  it(`should display correct title: ${title}`, async () => {
    expect(await driver.findElement(webdriver.By.css('h1')).getText()).toEqual(title);
  });

  it('should be able to select green highlight', async () => {
    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    let highlightedEle: webdriver.WebElement | null = null;
    for (const p of paragraphs) {
      if ((await p.getText()).includes('Highlight me!')) {
        highlightedEle = p;
        break;
      }
    }
    const lightGreen = 'rgba(144, 238, 144, 1)';
    const getBgColor = () => highlightedEle!.getCssValue('background-color');

    expect(await getBgColor()).not.toEqual(lightGreen);

    const greenRb = (await driver.findElements(webdriver.By.css('input')))[0];
    await greenRb.click();
    await driver.actions().move({origin: highlightedEle!}).perform();

    // Wait for up to 4s for the background color to be updated,
    // to account for slow environments (e.g. CI).
    await driver.wait(async () => (await getBgColor()) === lightGreen, 4000);
  });
});
