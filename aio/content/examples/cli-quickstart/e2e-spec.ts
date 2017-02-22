'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('cli-quickstart App', () => {
  beforeEach(() => {
    return browser.get('/');
  });

  it('should display message saying app works', () => {
    let pageTitle = element(by.css('app-root h1')).getText();
    expect(pageTitle).toEqual('My First Angular App');
  });
});
