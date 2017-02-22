import { browser, element, by } from 'protractor';
import { appLang, describeIf } from '../protractor-helpers';

describeIf(appLang.appIsTs || appLang.appIsJs, 'Forms Tests', function () {

  beforeEach(function () {
    browser.get('');
  });

  it('should display correct title', function () {
    expect(element.all(by.css('h1')).get(0).getText()).toEqual('Hero Form');
  });


  it('should not display message before submit', function () {
    let ele = element(by.css('h2'));
    expect(ele.isDisplayed()).toBe(false);
  });

  it('should hide form after submit', function () {
    let ele = element.all(by.css('h1')).get(0);
    expect(ele.isDisplayed()).toBe(true);
    let b = element.all(by.css('button[type=submit]')).get(0);
    b.click().then(function() {
      expect(ele.isDisplayed()).toBe(false);
    });
  });

  it('should display message after submit', function () {
    let b = element.all(by.css('button[type=submit]')).get(0);
    b.click().then(function() {
      expect(element(by.css('h2')).getText()).toContain('You submitted the following');
    });
  });

  it('should hide form after submit', function () {
    let alterEgoEle = element.all(by.css('input[name=alterEgo]')).get(0);
    expect(alterEgoEle.isDisplayed()).toBe(true);
    let submitButtonEle = element.all(by.css('button[type=submit]')).get(0);
    submitButtonEle.click().then(function() {
      expect(alterEgoEle.isDisplayed()).toBe(false);
    });
  });

  it('should reflect submitted data after submit', function () {
    let test = 'testing 1 2 3';
    let newValue: string;
    let alterEgoEle = element.all(by.css('input[name=alterEgo]')).get(0);
    alterEgoEle.getAttribute('value').then(function(value: string) {
      alterEgoEle.sendKeys(test);
      newValue = value + test;
      expect(alterEgoEle.getAttribute('value')).toEqual(newValue);
      let b = element.all(by.css('button[type=submit]')).get(0);
      return b.click();
    }).then(function() {
      let alterEgoTextEle = element(by.cssContainingText('div', 'Alter Ego'));
      expect(alterEgoTextEle.isPresent()).toBe(true, 'cannot locate "Alter Ego" label');
      let divEle = element(by.cssContainingText('div', newValue));
      expect(divEle.isPresent()).toBe(true, 'cannot locate div with this text: ' + newValue);
    });
  });
});

