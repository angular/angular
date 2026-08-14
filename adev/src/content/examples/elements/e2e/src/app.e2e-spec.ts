import * as webdriver from 'selenium-webdriver';

describe('Elements', () => {
  let driver: webdriver.WebDriver;

  const click = async (elem: webdriver.WebElement) => {
    await driver.wait(webdriver.until.elementIsVisible(elem), 5000);
    await elem.click();
  };

  const waitForText = async (elem: webdriver.WebElement) => {
    await driver.wait(async () => /\S/.test(await elem.getText()), 5000);
  };

  const isPresent = async (locator: webdriver.Locator) => {
    const els = await driver.findElements(locator);
    return els.length > 0;
  };

  beforeEach(async () => {
    await driver.get('');
  });

  describe('popup component', () => {
    it('should be displayed on button click', async () => {
      const popupComponentLocator = webdriver.By.css('popup-component');
      expect(await isPresent(popupComponentLocator)).toBe(false);

      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[0]);
      expect(await isPresent(popupComponentLocator)).toBe(true);
    });

    it('should display the specified message', async () => {
      const messageInput = await driver.findElement(webdriver.By.css('input'));
      await messageInput.clear();
      await messageInput.sendKeys('Angular rocks!');

      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[0]);

      const popupComponent = await driver.findElement(webdriver.By.css('popup-component'));
      await waitForText(popupComponent);

      expect(await popupComponent.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', async () => {
      const popupComponentLocator = webdriver.By.css('popup-component');
      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[0]);
      expect(await isPresent(popupComponentLocator)).toBe(true);

      const popupComponent = await driver.findElement(popupComponentLocator);
      const closeButton = await popupComponent.findElement(webdriver.By.css('button'));
      await click(closeButton);
      expect(await isPresent(popupComponentLocator)).toBe(false);
    });
  });

  describe('popup element', () => {
    it('should be displayed on button click', async () => {
      const popupElementLocator = webdriver.By.css('popup-element');
      expect(await isPresent(popupElementLocator)).toBe(false);

      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[1]);
      expect(await isPresent(popupElementLocator)).toBe(true);
    });

    it('should display the specified message', async () => {
      const messageInput = await driver.findElement(webdriver.By.css('input'));
      await messageInput.clear();
      await messageInput.sendKeys('Angular rocks!');

      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[1]);

      const popupElement = await driver.findElement(webdriver.By.css('popup-element'));
      await waitForText(popupElement);

      expect(await popupElement.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', async () => {
      const popupElementLocator = webdriver.By.css('popup-element');
      const popupButtons = await driver.findElements(webdriver.By.css('button'));
      await click(popupButtons[1]);
      expect(await isPresent(popupElementLocator)).toBe(true);

      const popupElement = await driver.findElement(popupElementLocator);
      const closeButton = await popupElement.findElement(webdriver.By.css('button'));
      await click(closeButton);
      expect(await isPresent(popupElementLocator)).toBe(false);
    });
  });
});
