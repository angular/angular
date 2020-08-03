import { browser, element, by } from 'protractor';

describe('Accessibility example e2e tests', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display Accessibility Example', () => {
    expect(element(by.css('h1')).getText()).toEqual('Accessibility Example');
  });

  it('should take a number and change progressbar width', () => {
    element(by.css('input')).sendKeys('16');
    expect(element(by.css('input')).getAttribute('value')).toEqual('016');
    expect(element(by.css('app-example-progressbar div')).getCssValue('width')).toBe('48px');
  });

});
