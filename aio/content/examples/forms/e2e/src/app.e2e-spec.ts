import { browser, element, by } from 'protractor';

describe('Forms Tests', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display correct title', () => {
    expect(element.all(by.css('h1')).get(0).getText()).toEqual('Hero Form');
  });


  it('should not display message before submit', () => {
    let ele = element(by.css('h2'));
    expect(ele.isDisplayed()).toBe(false);
  });

  it('should hide form after submit', () => {
    let ele = element.all(by.css('h1')).get(0);
    expect(ele.isDisplayed()).toBe(true);
    let b = element.all(by.css('button[type=submit]')).get(0);
    b.click().then(() => {
      expect(ele.isDisplayed()).toBe(false);
    });
  });

  it('should display message after submit', () => {
    let b = element.all(by.css('button[type=submit]')).get(0);
    b.click().then(() => {
      expect(element(by.css('h2')).getText()).toContain('You submitted the following');
    });
  });

  it('should hide form after submit', () => {
    let alterEgoEle = element.all(by.css('input[name=alterEgo]')).get(0);
    expect(alterEgoEle.isDisplayed()).toBe(true);
    let submitButtonEle = element.all(by.css('button[type=submit]')).get(0);
    submitButtonEle.click().then(() => {
      expect(alterEgoEle.isDisplayed()).toBe(false);
    });
  });

  it('should reflect submitted data after submit', () => {
    let test = 'testing 1 2 3';
    let newValue: string;
    let alterEgoEle = element.all(by.css('input[name=alterEgo]')).get(0);
    alterEgoEle.getAttribute('value').then((value: string) => {
      alterEgoEle.sendKeys(test);
      newValue = value + test;
      expect(alterEgoEle.getAttribute('value')).toEqual(newValue);
      let b = element.all(by.css('button[type=submit]')).get(0);
      return b.click();
    }).then(() => {
      let alterEgoTextEle = element(by.cssContainingText('div', 'Alter Ego'));
      expect(alterEgoTextEle.isPresent()).toBe(true, 'cannot locate "Alter Ego" label');
      let divEle = element(by.cssContainingText('div', newValue));
      expect(divEle.isPresent()).toBe(true, 'cannot locate div with this text: ' + newValue);
    });
  });
});

