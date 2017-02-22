'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Displaying Data Tests', function () {
  let _title = 'Tour of Heroes';
  let _defaultHero = 'Windstorm';

  beforeAll(function () {
    browser.get('');
  });

  it('should display correct title: ' + _title, function () {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });

  it('should have correct default hero:  ' + _defaultHero, function () {
    expect(element(by.css('h2')).getText()).toContain(_defaultHero);
  });

 it('should have heroes', function () {
    let heroEls = element.all(by.css('li'));
    expect(heroEls.count()).not.toBe(0, 'should have heroes');
  });

  it('should display "there are many heroes!"', function () {
    expect(element(by.css('ul ~ p')).getText()).toContain('There are many heroes!');
  });
});
