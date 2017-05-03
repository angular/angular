'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Attribute directives', function () {

  let _title = 'My First Attribute Directive';

  beforeAll(function () {
    browser.get('');
  });

  it(`should display correct title: ${_title}`, function () {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });

  it('should be able to select green highlight', function () {
    let highlightedEle = element(by.cssContainingText('p', 'Highlight me!'));
    let lightGreen = 'rgba(144, 238, 144, 1)';

    expect(highlightedEle.getCssValue('background-color')).not.toEqual(lightGreen);
    // let greenRb = element(by.cssContainingText('input', 'Green'));
    let greenRb = element.all(by.css('input')).get(0);
    greenRb.click().then(function() {
      // TypeScript Todo: find the right type for highlightedEle
      browser.actions().mouseMove(highlightedEle as any).perform();
      expect(highlightedEle.getCssValue('background-color')).toEqual(lightGreen);
    });

  });
});
