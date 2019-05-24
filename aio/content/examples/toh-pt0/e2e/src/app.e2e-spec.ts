'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Tour of Heroes', () => {
  beforeEach(() => {
    return browser.get('/');
  });

  it('should display "Tour of Heroes"', () => {
    let title = element(by.css('app-root h1')).getText();
    expect(title).toEqual('Tour of Heroes');
  });
});
