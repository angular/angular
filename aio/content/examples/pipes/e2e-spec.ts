'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Pipes', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should open correctly', function () {
    expect(element.all(by.tagName('h1')).get(0).getText()).toEqual('Pipes');
    expect(element(by.css('hero-birthday p')).getText()).toEqual(`The hero's birthday is Apr 15, 1988`);
  });

  it('should show 4 heroes', function () {
    expect(element.all(by.css('hero-list div')).count()).toEqual(4);
  });

  it('should show a familiar hero in json', function () {
    expect(element(by.cssContainingText('hero-list p', 'Heroes as JSON')).getText()).toContain('Bombasto');
  });

  it('should show alternate birthday formats', function () {
    expect(element(by.cssContainingText('my-app > p', `The hero's birthday is Apr 15, 1988`)).isDisplayed()).toBe(true);
    expect(element(by.cssContainingText('my-app > p', `The hero's birthday is 04/15/88`)).isDisplayed()).toBe(true);
  });

  it('should be able to toggle birthday formats', function () {
    let birthDayEle = element(by.css('hero-birthday2 > p'));
    expect(birthDayEle.getText()).toEqual(`The hero's birthday is 4/15/1988`);
    let buttonEle = element(by.cssContainingText('hero-birthday2 > button', 'Toggle Format'));
    expect(buttonEle.isDisplayed()).toBe(true);
    buttonEle.click().then(function() {
      expect(birthDayEle.getText()).toEqual(`The hero's birthday is Friday, April 15, 1988`);
    });
  });

  it('should be able to chain and compose pipes', function () {
    let chainedPipeEles = element.all(by.cssContainingText('my-app p', `The chained hero's`));
    expect(chainedPipeEles.count()).toBe(3, 'should have 3 chained pipe examples');
    expect(chainedPipeEles.get(0).getText()).toContain('APR 15, 1988');
    expect(chainedPipeEles.get(1).getText()).toContain('FRIDAY, APRIL 15, 1988');
    expect(chainedPipeEles.get(2).getText()).toContain('FRIDAY, APRIL 15, 1988');
  });

  it('should be able to use ExponentialStrengthPipe pipe', function () {
    let ele = element(by.css('power-booster p'));
    expect(ele.getText()).toContain('Super power boost: 1024');
  });

  it('should be able to use the exponential calculator', function () {
    let eles = element.all(by.css('power-boost-calculator input'));
    let baseInputEle = eles.get(0);
    let factorInputEle = eles.get(1);
    let outputEle = element(by.css('power-boost-calculator p'));
    baseInputEle.clear().then(function() {
      baseInputEle.sendKeys('7');
      return factorInputEle.clear();
    }).then(function() {
      factorInputEle.sendKeys('3');
      expect(outputEle.getText()).toContain('343');
    });
  });


  it('should support flying heroes (pure) ', function () {
    let nameEle = element(by.css('flying-heroes input[type="text"]'));
    let canFlyCheckEle = element(by.css('flying-heroes #can-fly'));
    let mutateCheckEle = element(by.css('flying-heroes #mutate'));
    let resetEle = element(by.css('flying-heroes button'));
    let flyingHeroesEle = element.all(by.css('flying-heroes #flyers div'));

    expect(canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    nameEle.sendKeys('test1\n');
    expect(flyingHeroesEle.count()).toEqual(2, 'no change while mutating array');
    mutateCheckEle.click().then(function() {
      nameEle.sendKeys('test2\n');
      expect(flyingHeroesEle.count()).toEqual(4, 'not mutating; should see both adds');
      expect(flyingHeroesEle.get(2).getText()).toContain('test1');
      expect(flyingHeroesEle.get(3).getText()).toContain('test2');
      return resetEle.click();
    })
    .then(function() {
       expect(flyingHeroesEle.count()).toEqual(2, 'reset should restore orginal flying heroes');
    });
  });


  it('should support flying heroes (impure) ', function () {
    let nameEle = element(by.css('flying-heroes-impure input[type="text"]'));
    let canFlyCheckEle = element(by.css('flying-heroes-impure #can-fly'));
    let mutateCheckEle = element(by.css('flying-heroes-impure #mutate'));
    let flyingHeroesEle = element.all(by.css('flying-heroes-impure #flyers div'));

    expect(canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    nameEle.sendKeys('test1\n');
    expect(flyingHeroesEle.count()).toEqual(3, 'new flying hero should show in mutating array');
  });

  it('should show an async hero message', function () {
    expect(element.all(by.tagName('hero-message')).get(0).getText()).toContain('hero');
  });

});
