'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

/* tslint:disable:quotemark */
describe('AOT Compilation', function () {

    beforeAll(function () {
        browser.get('');
    });

    it('should load page and click button', function (done: any) {
      let headingSelector = element.all(by.css('h1')).get(0);
      expect(headingSelector.getText()).toEqual('Hello Angular');

      expect(element.all(by.xpath('//div[text()="Magneta"]')).get(0).isPresent()).toBe(true);
      expect(element.all(by.xpath('//div[text()="Bombasto"]')).get(0).isPresent()).toBe(true);
      expect(element.all(by.xpath('//div[text()="Magma"]')).get(0).isPresent()).toBe(true);
      expect(element.all(by.xpath('//div[text()="Tornado"]')).get(0).isPresent()).toBe(true);

      let toggleButton = element.all(by.css('button')).get(0);
      toggleButton.click().then(function() {
        expect(headingSelector.isPresent()).toBe(false);
        done();
      });
    });
});
