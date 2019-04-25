'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Attribute directives', () => {

  let _title = 'My First Attribute Directive';

  beforeAll(() => {
    browser.get('');
  });

  it(`should display correct title: ${_title}`, () => {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });

  it('should be able to select green highlight', () => {
    const highlightedEle = element(by.cssContainingText('p', 'Highlight me!'));
    const lightGreen = 'rgba(144, 238, 144, 1)';

    expect(highlightedEle.getCssValue('background-color')).not.toEqual(lightGreen);

    const greenRb = element.all(by.css('input')).get(0);
    greenRb.click();
    browser.actions().mouseMove(highlightedEle).perform();

    expect(highlightedEle.getCssValue('background-color')).toEqual(lightGreen);
  });
});
