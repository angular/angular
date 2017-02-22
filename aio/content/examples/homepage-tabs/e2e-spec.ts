'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Homepage Tabs', function () {

  beforeAll(function () {
    browser.get('');
  });

  // Does it even launch?
  let expectedAppTitle = 'Tabs Demo';
  it(`should display app title: ${expectedAppTitle}`, function () {
    expect(element(by.css('h4')).getText()).toEqual(expectedAppTitle);
  });

});
