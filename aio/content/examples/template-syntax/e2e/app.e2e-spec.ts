'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

// Not yet complete
describe('Template Syntax', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should be able to use interpolation with a hero', function () {
    let heroInterEle = element.all(by.css('h2+p')).get(0);
    expect(heroInterEle.getText()).toEqual('My current hero is Hercules');
  });

  it('should be able to use interpolation with a calculation', function () {
    let theSumEles = element.all(by.cssContainingText('h3~p', 'The sum of'));
    expect(theSumEles.count()).toBe(2);
    expect(theSumEles.get(0).getText()).toEqual('The sum of 1 + 1 is 2');
    expect(theSumEles.get(1).getText()).toEqual('The sum of 1 + 1 is not 4');
  });

  it('should be able to use class binding syntax', function () {
    let specialEle = element(by.cssContainingText('div', 'Special'));
    expect(specialEle.getAttribute('class')).toMatch('special');
  });

  it('should be able to use style binding syntax', function () {
    let specialButtonEle = element(by.cssContainingText('div.special~button', 'button'));
    expect(specialButtonEle.getAttribute('style')).toMatch('color: red');
  });

  it('should two-way bind to sizer', async () => {
    let div = element(by.css('div#two-way-1'));
    let incButton = div.element(by.buttonText('+'));
    let input = div.element(by.css('input'));
    let initSize = await input.getAttribute('value');
    incButton.click();
    expect(input.getAttribute('value')).toEqual((+initSize + 1).toString());
  });
});

