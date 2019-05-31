'use strict'; // necessary for es6 output in node

import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

/* tslint:disable:quotemark */
describe('Elements', () => {
  const messageInput = element(by.css('input'));
  const popupButtons = element.all(by.css('button'));

  // Helpers
  const click = (elem: ElementFinder) => {
    // Waiting for the element to be clickable, makes the tests less flaky.
    browser.wait(EC.elementToBeClickable(elem), 5000);
    elem.click();
  };
  const waitForText = (elem: ElementFinder) => {
    // Waiting for the element to have some text, makes the tests less flaky.
    browser.wait(async () => /\S/.test(await elem.getText()), 5000);
  }

  beforeEach(() => browser.get(''));

  describe('popup component', () => {
    const popupComponentButton = popupButtons.get(0);
    const popupComponent = element(by.css('popup-component'));
    const closeButton = popupComponent.element(by.css('button'));

    it('should be displayed on button click', () => {
      expect(popupComponent.isPresent()).toBe(false);

      click(popupComponentButton);
      expect(popupComponent.isPresent()).toBe(true);
    });

    it('should display the specified message', () => {
      messageInput.clear();
      messageInput.sendKeys('Angular rocks!');

      click(popupComponentButton);
      waitForText(popupComponent);

      expect(popupComponent.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', () => {
      popupComponentButton.click();
      expect(popupComponent.isPresent()).toBe(true);

      click(closeButton);
      expect(popupComponent.isPresent()).toBe(false);
    });
  });

  describe('popup element', () => {
    const popupElementButton = popupButtons.get(1);
    const popupElement = element(by.css('popup-element'));
    const closeButton = popupElement.element(by.css('button'));

    it('should be displayed on button click', () => {
      expect(popupElement.isPresent()).toBe(false);

      click(popupElementButton);
      expect(popupElement.isPresent()).toBe(true);
    });

    it('should display the specified message', () => {
      messageInput.clear();
      messageInput.sendKeys('Angular rocks!');

      click(popupElementButton);
      waitForText(popupElement);

      expect(popupElement.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', () => {
      popupElementButton.click();
      expect(popupElement.isPresent()).toBe(true);

      click(closeButton);
      expect(popupElement.isPresent()).toBe(false);
    });
  });
});
