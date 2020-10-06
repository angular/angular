import { browser, element, by } from 'protractor';

describe('Component Overview', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should display component overview works ', () => {
    expect(element(by.css('p')).getText()).toEqual('component-overview works!');
  });

});
