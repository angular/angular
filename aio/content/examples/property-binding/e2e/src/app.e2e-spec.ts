import { browser, element, by } from 'protractor';


describe('Property binding e2e tests', () => {

  beforeEach(function () {
    browser.get('');
  });

  it('should display Property Binding with Angular', function () {
    expect(element(by.css('h1')).getText()).toEqual('Property Binding with Angular');
  });

  it('should display four phone pictures', function() {
    expect(element.all(by.css('img')).isPresent()).toBe(true);
    expect(element.all(by.css('img')).count()).toBe(4);

  });

  it('should display Disabled button', function () {
    expect(element.all(by.css('button')).get(0).getText()).toBe(`Disabled Button`);
  });

  it('should display Binding to a property of a directive', function () {
    expect(element.all(by.css('h2')).get(4).getText()).toBe(`Binding to a property of a directive`);
  });

  it('should display Your item is: lamp', function () {
    expect(element.all(by.css('p')).get(0).getText()).toContain(`blue`);
  });
  it('should display Your item is: lamp', function () {
    expect(element.all(by.css('p')).get(1).getText()).toContain(`Your item is: lamp`);
  });

  it('should display Your item is: parentItem', function () {
    expect(element.all(by.css('p')).get(2).getText()).toBe(`Your item is: parentItem`);
  });

  it('should display a ul', function () {
    expect(element.all(by.css('ul')).get(0).getText()).toContain(`tv`);
  });

  it('should display a ul containing phone', function () {
    expect(element.all(by.css('ul')).get(1).getText()).toBe(`21 phone`);
  });

  it('should display one-time initialized string', function () {
    expect(element.all(by.css('p')).get(3).getText()).toContain(`one-time initialized`);
  });

  it('should display Malicious content', function () {
    expect(element.all(by.css('h2')).get(8).getText()).toBe(`Malicious content`);
  });
});
