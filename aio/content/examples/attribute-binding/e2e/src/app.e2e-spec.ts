import { browser, element, by } from 'protractor';

describe('Attribute binding example', () => {

  beforeEach(() => browser.get(''));

  it('should display Property Binding with Angular', async () => {
    expect(await element(by.css('h1')).getText()).toEqual('Attribute, class, and style bindings');
  });

  it('should display a table', async () => {
    expect(await element.all(by.css('table')).isPresent()).toBe(true);
  });

  it('should display an Aria button', async () => {
    expect(await element.all(by.css('button')).get(0).getText()).toBe('Create and set an attribute with Aria');
  });

  it('should display a black background on div', async () => {
    const div = element.all(by.css('div')).get(1);
    expect(await div.getCssValue('background-color')).toEqual('rgba(0, 0, 0, 1)');
  });

  it('should display a black div with a light blue double border', async () => {
    const div = element.all(by.css('div')).get(1);
    expect(await div.getCssValue('border')).toEqual('16px double rgb(87, 209, 255)');
  });

  it('should display a div with many classes', async () => {
    const div = element.all(by.css('div')).get(1);
    expect(await div.getAttribute('class')).toContain('special');
    expect(await div.getAttribute('class')).toContain('clearance');
  });

});
