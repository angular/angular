import { browser, element, by } from 'protractor';


describe('Property binding e2e tests', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display Property Binding with Angular', () => {
    expect(element(by.css('h1')).getText()).toEqual('Property Binding with Angular');
  });

  it('should display four phone pictures', () => {
    expect(element.all(by.css('img')).isPresent()).toBe(true);
    expect(element.all(by.css('img')).count()).toBe(4);

  });

  it('should display Disabled button', () => {
    expect(element.all(by.css('button')).get(0).getText()).toBe(`Disabled Button`);
  });

  it('should display Binding to a property of a directive', () => {
    expect(element.all(by.css('h2')).get(4).getText()).toBe(`Binding to a property of a directive`);
  });

  it('should display Your item is: lamp', () => {
    expect(element.all(by.css('p')).get(0).getText()).toContain(`blue`);
  });
  it('should display Your item is: lamp', () => {
    expect(element.all(by.css('p')).get(1).getText()).toContain(`Your item is: lamp`);
  });

  it('should display Your item is: parentItem', () => {
    expect(element.all(by.css('p')).get(2).getText()).toBe(`Your item is: parentItem`);
  });

  it('should display a ul', () => {
    expect(element.all(by.css('ul')).get(0).getText()).toContain(`tv`);
  });

  it('should display a ul containing phone', () => {
    expect(element.all(by.css('ul')).get(1).getText()).toBe(`21 phone`);
  });

  it('should display one-time initialized string', () => {
    expect(element.all(by.css('p')).get(3).getText()).toContain(`one-time initialized`);
  });

  it('should display Malicious content', () => {
    expect(element.all(by.css('h2')).get(8).getText()).toBe(`Malicious content`);
  });
});
