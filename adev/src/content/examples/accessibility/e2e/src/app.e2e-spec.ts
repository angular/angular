import {browser, element, by} from 'protractor';

describe('Accessibility example e2e tests', () => {
  beforeEach(() => browser.get(''));

  it('should display Accessibility Example', async () => {
    expect(await element(by.css('h1')).getText()).toEqual('Accessibility Example');
  });

  it('should take a number and change progressbar width', async () => {
    await element(by.css('input')).sendKeys('16');
    expect(await element(by.css('input')).getAttribute('value')).toEqual('16');
    expect(await element(by.css('app-example-progressbar div')).getCssValue('width')).toBe('48px');
  });
});
