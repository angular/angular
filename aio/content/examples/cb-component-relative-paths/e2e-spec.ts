'use strict'; // necessary for es6 output in node 

import { browser, element, by, ElementFinder } from 'protractor';

describe('Cookbook: component-relative paths', function () {

  interface Page {
    title: ElementFinder;
    absComp: ElementFinder;
    relComp: ElementFinder;

  }
  function getPageStruct() {
    return {
      title: element( by.tagName( 'h1' )),
      absComp: element( by.css( 'absolute-path div' ) ),
      relComp: element( by.css( 'relative-path div' ) )
    };
  }

  let page: Page;
  beforeAll(function () {
      browser.get('');
      page = getPageStruct();
  });

  it('should display title of the sample', function () {
    expect(element(by.tagName('h1')).getText()).toContain('Paths');
  });

  it('should have absolute-path element', function () {
    expect(page.absComp.isPresent()).toBe(true, 'no <absolute-path> element');
  });

  it('should display the absolute path text', function () {
    expect(page.absComp.getText()).toContain('Absolute');
  });

  it('should display the component-relative path text', function () {
    expect(page.relComp.getText()).toContain('Component-relative');
  });
});
