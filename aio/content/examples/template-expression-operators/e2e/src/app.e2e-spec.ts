import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Template Expression Operators', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should have title Inputs and Outputs', () => {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Template Expression Operators');
  });

  it('should display json data', () => {
    let jsonDate = element.all(by.css('p')).get(4);
    expect(jsonDate.getText()).toContain('1980');
  });

  it('should display $98', () => {
    let jsonDate = element.all(by.css('p')).get(5);
    expect(jsonDate.getText()).toContain('$98.00');
  });

  it('should display Telephone', () => {
    let jsonDate = element.all(by.css('p')).get(6);
    expect(jsonDate.getText()).toContain('Telephone');
  });


});
