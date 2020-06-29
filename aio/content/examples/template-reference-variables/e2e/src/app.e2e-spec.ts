'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Template-reference-variables-example', function() {
  beforeEach(function() {
    browser.get('');

  });

  // helper function used to test what's logged to the console
  async function logChecker(button, contents) {
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    const message = logs.filter(({ message }) =>
      message.indexOf(contents) !== -1 ? true : false
    );
    expect(message.length).toBeGreaterThan(0);
  }

  it('should display Template reference variables', function() {
    expect(element(by.css('h1')).getText()).toEqual(
      'Template reference variables'
    );
  });

  it('should log a Calling 123 ... message', async () => {
    let callButton = element.all(by.css('button')).get(0);
    let phoneInput = element.all(by.css('input')).get(0);
    await phoneInput.sendKeys('123');
    await callButton.click();
    const contents = 'Calling 123 ...';
    await logChecker(callButton, contents);
  });

  it('should log a Faxing 123 ... message', async () => {
    let faxButton = element.all(by.css('button')).get(1);
    let faxInput = element.all(by.css('input')).get(1);
    await faxInput.sendKeys('123');
    await faxButton.click();
    const contents = 'Faxing 123 ...';
    await logChecker(faxButton, contents);
  });

  it('should display a disabled button', function() {
    let disabledButton = element.all(by.css('button')).get(2);
    expect(disabledButton.isEnabled()).toBe(false);
  });

  it('should submit form', async () => {
    let submitButton = element.all(by.css('button')).get(3);
    let nameInput = element.all(by.css('input')).get(2);
    await nameInput.sendKeys('123');
    await submitButton.click();
    expect(element.all(by.css('div > p')).get(2).getText()).toEqual('Submitted. Form value is {"name":"123"}');
  });


});
