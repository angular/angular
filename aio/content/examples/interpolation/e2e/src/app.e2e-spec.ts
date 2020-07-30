import { browser, element, by } from 'protractor';

describe('Interpolation e2e tests', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should display Interpolation and Template Expressions', () => {
    expect(element(by.css('h1')).getText()).toEqual('Interpolation and Template Expressions');
  });

  it('should display Current customer: Maria', () => {
    expect(element.all(by.css('h3')).get(0).getText()).toBe(`Current customer: Maria`);
  });

  it('should display The sum of 1 + 1 is not 4.', () => {
    expect(element.all(by.css('p:last-child')).get(0).getText()).toBe(`The sum of 1 + 1 is not 4.`);
  });

  it('should display Expression Context', () => {
    expect(element.all(by.css('h2')).get(1).getText()).toBe(`Expression Context`);
  });

  it('should display a list of customers', () => {
    expect(element.all(by.css('li')).get(0).getText()).toBe(`Maria`);
  });

  it('should display two pictures', () => {
    const pottedPlant = element.all(by.css('img')).get(0);
    const lamp = element.all(by.css('img')).get(1);

    expect(pottedPlant.getAttribute('src')).toContain('potted-plant');
    expect(pottedPlant.isDisplayed()).toBe(true);

    expect(lamp.getAttribute('src')).toContain('lamp');
    expect(lamp.isDisplayed()).toBe(true);
  });

  it('should support user input', () => {
    const input = element(by.css('input'));
    const label = element(by.css('label'));
    expect(label.getText()).toEqual('Type something:');
    input.sendKeys('abc');
    expect(label.getText()).toEqual('Type something: abc');
  });
});
