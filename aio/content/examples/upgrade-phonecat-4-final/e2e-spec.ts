'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

describe('PhoneCat Application', function() {

  // #docregion redirect
  it('should redirect `index.html` to `index.html#!/phones', function() {
    browser.get('index.html');
    browser.waitForAngular();
    browser.getCurrentUrl().then(function(url: string) {
      expect(url.endsWith('/phones')).toBe(true);
    });
  });
  // #enddocregion redirect

  describe('View: Phone list', function() {

    beforeEach(function() {
      browser.get('index.html#!/phones');
    });

    it('should filter the phone list as a user types into the search box', function() {
      let phoneList = element.all(by.css('.phones li'));
      let query = element(by.css('input'));

      expect(phoneList.count()).toBe(20);

      query.sendKeys('nexus');
      expect(phoneList.count()).toBe(1);

      query.clear();
      query.sendKeys('motorola');
      expect(phoneList.count()).toBe(8);
    });

    it('should be possible to control phone order via the drop-down menu', function() {
      let queryField = element(by.css('input'));
      let orderSelect = element(by.css('select'));
      let nameOption = orderSelect.element(by.css('option[value="name"]'));
      let phoneNameColumn = element.all(by.css('.phones .name'));

      function getNames() {
        return phoneNameColumn.map(function(elem) {
          return elem.getText();
        });
      }

      queryField.sendKeys('tablet');   // Let's narrow the dataset to make the assertions shorter

      expect(getNames()).toEqual([
        'Motorola XOOM\u2122 with Wi-Fi',
        'MOTOROLA XOOM\u2122'
      ]);

      nameOption.click();

      expect(getNames()).toEqual([
        'MOTOROLA XOOM\u2122',
        'Motorola XOOM\u2122 with Wi-Fi'
      ]);
    });

    // #docregion links
    it('should render phone specific links', function() {
      let query = element(by.css('input'));
      query.sendKeys('nexus');
      element.all(by.css('.phones li a')).first().click();
      browser.getCurrentUrl().then(function(url: string) {
        expect(url.endsWith('/phones/nexus-s')).toBe(true);
      });
    });
    // #enddocregion links

  });

  describe('View: Phone detail', function() {

    beforeEach(function() {
      browser.get('index.html#!/phones/nexus-s');
    });

    it('should display the `nexus-s` page', function() {
      expect(element(by.css('h1')).getText()).toBe('Nexus S');
    });

    it('should display the first phone image as the main phone image', function() {
      let mainImage = element(by.css('img.phone.selected'));

      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

    it('should swap the main image when clicking on a thumbnail image', function() {
      let mainImage = element(by.css('img.phone.selected'));
      let thumbnails = element.all(by.css('.phone-thumbs img'));

      thumbnails.get(2).click();
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

      thumbnails.get(0).click();
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

  });

});
