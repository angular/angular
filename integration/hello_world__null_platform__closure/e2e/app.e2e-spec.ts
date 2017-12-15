import { browser, element, by } from 'protractor';

describe('Hello world E2E Tests', function () {
  it('should display: Hello world!', function () {
    browser.get('');
    const div = element(by.css('div'));
    expect(div.getText()).toEqual('Hello world!');
    element(by.css('input')).sendKeys('!');
    expect(div.getText()).toEqual('Hello world!!');
  });
});
