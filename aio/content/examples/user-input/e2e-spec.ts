'use strict'; // necessary for es6 output in node

import { browser, element, by, protractor } from 'protractor';

describe('User Input Tests', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should support the click event', function () {
    let mainEle = element(by.css('click-me'));
    let buttonEle = element(by.css('click-me button'));
    expect(mainEle.getText()).not.toContain('You are my hero!');
    buttonEle.click().then(function() {
      expect(mainEle.getText()).toContain('You are my hero!');
    });
  });

  it('should support the click event with an event payload', function () {
    let mainEle = element(by.css('click-me2'));
    let buttonEle = element(by.css('click-me2 button'));
    expect(mainEle.getText()).not.toContain('Event target is ');
    buttonEle.click().then(function() {
      expect(mainEle.getText()).toContain('Event target is BUTTON');
    });
  });

  it('should support the keyup event ', function () {
    let mainEle = element(by.css('key-up1'));
    let inputEle = mainEle.element(by.css('input'));
    let outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should support user input from a local template let (loopback)', function () {
    let mainEle = element(by.css('loop-back'));
    let inputEle = mainEle.element(by.css('input'));
    let outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to combine click event with a local template var', function () {
    let mainEle = element(by.css('key-up2'));
    let inputEle = mainEle.element(by.css('input'));
    let outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should be able to filter key events', () => {
    let mainEle = element(by.css('key-up3'));
    let inputEle = mainEle.element(by.css('input'));
    let outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // broken atm, see https://github.com/angular/angular/issues/9419
    inputEle.sendKeys(protractor.Key.ENTER);
    expect(outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to filter blur events', function () {
    let prevInputEle = element(by.css('key-up3 input'));
    let mainEle = element(by.css('key-up4'));
    let inputEle = mainEle.element(by.css('input'));
    let outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // change the focus
    prevInputEle.click().then(function() {
      expect(outputTextEle.getText()).toEqual('abc');
    });
  });

  it('should be able to compose little tour of heroes', function () {
    let mainEle = element(by.css('little-tour'));
    let inputEle = mainEle.element(by.css('input'));
    let addButtonEle = mainEle.element(by.css('button'));
    let heroEles = mainEle.all(by.css('li'));
    let numHeroes: number;
    expect(heroEles.count()).toBeGreaterThan(0);
    heroEles.count().then(function(count: number) {
      numHeroes = count;
      inputEle.sendKeys('abc');
      return addButtonEle.click();
    }).then(function() {
      expect(heroEles.count()).toEqual(numHeroes + 1, 'should be one more hero added');
      expect(heroEles.get(numHeroes).getText()).toContain('abc');
    });
  });
});

