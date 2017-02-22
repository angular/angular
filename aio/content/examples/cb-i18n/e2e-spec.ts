'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('i18n E2E Tests', () => {

  beforeEach(function () {
    browser.get('');
  });

  it('should display i18n translated welcome: ¡Hola i18n!', function () {
    expect(element(by.css('h1')).getText()).toEqual('¡Hola i18n!');
  });

  it('should display the node texts without elements', function () {
    expect(element(by.css('my-app')).getText()).toContain('No genero ningún elemento');
    expect(element(by.css('my-app')).getText()).toContain('Yo tampoco genero ningún elemento');
  });

  it('should display the translated title attribute', function () {
    const title = element(by.css('img')).getAttribute('title');
    expect(title).toBe('Logo de Angular');
  });

  it('should display the plural of: a horde of wolves', function () {
    expect(element.all(by.css('span')).get(0).getText()).toBe('ningún lobo');
  });

  it('should display the select of gender', function () {
    expect(element.all(by.css('span')).get(1).getText()).toBe('El heroe es mujer');
  });

});
