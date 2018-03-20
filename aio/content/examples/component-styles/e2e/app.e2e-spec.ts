'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Component Style Tests', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('scopes component styles to component view', function() {
    let componentH1 = element(by.css('app-root > h1'));
    let externalH1 = element(by.css('body > h1'));

    // Note: sometimes webdriver returns the fontWeight as "normal",
    // other times as "400", both of which are equal in CSS terms.
    expect(componentH1.getCssValue('fontWeight')).toMatch(/normal|400/);
    expect(externalH1.getCssValue('fontWeight')).not.toMatch(/normal|400/);
  });


  it('allows styling :host element', function() {
    let host = element(by.css('app-hero-details'));

    expect(host.getCssValue('borderWidth')).toEqual('1px');
  });

  it('supports :host() in function form', function() {
    let host = element(by.css('app-hero-details'));

    host.element(by.buttonText('Activate')).click();
    expect(host.getCssValue('borderWidth')).toEqual('3px');
  });

  it('allows conditional :host-context() styling', function() {
    let h2 = element(by.css('app-hero-details h2'));

    expect(h2.getCssValue('backgroundColor')).toEqual('rgba(238, 238, 255, 1)'); // #eeeeff
  });

  it('styles both view and content children with /deep/', function() {
    let viewH3 = element(by.css('app-hero-team h3'));
    let contentH3 = element(by.css('app-hero-controls h3'));

    expect(viewH3.getCssValue('fontStyle')).toEqual('italic');
    expect(contentH3.getCssValue('fontStyle')).toEqual('italic');
  });

  it('includes styles loaded with CSS @import', function() {
    let host = element(by.css('app-hero-details'));

    expect(host.getCssValue('padding')).toEqual('10px');
  });

  it('processes template inline styles', function() {
    let button = element(by.css('app-hero-controls button'));
    let externalButton = element(by.css('body > button'));
    expect(button.getCssValue('backgroundColor')).toEqual('rgba(255, 255, 255, 1)'); // #ffffff
    expect(externalButton.getCssValue('backgroundColor')).not.toEqual('rgba(255, 255, 255, 1)');
  });

  it('processes template <link>s', function() {
    let li = element(by.css('app-hero-team li:first-child'));
    let externalLi = element(by.css('body > ul li'));

    expect(li.getCssValue('listStyleType')).toEqual('square');
    expect(externalLi.getCssValue('listStyleType')).not.toEqual('square');
  });

});
