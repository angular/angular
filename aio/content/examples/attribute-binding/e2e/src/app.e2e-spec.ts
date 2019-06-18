'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Attribute binding example', function () {

  beforeEach(function () {
    browser.get('');
  });

  it('should display Property Binding with Angular', function () {
    expect(element(by.css('h1')).getText()).toEqual('Attribute, class, and style bindings');
  });

  it('should display a table', function() {
    expect(element.all(by.css('table')).isPresent()).toBe(true);
  });

  it('should display an Aria button', function () {
    expect(element.all(by.css('button')).get(0).getText()).toBe('Go for it with Aria');
  });

  it('should display a blue background on div', function () {
    expect(element.all(by.css('div')).get(1).getCssValue('background-color')).toEqual('rgba(25, 118, 210, 1)');
  });

  it('should display a blue div with a red border', function () {
    expect(element.all(by.css('div')).get(4).getCssValue('border')).toEqual('2px solid rgb(212, 30, 46)');
  });

  it('should display a div with replaced classes', function () {
    expect(element.all(by.css('div')).get(5).getAttribute('class')).toEqual('new-class');
  });

  it('should display four buttons', function() {
    let redButton = element.all(by.css('button')).get(1);
    let saveButton = element.all(by.css('button')).get(2);
    let bigButton = element.all(by.css('button')).get(3);
    let smallButton = element.all(by.css('button')).get(4);

    expect(redButton.getCssValue('color')).toEqual('rgba(255, 0, 0, 1)');
    expect(saveButton.getCssValue('background-color')).toEqual('rgba(0, 255, 255, 1)');
    expect(bigButton.getText()).toBe('Big');
    expect(smallButton.getText()).toBe('Small');
  });

});
