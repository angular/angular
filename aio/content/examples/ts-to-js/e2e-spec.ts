'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('TypeScript to Javascript tests', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should display the basic component example', function () {
    testTag('hero-view', 'Hero Detail: Windstorm');
  });

  it('should display the component example with lifecycle methods', function () {
    testTag('hero-lifecycle', 'Hero: Windstorm');
  });

  it('should display component with DI example', function () {
    testTag('hero-di', 'Hero: Windstorm');
  });

  it('should display component with DI using @Inject example', function () {
    testTag('hero-di-inject', 'Hero: Windstorm');
  });

  it('should support optional, attribute, and query injections', function () {
    let app = element(by.css('hero-di-inject-additional'));
    let h1 = app.element(by.css('h1'));
    let okMsg = app.element(by.css('p'));

    expect(h1.getText()).toBe('Tour of Heroes');
    app.element(by.buttonText('OK')).click();
    expect(okMsg.getText()).toBe('OK!');
  });

  it('should support component with inputs and outputs', function () {
    let app = element(by.css('hero-io'));
    let confirmComponent = app.element(by.css('app-confirm'));

    confirmComponent.element(by.buttonText('OK')).click();
    expect(app.element(by.cssContainingText('span', 'OK clicked')).isPresent()).toBe(true);

    confirmComponent.element(by.buttonText('Cancel')).click();
    expect(app.element(by.cssContainingText('span', 'Cancel clicked')).isPresent()).toBe(true);
  });

  it('should support host bindings and host listeners', function() {
    let app = element(by.css('hero-host'));
    let h1 = app.element(by.css('h1'));

    expect(app.getAttribute('class')).toBe('heading');
    expect(app.getAttribute('title')).toContain('Tooltip');

    h1.click();
    expect(h1.getAttribute('class')).toBe('active');

    h1.click();
    browser.actions().doubleClick(h1.getWebElement()).perform();
    expect(h1.getAttribute('class')).toBe('active');
  });

  it('should support content and view queries', function() {
    let app = element(by.css('hero-queries'));
    let windstorm = app.element(by.css('view-child:first-child'));

    app.element(by.css('button')).click();
    expect(windstorm.element(by.css('h2')).getAttribute('class')).toBe('active');
    expect(windstorm.element(by.css('content-child')).getText()).toBe('Active');
  });

  function testTag(selector: string, expectedText: string) {
    let component = element(by.css(selector));
    expect(component.getText()).toBe(expectedText);
  }

});
