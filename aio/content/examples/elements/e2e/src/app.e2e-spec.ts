'use strict'; // necessary for es6 output in node

import { browser, by, element } from 'protractor';

/* tslint:disable:quotemark */
describe('Elements', () => {

  beforeAll(() => browser.get(''));

  it('should display popup component on button click', () => {
    const popupComponent = element(by.css('popup-component'));
    const popupComponentButton = element.all(by.css('button')).get(0);

    expect(popupComponent.isPresent()).toBe(false);

    popupComponentButton.click();
    expect(popupComponent.isPresent()).toBe(true);
    expect(popupComponent.getText()).toContain('Popup: Message');
  });

  it('should display popup element on button click', () => {
    const popupElement = element(by.css('popup-element'));
    const popupElementButton = element.all(by.css('button')).get(1);

    expect(popupElement.isPresent()).toBe(false);

    popupElementButton.click();
    expect(popupElement.isPresent()).toBe(true);
    expect(popupElement.getText()).toContain('Popup: Message');
  });

});
