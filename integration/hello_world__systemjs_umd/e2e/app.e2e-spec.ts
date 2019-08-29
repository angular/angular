import { browser, element, by } from 'protractor';

describe('Hello world E2E Tests', function () {
  it('should display: Hello world!', function () {
    browser.get('');
    expect(element(by.css('div')).getText()).toEqual('Hello world!');
  });
});