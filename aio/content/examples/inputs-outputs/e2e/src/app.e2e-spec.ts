'use strict';

import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Inputs and Outputs', function () {


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

  it('should have title Inputs and Outputs', function () {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Inputs and Outputs');
  });

  it('should add 123 to the parent list', async () => {
    let addToParentButton = element.all(by.css('button')).get(0);
    let addToListInput = element.all(by.css('input')).get(0);
    let addedItem = element.all(by.css('li')).get(4);
    await addToListInput.sendKeys('123');
    await addToParentButton.click();
    expect(addedItem.getText()).toEqual('123');
  });

  it('should delete item', async () => {
    let deleteButton = element.all(by.css('button')).get(1);
    const contents = 'Child';
    await deleteButton.click();
    await logChecker(deleteButton, contents);
  });

  it('should log buy the item', async () => {
    let buyButton = element.all(by.css('button')).get(2);
    const contents = 'Child';
    await buyButton.click();
    await logChecker(buyButton, contents);
  });

  it('should save item for later', async () => {
    let saveButton = element.all(by.css('button')).get(3);
    const contents = 'Child';
    await saveButton.click();
    await logChecker(saveButton, contents);
  });

  it('should add item to wishlist', async () => {
    let addToParentButton = element.all(by.css('button')).get(4);
    let addedItem = element.all(by.css('li')).get(6);
    await addToParentButton.click();
    expect(addedItem.getText()).toEqual('Television');
  });

});

