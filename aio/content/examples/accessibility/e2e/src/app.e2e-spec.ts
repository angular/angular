'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Accessibility example e2e tests', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display Accessibility Example', function () {
    expect(element(by.css('h1')).getText()).toEqual('Accessibility Example');
  });

  it('should take a number and change progressbar width', function () {
    element(by.css('input')).sendKeys('16');
    expect(element(by.css('input')).getAttribute('value')).toEqual('016');
    expect(element(by.css('app-example-progressbar div')).getCssValue('width')).toBe('48px');
  });

});
