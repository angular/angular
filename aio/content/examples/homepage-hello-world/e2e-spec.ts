'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Homepage Hello World', function () {

  beforeAll(function () {
    browser.get('');
  });

  // Does it even launch?
  let expectedLabel = 'Name:';
  it(`should display the label: ${expectedLabel}`, function () {
    expect(element(by.css('label')).getText()).toEqual(expectedLabel);
  });

  it('should display entered name', function () {
    let testName = 'Bobby Joe';
    let nameEle = element.all(by.css('input')).get(0);
    nameEle.getAttribute('value').then(function(value: string) {
      nameEle.sendKeys(testName);
      let newValue = value + testName; // old input box value + new name
      expect(nameEle.getAttribute('value')).toEqual(newValue);
    }).then(function() {
      // Check the interpolated message built from name
      let helloEle = element.all(by.css('h1')).get(0);
      expect(helloEle.getText()).toEqual('Hello ' + testName + '!');
    });
  });
});
