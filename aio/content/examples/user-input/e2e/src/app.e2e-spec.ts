import { browser, element, by, protractor } from 'protractor';

describe('User Input Tests', () => {

  beforeAll(() => browser.get(''));

  it('should support the click event', async () => {
    const mainEle = element(by.css('app-click-me'));
    const buttonEle = element(by.css('app-click-me button'));
    expect(await mainEle.getText()).not.toContain('You are my hero!');
    await buttonEle.click();
    expect(await mainEle.getText()).toContain('You are my hero!');
  });

  it('should support the click event with an event payload', async () => {
    const mainEle = element(by.css('app-click-me2'));
    const buttonEle = element(by.css('app-click-me2 button'));
    expect(await mainEle.getText()).not.toContain('Event target is ');
    await buttonEle.click();
    expect(await mainEle.getText()).toContain('Event target is BUTTON');
  });

  it('should support the keyup event ', async () => {
    const mainEle = element(by.css('app-key-up1'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(await outputTextEle.getText()).toEqual('');
    await inputEle.sendKeys('abc');
    expect(await outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should support user input from a local template let (loopback)', async () => {
    const mainEle = element(by.css('app-loop-back'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(await outputTextEle.getText()).toEqual('');
    await inputEle.sendKeys('abc');
    expect(await outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to combine click event with a local template var', async () => {
    const mainEle = element(by.css('app-key-up2'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(await outputTextEle.getText()).toEqual('');
    await inputEle.sendKeys('abc');
    expect(await outputTextEle.getText()).toEqual('a | ab | abc |');
  });

  it('should be able to filter key events', async () => {
    const mainEle = element(by.css('app-key-up3'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(await outputTextEle.getText()).toEqual('');
    await inputEle.sendKeys('abc');
    expect(await outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // broken atm, see https://github.com/angular/angular/issues/9419
    await inputEle.sendKeys(protractor.Key.ENTER);
    expect(await outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to filter blur events', async () => {
    const prevInputEle = element(by.css('app-key-up3 input'));
    const mainEle = element(by.css('app-key-up4'));
    const inputEle = mainEle.element(by.css('input'));
    const outputTextEle = mainEle.element(by.css('p'));
    expect(await outputTextEle.getText()).toEqual('');
    await inputEle.sendKeys('abc');
    expect(await outputTextEle.getText()).toEqual('', 'should be blank - have not sent enter yet');
    // change the focus
    await prevInputEle.click();
    expect(await outputTextEle.getText()).toEqual('abc');
  });

  it('should be able to compose little tour of heroes', async () => {
    const mainEle = element(by.css('app-little-tour'));
    const inputEle = mainEle.element(by.css('input'));
    const addButtonEle = mainEle.element(by.css('button'));
    const heroEles = mainEle.all(by.css('li'));
    const numHeroes = await heroEles.count();
    expect(numHeroes).toBeGreaterThan(0);

    await inputEle.sendKeys('abc');
    await addButtonEle.click();
    expect(await heroEles.count()).toEqual(numHeroes + 1, 'should be one more hero added');
    expect(await heroEles.get(numHeroes).getText()).toContain('abc');
  });
});

