import * as webdriver from 'selenium-webdriver';

describe('Angular v21 World', () => {
  let driver: webdriver.WebDriver;

  const isPresent = async (locator: webdriver.Locator) => {
    const els = await driver.findElements(locator);
    return els.length > 0;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(async () => {
    await driver.get('');
  });

  async function getCharacterPosition(): Promise<{x: string; y: string}> {
    const character = await driver.findElement(webdriver.By.css('.character'));
    const left = await character.getCssValue('left');
    const top = await character.getCssValue('top');
    return {x: left, y: top};
  }

  it('should display the initial game state correctly', async () => {
    // Character is visible
    expect(await (await driver.findElement(webdriver.By.css('.character'))).isDisplayed()).toBe(
      true,
    );

    // Info sign is shown with welcome message
    const infoSign = await driver.findElement(webdriver.By.css('.info-sign'));
    expect(await infoSign.isDisplayed()).toBe(true);
    expect(await infoSign.getAttribute('src')).toContain('welcome-sign.png');

    // D-pad is visible
    expect(await (await driver.findElement(webdriver.By.css('.d-pad'))).isDisplayed()).toBe(true);

    // Explore button is not visible
    expect(await isPresent(webdriver.By.css('.explore-button'))).toBe(false);

    // No keys are present
    expect((await driver.findElements(webdriver.By.css('.key-icon'))).length).toBe(0);
  });

  it('should move the character with the D-pad buttons', async () => {
    const initialPosition = await getCharacterPosition();
    const leftButton = await driver.findElement(webdriver.By.css('.d-pad-button.left'));

    // Hold the button down for a short period to simulate walking
    await driver.actions().move({origin: leftButton}).press().perform();
    await sleep(200);
    await driver.actions().release().perform();

    const newPosition = await getCharacterPosition();
    expect(newPosition.x).not.toEqual(initialPosition.x);
  });

  it('should move the character with keyboard arrow keys', async () => {
    const initialPosition = await getCharacterPosition();

    // Send arrow key press
    const body = await driver.findElement(webdriver.By.css('body'));
    await body.sendKeys(webdriver.Key.ARROW_RIGHT);
    await sleep(200);

    const newPosition = await getCharacterPosition();
    expect(newPosition.x).not.toEqual(initialPosition.x);
  });

  it('should show explore button, open dialog, and collect a key when a destination is reached', async () => {
    const body = await driver.findElement(webdriver.By.css('body'));

    // Move left until we reach the Palm Tree destination
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(webdriver.Key.ARROW_LEFT);
      await sleep(100);
    }

    // Wait for the explore button to appear and check info sign
    const exploreButtonLocator = webdriver.By.css('.explore-button');
    await driver.wait(webdriver.until.elementLocated(exploreButtonLocator), 5000);
    const exploreButton = await driver.findElement(exploreButtonLocator);
    expect(await exploreButton.isDisplayed()).toBe(true);
    expect(
      await (await driver.findElement(webdriver.By.css('.info-sign'))).getAttribute('src'),
    ).toContain('enter-sign.png');

    // Click explore button to open dialog
    await exploreButton.click();
    const dialogLocator = webdriver.By.css('.dialog-overlay');
    await driver.wait(webdriver.until.elementLocated(dialogLocator), 1000);
    const dialog = await driver.findElement(dialogLocator);
    expect(await dialog.isDisplayed()).toBe(true);
    expect(await (await dialog.findElement(webdriver.By.css('h2'))).getText()).toEqual(
      "What's new in Angular AI",
    );

    // Close the dialog
    await (await dialog.findElement(webdriver.By.css('.close-button'))).click();
    await driver.wait(async () => !(await isPresent(dialogLocator)), 1000);
    expect(await isPresent(dialogLocator)).toBe(false);

    // Check that one key has been collected
    expect((await driver.findElements(webdriver.By.css('.key-icon'))).length).toBe(1);
  });

  it('should show entry denied at castle without all keys', async () => {
    const body = await driver.findElement(webdriver.By.css('body'));

    // Move to a position near the castle without collecting keys
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(webdriver.Key.ARROW_RIGHT);
      await sleep(100);
    }
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(webdriver.Key.ARROW_DOWN);
      await sleep(100);
    }

    await sleep(1000); // Settle

    // Check that the entry denied sign is shown and the button is not present
    expect(
      await (await driver.findElement(webdriver.By.css('.info-sign'))).getAttribute('src'),
    ).toContain('entry-denied-sign.png');
    expect(await isPresent(webdriver.By.css('.explore-button'))).toBe(false);
  });

  it('should handle the full game flow and show congrats state', async () => {
    const body = await driver.findElement(webdriver.By.css('body'));
    const exploreButtonLocator = webdriver.By.css('.explore-button');
    const dialogLocator = webdriver.By.css('.dialog-overlay');
    const mascotLocator = webdriver.By.css('.mascot-icon');

    // **Navigate to Palm Tree (d1) and collect the first key**
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(webdriver.Key.ARROW_LEFT);
      await sleep(100);
    }
    await driver.wait(webdriver.until.elementLocated(exploreButtonLocator), 5000);
    await (await driver.findElement(exploreButtonLocator)).click();
    await driver.wait(webdriver.until.elementLocated(dialogLocator), 1000);
    let dialog = await driver.findElement(dialogLocator);
    await (await dialog.findElement(webdriver.By.css('.close-button'))).click();
    await driver.wait(async () => !(await isPresent(dialogLocator)), 1000);
    expect((await driver.findElements(webdriver.By.css('.key-icon'))).length).toBe(1);

    // **Navigate to Red Door (d2) and collect the second key**
    for (let i = 0; i < 15; i++) {
      await body.sendKeys(webdriver.Key.ARROW_UP);
      await sleep(100);
    }
    await driver.wait(webdriver.until.elementLocated(exploreButtonLocator), 5000);
    await (await driver.findElement(exploreButtonLocator)).click();
    await driver.wait(webdriver.until.elementLocated(dialogLocator), 1000);
    dialog = await driver.findElement(dialogLocator);
    await (await dialog.findElement(webdriver.By.css('.close-button'))).click();
    await driver.wait(async () => !(await isPresent(dialogLocator)), 1000);
    expect((await driver.findElements(webdriver.By.css('.key-icon'))).length).toBe(2);

    // **Navigate to Volcano (d3) and collect the third key**
    for (let i = 0; i < 25; i++) {
      await body.sendKeys(webdriver.Key.ARROW_RIGHT);
      await sleep(100);
    }
    await driver.wait(webdriver.until.elementLocated(exploreButtonLocator), 5000);
    await (await driver.findElement(exploreButtonLocator)).click();
    await driver.wait(webdriver.until.elementLocated(dialogLocator), 1000);
    dialog = await driver.findElement(dialogLocator);
    await (await dialog.findElement(webdriver.By.css('.close-button'))).click();
    await driver.wait(async () => !(await isPresent(dialogLocator)), 1000);
    expect((await driver.findElements(webdriver.By.css('.key-icon'))).length).toBe(3);

    // **Navigate to Castle (d4) with all keys**
    for (let i = 0; i < 15; i++) {
      await body.sendKeys(webdriver.Key.ARROW_DOWN);
      await sleep(100);
    }
    await sleep(1000); // Wait for character to settle

    // Check for correct sign and button visibility
    expect(
      await (await driver.findElement(webdriver.By.css('.info-sign'))).getAttribute('src'),
    ).toContain('castle-sign.png');
    await driver.wait(webdriver.until.elementLocated(exploreButtonLocator), 5000);

    // **Open Castle dialog, close it, and see mascot and final sign**
    await (await driver.findElement(exploreButtonLocator)).click();
    await driver.wait(webdriver.until.elementLocated(dialogLocator), 1000);
    dialog = await driver.findElement(dialogLocator);
    await (await dialog.findElement(webdriver.By.css('.close-button'))).click();
    await driver.wait(async () => !(await isPresent(dialogLocator)), 1000);

    // Mascot appears
    await driver.wait(webdriver.until.elementLocated(mascotLocator), 1000);
    const mascot = await driver.findElement(mascotLocator);
    expect(await mascot.isDisplayed()).toBe(true);

    // Congrats sign appears
    expect(
      await (await driver.findElement(webdriver.By.css('.info-sign'))).getAttribute('src'),
    ).toContain('congrats-sign.png');
  });
});
