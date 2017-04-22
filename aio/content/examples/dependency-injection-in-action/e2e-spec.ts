'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Dependency Injection Cookbook', function () {

    beforeAll(function () {
        browser.get('');
    });

    it('should render Logged in User example', function () {
      let loggedInUser = element.all(by.xpath('//h3[text()="Logged in user"]')).get(0);
      expect(loggedInUser).toBeDefined();
    });

    it('"Bombasto" should be the logged in user', function () {
      let loggedInUser = element.all(by.xpath('//div[text()="Name: Bombasto"]')).get(0);
      expect(loggedInUser).toBeDefined();
    });

    it('should render sorted heroes', function () {
      let sortedHeroes = element.all(by.xpath('//h3[text()="Sorted Heroes" and position()=1]')).get(0);
      expect(sortedHeroes).toBeDefined();
    });

    it('Mr. Nice should be in sorted heroes', function () {
      let sortedHero = element.all(by.xpath('//sorted-heroes/[text()="Mr. Nice" and position()=2]')).get(0);
      expect(sortedHero).toBeDefined();
    });

    it('RubberMan should be in sorted heroes', function () {
      let sortedHero = element.all(by.xpath('//sorted-heroes/[text()="RubberMan" and position()=3]')).get(0);
      expect(sortedHero).toBeDefined();
    });

    it('Magma should be in sorted heroes', function () {
      let sortedHero = element.all(by.xpath('//sorted-heroes/[text()="Magma"]')).get(0);
      expect(sortedHero).toBeDefined();
    });

    it('should render Hero of the Month', function () {
      let heroOfTheMonth = element.all(by.xpath('//h3[text()="Hero of the month"]')).get(0);
      expect(heroOfTheMonth).toBeDefined();
    });

    it('should render Hero Bios', function () {
      let heroBios = element.all(by.xpath('//h3[text()="Hero Bios"]')).get(0);
      expect(heroBios).toBeDefined();
    });

    it('should render Magma\'s description in Hero Bios', function () {
      let magmaText =  element.all(by.xpath('//textarea[text()="Hero of all trades"]')).get(0);
      expect(magmaText).toBeDefined();
    });

    it('should render Magma\'s phone in Hero Bios and Contacts', function () {
      let magmaPhone =  element.all(by.xpath('//div[text()="Phone #: 555-555-5555"]')).get(0);
      expect(magmaPhone).toBeDefined();
    });

    it('should render Hero-of-the-Month runner-ups', function () {
      let runnersUp =  element(by.id('rups1')).getText();
      expect(runnersUp).toContain('RubberMan, Mr. Nice');
    });

    it('should render DateLogger log entry in Hero-of-the-Month', function () {
      let logs =  element.all(by.id('logs')).get(0).getText();
      expect(logs).toContain('INFO: starting up at');
    });

    it('should highlight Hero Bios and Contacts container when mouseover', function () {
      let target = element(by.css('div[myHighlight="yellow"]'));
      let yellow = 'rgba(255, 255, 0, 1)';

      expect(target.getCssValue('background-color')).not.toEqual(yellow);
      browser.actions().mouseMove(target.getWebElement()).perform();
      expect(target.getCssValue('background-color')).toEqual(yellow);
    });

    describe('in Parent Finder', function () {
      let cathy1 = element(by.css('alex cathy'));
      let craig1 = element(by.css('alex craig'));
      let carol1 = element(by.css('alex carol p'));
      let carol2 = element(by.css('barry carol p'));

      it('"Cathy" should find "Alex" via the component class', function () {
        expect(cathy1.getText()).toContain('Found Alex via the component');
      });

      it('"Craig" should not find "Alex" via the base class', function () {
        expect(craig1.getText()).toContain('Did not find Alex via the base');
      });

      it('"Carol" within "Alex" should have "Alex" parent', function () {
        expect(carol1.getText()).toContain('Alex');
      });

      it('"Carol" within "Barry" should have "Barry" parent', function () {
        expect(carol2.getText()).toContain('Barry');
      });
    });
});
