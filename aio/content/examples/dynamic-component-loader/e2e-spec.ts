'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

/* tslint:disable:quotemark */
describe('Dynamic Component Loader', function () {

  beforeEach(function () {
    browser.get('');
  });

  it('should load ad banner', function () {
    let headline = element(by.xpath("//h4[text()='Featured Hero Profile']"));
    let name = element(by.xpath("//h3[text()='Bombasto']"));
    let bio = element(by.xpath("//p[text()='Brave as they come']"));

    expect(name).toBeDefined();
    expect(headline).toBeDefined();
    expect(bio).toBeDefined();
  });
});
