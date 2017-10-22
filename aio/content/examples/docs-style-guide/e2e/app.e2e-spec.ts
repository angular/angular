'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Docs Style Guide', function () {
  let _title = 'Authors Style Guide Sample';

  beforeAll(function () {
    browser.get('');
  });

  it('should display correct title: ' + _title, function () {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });
});
