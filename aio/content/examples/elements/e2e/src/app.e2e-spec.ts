import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

describe('Elements', () => {
  const messageInput = element(by.css('input'));
  const popupButtons = element.all(by.css('button'));

  // Helpers
  const click = async (elem: ElementFinder) => {
    // Waiting for the element to be clickable, makes the tests less flaky.
    await browser.wait(EC.elementToBeClickable(elem), 5000);
    await elem.click();
  };
  const waitForText = async (elem: ElementFinder) => {
    // Waiting for the element to have some text, makes the tests less flaky.
    await browser.wait(async () => /\S/.test(await elem.getText()), 5000);
  };

  beforeEach(() => browser.get(''));

  describe('popup component', () => {
    const popupComponentButton = popupButtons.get(0);
    const popupComponent = element(by.css('popup-component'));
    const closeButton = popupComponent.element(by.css('button'));

    it('should be displayed on button click', async () => {
      expect(await popupComponent.isPresent()).toBe(false);

      await click(popupComponentButton);
      expect(await popupComponent.isPresent()).toBe(true);
    });

    it('should display the specified message', async () => {
      await messageInput.clear();
      await messageInput.sendKeys('Angular rocks!');

      await click(popupComponentButton);
      await waitForText(popupComponent);

      expect(await popupComponent.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', async () => {
      await click(popupComponentButton);
      expect(await popupComponent.isPresent()).toBe(true);

      await click(closeButton);
      expect(await popupComponent.isPresent()).toBe(false);
    });
  });

  describe('popup element', () => {
    const popupElementButton = popupButtons.get(1);
    const popupElement = element(by.css('popup-element'));
    const closeButton = popupElement.element(by.css('button'));

    it('should be displayed on button click', async () => {
      expect(await popupElement.isPresent()).toBe(false);

      await click(popupElementButton);
      expect(await popupElement.isPresent()).toBe(true);
    });

    it('should display the specified message', async () => {
      await messageInput.clear();
      await messageInput.sendKeys('Angular rocks!');

      await click(popupElementButton);
      await waitForText(popupElement);

      expect(await popupElement.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', async () => {
      await click(popupElementButton);
      expect(await popupElement.isPresent()).toBe(true);

      await click(closeButton);
      expect(await popupElement.isPresent()).toBe(false);
    });
  });
});
