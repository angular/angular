import { browser, element, by } from 'protractor';

describe('Attribute binding example', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display Property Binding with Angular', () => {
    expect(element(by.css('h1')).getText()).toEqual('Attribute, class, and style bindings');
  });

  it('should display a table', () => {
    expect(element.all(by.css('table')).isPresent()).toBe(true);
  });

  it('should display an Aria button', () => {
    expect(element.all(by.css('button')).get(0).getText()).toBe('Go for it with Aria');
  });

  it('should display a blue background on div', () => {
    expect(element.all(by.css('div')).get(1).getCssValue('background-color')).toEqual('rgba(25, 118, 210, 1)');
  });

  it('should display a blue div with a red border', () => {
    expect(element.all(by.css('div')).get(1).getCssValue('border')).toEqual('2px solid rgb(212, 30, 46)');
  });

  it('should display a div with many classes', () => {
    expect(element.all(by.css('div')).get(1).getAttribute('class')).toContain('special');
    expect(element.all(by.css('div')).get(1).getAttribute('class')).toContain('clearance');
  });

});
