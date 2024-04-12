import { browser, element, by } from 'protractor';

describe('Built Template Functions Example', () => {
  beforeAll(() => browser.get(''));

  it('should have title Built-in Template Functions', async () => {
    const title = element.all(by.css('h1')).get(0);
    expect(await title.getText()).toEqual('Built-in Template Functions');
  });

  it('should display $any( ) in h2', async () => {
    const header = element(by.css('h2'));
    expect(await header.getText()).toContain('$any( )');
  });

});
