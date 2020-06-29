import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Template Expression Operators', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should have title Inputs and Outputs', function () {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Template Expression Operators');
  });

  it('should display json data', function () {
    let jsonDate = element.all(by.css('p')).get(4);
    expect(jsonDate.getText()).toContain('1980');
  });

  it('should display $98', function () {
    let jsonDate = element.all(by.css('p')).get(5);
    expect(jsonDate.getText()).toContain('$98.00');
  });

  it('should display Telephone', function () {
    let jsonDate = element.all(by.css('p')).get(6);
    expect(jsonDate.getText()).toContain('Telephone');
  });


});
