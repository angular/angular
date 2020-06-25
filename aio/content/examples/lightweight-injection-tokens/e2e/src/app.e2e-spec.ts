'use strict';

import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Lightweight Injection Tokens', function () {


  beforeEach(() => {
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
    console.log(message);
    expect(message.length).toBeGreaterThan(0);
  }

  it('should have title Lightweight Injection Tokens', function () {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Lightweight Injection Tokens');
  });


  it('should log item', async () => {
    let buyButton = element.all(by.css('button')).get(2);
    const contents = 'Child';
    await buyButton.click();
    await logChecker(buyButton, contents);
  });




});

