'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';

describe('Dependency Injection Tests', function () {

  let expectedMsg: string;
  let expectedMsgRx: RegExp;

  beforeAll(function () {
    browser.get('');
  });

  describe('Cars:', function() {

    it('DI car displays as expected', function () {
      expectedMsg = 'DI car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#di')).getText()).toEqual(expectedMsg);
    });

    it('No DI car displays as expected', function () {
      expectedMsg = 'No DI car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#nodi')).getText()).toEqual(expectedMsg);
    });

    it('Injector car displays as expected', function () {
      expectedMsg = 'Injector car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#injector')).getText()).toEqual(expectedMsg);
    });

    it('Factory car displays as expected', function () {
      expectedMsg = 'Factory car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#factory')).getText()).toEqual(expectedMsg);
    });

    it('Simple car displays as expected', function () {
      expectedMsg = 'Simple car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#simple')).getText()).toEqual(expectedMsg);
    });

    it('Super car displays as expected', function () {
      expectedMsg = 'Super car with 12 cylinders and Flintstone tires.';
      expect(element(by.css('#super')).getText()).toEqual(expectedMsg);
    });

    it('Test car displays as expected', function () {
      expectedMsg = 'Test car with 8 cylinders and YokoGoodStone tires.';
      expect(element(by.css('#test')).getText()).toEqual(expectedMsg);
    });
  });

  describe('Other Injections:', function() {
    it('DI car displays as expected', function () {
      expectedMsg = 'DI car with 4 cylinders and Flintstone tires.';
      expect(element(by.css('#car')).getText()).toEqual(expectedMsg);
    });

    it('Hero displays as expected', function () {
      expectedMsg = 'Mr. Nice';
      expect(element(by.css('#hero')).getText()).toEqual(expectedMsg);
    });

    it('Optional injection displays as expected', function () {
      expectedMsg = 'R.O.U.S.\'s? I don\'t think they exist!';
      expect(element(by.css('#rodent')).getText()).toEqual(expectedMsg);
    });
  });

  describe('Tests:', function() {

    it('Tests display as expected', function () {
      expectedMsgRx = /Tests passed/;
      expect(element(by.css('#tests')).getText()).toMatch(expectedMsgRx);
    });

  });

  describe('Provider variations:', function() {

    it('P1 (class) displays as expected', function () {
      expectedMsg = 'Hello from logger provided with Logger class';
      expect(element(by.css('#p1')).getText()).toEqual(expectedMsg);
    });

    it('P3 (provide) displays as expected', function () {
      expectedMsg = 'Hello from logger provided with useClass:Logger';
      expect(element(by.css('#p3')).getText()).toEqual(expectedMsg);
    });

    it('P4 (useClass:BetterLogger) displays as expected', function () {
      expectedMsg = 'Hello from logger provided with useClass:BetterLogger';
      expect(element(by.css('#p4')).getText()).toEqual(expectedMsg);
    });

    it('P5 (useClass:EvenBetterLogger - dependency)  displays as expected', function () {
      expectedMsg = 'Message to Bob: Hello from EvenBetterlogger';
      expect(element(by.css('#p5')).getText()).toEqual(expectedMsg);
    });

    it('P6a (no alias) displays as expected', function () {
      expectedMsg = 'Hello OldLogger (but we want NewLogger)';
      expect(element(by.css('#p6a')).getText()).toEqual(expectedMsg);
    });

    it('P6b (alias) displays as expected', function () {
      expectedMsg = 'Hello from NewLogger (via aliased OldLogger)';
      expect(element(by.css('#p6b')).getText()).toEqual(expectedMsg);
    });

    it('P7 (useValue) displays as expected', function () {
      expectedMsg = 'Silent logger says "Shhhhh!". Provided via "useValue"';
      expect(element(by.css('#p7')).getText()).toEqual(expectedMsg);
    });

    it('P8 (useFactory) displays as expected', function () {
      expectedMsg = 'Hero service injected successfully via heroServiceProvider';
      expect(element(by.css('#p8')).getText()).toEqual(expectedMsg);
    });

    it('P9 (OpaqueToken) displays as expected', function () {
      expectedMsg = 'APP_CONFIG Application title is Dependency Injection';
      expect(element(by.css('#p9')).getText()).toEqual(expectedMsg);
    });

    it('P10 (optional dependency) displays as expected', function () {
      expectedMsg = 'Optional logger was not available';
      expect(element(by.css('#p10')).getText()).toEqual(expectedMsg);
    });
  });

  describe('User/Heroes:', function() {
    it('User is Bob - unauthorized', function () {
      expectedMsgRx = /Bob, is not authorized/;
      expect(element(by.css('#user')).getText()).toMatch(expectedMsgRx);
    });

    it('should have button', function () {
      expect(element.all(by.cssContainingText('button', 'Next User'))
        .get(0).isDisplayed()).toBe(true, '\'Next User\' button should be displayed');
    });

    it('unauthorized user should have multiple unauthorized heroes', function () {
      let heroes = element.all(by.css('#unauthorized hero-list div'));
      expect(heroes.count()).toBeGreaterThan(0);
    });

    it('unauthorized user should have no secret heroes', function () {
      let heroes = element.all(by.css('#unauthorized hero-list div'));
      expect(heroes.count()).toBeGreaterThan(0);

      let filteredHeroes = heroes.filter((elem: ElementFinder, index: number) => {
        return elem.getText().then((text: string) => {
          return /secret/.test(text);
        });
      });

      expect(filteredHeroes.count()).toEqual(0);
    });

    it('unauthorized user should have no authorized heroes listed', function () {
      expect(element.all(by.css('#authorized hero-list div')).count()).toEqual(0);
    });

    describe('after button click', function() {

      beforeAll(function (done: any) {
        let buttonEle = element.all(by.cssContainingText('button', 'Next User')).get(0);
        buttonEle.click().then(done, done);
      });

      it('User is Alice  - authorized', function () {
        expectedMsgRx = /Alice, is authorized/;
        expect(element(by.css('#user')).getText()).toMatch(expectedMsgRx);
      });

      it('authorized user should have multiple authorized heroes ', function () {
        let heroes = element.all(by.css('#authorized hero-list div'));
        expect(heroes.count()).toBeGreaterThan(0);
      });

      it('authorized user should have secret heroes', function () {
        let heroes = element.all(by.css('#authorized hero-list div'));
        expect(heroes.count()).toBeGreaterThan(0);

        let filteredHeroes = heroes.filter(function(elem: ElementFinder, index: number){
         return elem.getText().then(function(text: string) {
            return /secret/.test(text);
          });
        });

        expect(filteredHeroes.count()).toBeGreaterThan(0);
      });

      it('authorized user should have no unauthorized heroes listed', function () {
        expect(element.all(by.css('#unauthorized hero-list div')).count()).toEqual(0);
      });
    });
  });
});
