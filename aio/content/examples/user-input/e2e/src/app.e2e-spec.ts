import { browser, element, by, protractor } from 'protractor';

describe('User Input Tests', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should support the click event', () => {
    const mainEle = element(by.css('app-click-me'));
    const buttonEle = element(by.css('app-click-me button'));
    expect(mainEle.getText()).not.toContain('You are my hero!');
    buttonEle.click().then(() => {
      expect(mainEle.getText()).toContain('You are my hero!');
    });
  });

  it('should support the click event with an event payload', () => {
    const mainEle = element(by.css('app-click-me2'));
    const buttonEle = element(by.css('app-click-me2 button'));
    expect(mainEle.getText()).not.toContain('Event target is ');
    buttonEle.click().then(() => {
      expect(mainEle.getText()).toContain('Event target is BUTTON');
    });
  });

  it('should support the keyup event ', () => {
    const mainEle = element(by.css('app-key-up1'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should support user input from a local template let (loopback)', () => {
    const mainEle = element(by.css('app-loop-back'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to combine click event with a local template var', () => {
    const mainEle = element(by.css('app-key-up2'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should be able to filter key events', () => {
    const mainEle = element(by.css('app-key-up3'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // broken atm, see https://github.com/angular/angular/issues/9419
    inputEle.sendKeys(protractor.Key.ENTER);
    expect(outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to filter blur events', () => {
    const prevInputEle = element(by.css('app-key-up3 input'));
    const mainEle = element(by.css('app-key-up4'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(outputTextEle.getText()).toEqual('');
    inputEle.sendKeys('abc');
    expect(outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // change the focus
    prevInputEle.click().then(() => {
      expect(outputTextEle.getText()).toEqual('abc');
    });
  });

  it('should be able to compose little tour of heroes', () => {
    const mainEle = element(by.css('app-little-tour'));
    const inputEle = mainEle.element(by.css('input'));
    const addButtonEle = mainEle.element(by.css('button'));
    const heroEles = mainEle.all(by.css('li'));
    let numHeroes: number;
    expect(heroEles.count()).toBeGreaterThan(0);
    heroEles.count().then((count: number) => {
      numHeroes = count;
      inputEle.sendKeys('abc');
      return addButtonEle.click();
    }).then(() => {
      expect(heroEles.count()).toEqual(numHeroes + 1, 'should be one more hero added');
      expect(heroEles.get(numHeroes).getText()).toContain('abc');
    });
  });
});

