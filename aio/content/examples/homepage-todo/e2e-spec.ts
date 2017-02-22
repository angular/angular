'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Homepage Todo', function () {

  beforeAll(function () {
    browser.get('');
  });

  // Does it even launch?
  let expectedAppTitle = 'Todo';
  it(`should display app title: ${expectedAppTitle}`, function () {
    expect(element(by.css('h2')).getText()).toEqual(expectedAppTitle);
  });

});
