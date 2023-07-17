import { browser, element, by } from 'protractor';

describe('Component Overview', () => {

  beforeAll(() => browser.get(''));

  it('should display component overview works ', async () => {
    expect(await element(by.css('p')).getText()).toEqual('component-overview works!');
  });

});
