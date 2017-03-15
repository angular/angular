'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Documentation StyleGuide E2E Tests', function() {

  let expectedMsg = 'My First Angular App';

  beforeEach(function () {
    browser.get('');
  });

  it('should display: ' + expectedMsg, function() {
    expect(element(by.id('output')).getText()).toEqual(expectedMsg);
  });
});
