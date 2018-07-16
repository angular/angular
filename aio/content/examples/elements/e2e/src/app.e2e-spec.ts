'use strict'; // necessary for es6 output in node

import { browser, by, element } from 'protractor';

/* tslint:disable:quotemark */
describe('Elements', () => {
  const messageInput = element(by.css('input'));
  const popupButtons = element.all(by.css('button'));

  beforeEach(() => browser.get(''));

  describe('popup component', () => {
    const popupComponentButton = popupButtons.get(0);
    const popupComponent = element(by.css('popup-component'));
    const closeButton = popupComponent.element(by.css('button'));

    it('should be displayed on button click', () => {
      expect(popupComponent.isPresent()).toBe(false);

      popupComponentButton.click();
      expect(popupComponent.isPresent()).toBe(true);
    });

    it('should display the specified message', () => {
      messageInput.clear();
      messageInput.sendKeys('Angular rocks!');

      popupComponentButton.click();
      expect(popupComponent.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', () => {
      popupComponentButton.click();
      expect(popupComponent.isPresent()).toBe(true);

      closeButton.click();
      expect(popupComponent.isPresent()).toBe(false);
    });
  });

  describe('popup element', () => {
    const popupElementButton = popupButtons.get(1);
    const popupElement = element(by.css('popup-element'));
    const closeButton = popupElement.element(by.css('button'));

    it('should be displayed on button click', () => {
      expect(popupElement.isPresent()).toBe(false);

      popupElementButton.click();
      expect(popupElement.isPresent()).toBe(true);
    });

    it('should display the specified message', () => {
      messageInput.clear();
      messageInput.sendKeys('Angular rocks!');

      popupElementButton.click();
      expect(popupElement.getText()).toContain('Popup: Angular rocks!');
    });

    it('should be closed on "close" button click', () => {
      popupElementButton.click();
      expect(popupElement.isPresent()).toBe(true);

      closeButton.click();
      expect(popupElement.isPresent()).toBe(false);
    });
  });
});
