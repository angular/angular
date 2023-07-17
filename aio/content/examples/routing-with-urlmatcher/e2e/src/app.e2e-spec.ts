import { browser, element, by } from 'protractor';

describe('Routing with Custom Matching', () => {

  beforeAll(() => browser.get(''));

  it('should display Routing with Custom Matching ', async () => {
    expect(await element(by.css('h2')).getText()).toEqual('Routing with Custom Matching');
  });

});
