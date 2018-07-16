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

  it('should close popup component on close button click', () => {
    const popupComponent = element(by.css('popup-component'));
    const popupComponentCloseButton = popupComponent.element(by.css('button'));

    expect(popupComponent.isPresent()).toBe(true);

    popupComponentCloseButton.click();
    expect(popupComponent.isPresent()).toBe(false);
  });

  it('should be able to change the message', () => {
    const popupMessageInput = element(by.css('app-root input'));
    popupMessageInput.clear().then(() => popupMessageInput.sendKeys('Angular rocks!'));

    const popupComponent = element(by.css('popup-component'));
    const popupComponentButton = element.all(by.css('button')).get(0);

    expect(popupComponent.isPresent()).toBe(false);

    popupComponentButton.click();
    expect(popupComponent.isPresent()).toBe(true);
    expect(popupComponent.getText()).toContain('Popup: Angular rocks!');
  });

  /* Provide solution (separate build or polyfill) since Custom Elements can only be used with ES2015 classes according to the spec. */
  xit('should display popup element on button click', () => {
    const popupElement = element(by.css('popup-element'));
    const popupElementButton = element.all(by.css('button')).get(1);

    expect(popupElement.isPresent()).toBe(false);

    popupElementButton.click();
    expect(popupElement.isPresent()).toBe(true);
    expect(popupElement.getText()).toContain('Popup: Message');
  });

  xit('should close popup element on close button click', () => {
    const popupElement = element(by.css('popup-element'));
    const popupElementCloseButton = popupElement.element(by.css('button'));

    expect(popupElement.isPresent()).toBe(true);

    popupElementCloseButton.click();
    expect(popupElement.isPresent()).toBe(false);
  });

  xit('should be able to change the message', () => {
    const popupMessageInput = element(by.css('app-root input'));
    popupMessageInput.clear().then(() => popupMessageInput.sendKeys('Angular rocks!'));

    const popupElement = element(by.css('popup-element'));
    const popupComponentButton = element.all(by.css('button')).get(0);

    expect(popupElement.isPresent()).toBe(false);

    popupComponentButton.click();
    expect(popupElement.isPresent()).toBe(true);
    expect(popupElement.getText()).toContain('Popup: Angular rocks!');
  });

});
