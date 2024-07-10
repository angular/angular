import {browser, element, by} from 'protractor';

describe('Forms Tests', () => {
  beforeEach(() => browser.get(''));

  it('should display correct title', async () => {
    expect(await element.all(by.css('h1')).get(0).getText()).toEqual('Actor Form');
  });

  it('should not display message before submit', async () => {
    const ele = element(by.css('h2'));
    expect(await ele.isDisplayed()).toBe(false);
  });

  it('should hide form after submit', async () => {
    const ele = element.all(by.css('h1')).get(0);
    expect(await ele.isDisplayed()).toBe(true);

    const b = element.all(by.css('button[type=submit]')).get(0);
    await b.click();
    expect(await ele.isDisplayed()).toBe(false);
  });

  it('should display message after submit', async () => {
    const b = element.all(by.css('button[type=submit]')).get(0);
    await b.click();
    expect(await element(by.css('h2')).getText()).toContain('You submitted the following');
  });

  it('should hide form after submit', async () => {
    const studioEle = element.all(by.css('input[name=studio]')).get(0);
    expect(await studioEle.isDisplayed()).toBe(true);

    const submitButtonEle = element.all(by.css('button[type=submit]')).get(0);
    await submitButtonEle.click();
    expect(await studioEle.isDisplayed()).toBe(false);
  });

  it('should reflect submitted data after submit', async () => {
    const studioEle = element.all(by.css('input[name=studio]')).get(0);
    const value = await studioEle.getAttribute('value');
    const test = 'testing 1 2 3';
    const newValue = value + test;

    await studioEle.sendKeys(test);
    expect(await studioEle.getAttribute('value')).toEqual(newValue);

    const b = element.all(by.css('button[type=submit]')).get(0);
    await b.click();

    const studioTextEle = element(by.cssContainingText('div', 'Studio'));
    expect(await studioTextEle.isPresent()).toBe(true, 'cannot locate "Studio" label');
    const divEle = element(by.cssContainingText('div', newValue));
    expect(await divEle.isPresent()).toBe(true, `cannot locate div with this text: ${newValue}`);
  });
});
