'use strict'; // necessary for es6 output in node

import { browser, by, element } from 'protractor';

/* tslint:disable:quotemark */
describe('Elements', () => {

    beforeAll(() => {
        browser.get('');
    });

    it('should not display popup component', () => {
      expect(element(by.css('body popup-component')).isPresent()).toBeFalsy();
    });

    it('should display popup component after button click', () => {
      const popupComponentButton = element.all(by.tagName('button')).get(0);
      popupComponentButton.click().then(() => {
        expect(element(by.css('body popup-component')).isPresent()).toBe(true);
      })
    });

    xit('should display popup component with content `Popup: Message`', () => {
      expect(element(by.css('body popup-component')).getText()).toContain('Popup: Message');
    });

    it('should not display popup element', () => {
      expect(element(by.css('body popup-element')).isPresent()).toBeFalsy();
    });

    it('should display popup component after button click', () => {
      const popupElementButton = element.all(by.tagName('button')).get(1);
      popupElementButton.click().then(() => {
        expect(element(by.css('body popup-element')).isPresent()).toBeTruthy();
      });
    });

    xit('should display popup element with content `Popup: Message`', () => {
      expect(element(by.css('body popup-element')).getText()).toContain('Popup: Message');
    });

});
