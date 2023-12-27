import { browser, element, by } from 'protractor';


describe('Property binding e2e tests', () => {

  beforeEach(() => browser.get(''));

  it('should display Property Binding with Angular', async () => {
    expect(await element(by.css('h1')).getText()).toEqual('Property Binding with Angular');
  });

  it('should display four phone pictures', async () => {
    expect(await element.all(by.css('img')).isPresent()).toBe(true);
    expect(await element.all(by.css('img')).count()).toBe(3);
  });

  it('should display Disabled button', async () => {
    expect(await element.all(by.css('button')).get(0).getText()).toBe(`Disabled Button`);
  });

  it('should display Binding to a property of a directive', async () => {
    expect(await element.all(by.css('h2')).get(3).getText()).toBe(`Binding to a property of a directive`);
  });

  it('should display blue', async () => {
    expect(await element.all(by.css('p')).get(0).getText()).toContain(`blue`);
  });

  it('should display Your item is: lamp', async () => {
    expect(await element.all(by.css('p')).get(1).getText()).toContain(`Your item is: lamp`);
  });

  it('should display Your item is: parentItem', async () => {
    expect(await element.all(by.css('p')).get(2).getText()).toBe(`Your item is: parentItem`);
  });

  it('should display a ul', async () => {
    expect(await element.all(by.css('ul')).get(0).getText()).toContain(`tv`);
  });

  it('should display a ul containing phone', async () => {
    expect(await element.all(by.css('ul')).get(1).getText()).toBe(`21 phone`);
  });

  it('should display Malicious content', async () => {
    expect(await element.all(by.css('h2')).get(6).getText()).toBe(`Malicious content`);
  });
});
