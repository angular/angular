'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Built Template Functions Example', function () {
  beforeAll(function () {
    browser.get('');
  });

  it('should have title Built-in Template Functions', function () {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Built-in Template Functions');
  });

  it('should display $any( ) in h2', function () {
    let header = element(by.css('h2'));
    expect(header.getText()).toContain('$any( )');
  });

});
