import {browser, element, by, Key, ExpectedConditions} from 'protractor';

describe('Angular v21 World', () => {
  beforeEach(() => browser.get(''));

  async function getCharacterPosition(): Promise<{x: string; y: string}> {
    const character = element(by.css('.character'));
    const left = await character.getCssValue('left');
    const top = await character.getCssValue('top');
    return {x: left, y: top};
  }

  it('should display the initial game state correctly', async () => {
    // Character is visible
    expect(await element(by.css('.character')).isDisplayed()).toBe(true);

    // Info sign is shown with welcome message
    const infoSign = element(by.css('.info-sign'));
    expect(await infoSign.isDisplayed()).toBe(true);
    expect(await infoSign.getAttribute('src')).toContain('welcome-sign.png');

    // D-pad is visible
    expect(await element(by.css('.d-pad')).isDisplayed()).toBe(true);

    // Explore button is not visible
    expect(await element(by.css('.explore-button')).isPresent()).toBe(false);

    // No keys are present
    expect(await element.all(by.css('.key-icon')).count()).toBe(0);
  });

  it('should move the character with the D-pad buttons', async () => {
    const initialPosition = await getCharacterPosition();
    const leftButton = element(by.css('.d-pad-button.left'));

    // Hold the button down for a short period to simulate walking
    await browser.actions().mouseDown(leftButton).perform();
    await browser.sleep(200);
    await browser.actions().mouseUp(leftButton).perform();

    const newPosition = await getCharacterPosition();
    expect(newPosition.x).not.toEqual(initialPosition.x);
  });

  it('should move the character with keyboard arrow keys', async () => {
    const initialPosition = await getCharacterPosition();

    // Send arrow key press
    await browser.actions().sendKeys(Key.ARROW_RIGHT).perform();
    await browser.sleep(200); // Allow time for movement
    await browser.actions().sendKeys(Key.NULL).perform(); // Release key

    const newPosition = await getCharacterPosition();
    expect(newPosition.x).not.toEqual(initialPosition.x);
  });

  it('should show explore button, open dialog, and collect a key when a destination is reached', async () => {
    const body = element(by.css('body'));
    const exploreButton = element(by.css('.explore-button'));
    const dialog = element(by.css('.dialog-overlay'));

    // Move left until we reach the Palm Tree destination
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(Key.ARROW_LEFT);
      await browser.sleep(100);
    }

    // Wait for the explore button to appear and check info sign
    await browser.wait(ExpectedConditions.visibilityOf(exploreButton), 5000);
    expect(await exploreButton.isDisplayed()).toBe(true);
    expect(await element(by.css('.info-sign')).getAttribute('src')).toContain('enter-sign.png');

    // Click explore button to open dialog
    await exploreButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(dialog), 1000);
    expect(await dialog.isDisplayed()).toBe(true);
    expect(await dialog.element(by.css('h2')).getText()).toEqual("What's new in Angular AI");

    // Close the dialog
    await dialog.element(by.css('.close-button')).click();
    await browser.wait(ExpectedConditions.invisibilityOf(dialog), 1000);
    expect(await dialog.isPresent()).toBe(false);

    // Check that one key has been collected
    expect(await element.all(by.css('.key-icon')).count()).toBe(1);
  });

  it('should show entry denied at castle without all keys', async () => {
    const body = element(by.css('body'));
    const exploreButton = element(by.css('.explore-button'));

    // Move to a position near the castle without collecting keys
    for (let i = 0; i < 20; i++) (await body.sendKeys(Key.ARROW_RIGHT), await browser.sleep(100));
    for (let i = 0; i < 20; i++) (await body.sendKeys(Key.ARROW_DOWN), await browser.sleep(100));

    await browser.sleep(1000); // Settle

    // Check that the entry denied sign is shown and the button is not present
    expect(await element(by.css('.info-sign')).getAttribute('src')).toContain(
      'entry-denied-sign.png',
    );
    expect(await exploreButton.isPresent()).toBe(false);
  });

  it('should handle the full game flow and show congrats state', async () => {
    const body = element(by.css('body'));
    const exploreButton = element(by.css('.explore-button'));
    const dialog = element(by.css('.dialog-overlay'));
    const keys = element.all(by.css('.key-icon'));
    const mascot = element(by.css('.mascot-icon'));

    // **Navigate to Palm Tree (d1) and collect the first key**
    for (let i = 0; i < 20; i++) {
      await body.sendKeys(Key.ARROW_LEFT);
      await browser.sleep(100);
    }
    await browser.wait(ExpectedConditions.visibilityOf(exploreButton), 5000);
    await exploreButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(dialog), 1000);
    await dialog.element(by.css('.close-button')).click();
    await browser.wait(ExpectedConditions.invisibilityOf(dialog), 1000);
    expect(await keys.count()).toBe(1);

    // **Navigate to Red Door (d2) and collect the second key**
    for (let i = 0; i < 15; i++) {
      await body.sendKeys(Key.ARROW_UP);
      await browser.sleep(100);
    }
    await browser.wait(ExpectedConditions.visibilityOf(exploreButton), 5000);
    await exploreButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(dialog), 1000);
    await dialog.element(by.css('.close-button')).click();
    await browser.wait(ExpectedConditions.invisibilityOf(dialog), 1000);
    expect(await keys.count()).toBe(2);

    // **Navigate to Volcano (d3) and collect the third key**
    for (let i = 0; i < 25; i++) {
      await body.sendKeys(Key.ARROW_RIGHT);
      await browser.sleep(100);
    }
    await browser.wait(ExpectedConditions.visibilityOf(exploreButton), 5000);
    await exploreButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(dialog), 1000);
    await dialog.element(by.css('.close-button')).click();
    await browser.wait(ExpectedConditions.invisibilityOf(dialog), 1000);
    expect(await keys.count()).toBe(3);

    // **Navigate to Castle (d4) with all keys**
    for (let i = 0; i < 15; i++) {
      await body.sendKeys(Key.ARROW_DOWN);
      await browser.sleep(100);
    }
    await browser.sleep(1000); // Wait for character to settle

    // Check for correct sign and button visibility
    expect(await element(by.css('.info-sign')).getAttribute('src')).toContain('castle-sign.png');
    await browser.wait(ExpectedConditions.visibilityOf(exploreButton), 5000);

    // **Open Castle dialog, close it, and see mascot and final sign**
    await exploreButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(dialog), 1000);
    await dialog.element(by.css('.close-button')).click();
    await browser.wait(ExpectedConditions.invisibilityOf(dialog), 1000);

    // Mascot appears
    await browser.wait(ExpectedConditions.visibilityOf(mascot), 1000);
    expect(await mascot.isDisplayed()).toBe(true);

    // Congrats sign appears
    expect(await element(by.css('.info-sign')).getAttribute('src')).toContain('congrats-sign.png');
  });
});
