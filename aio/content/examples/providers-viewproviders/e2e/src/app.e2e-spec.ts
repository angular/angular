import { browser, element, by } from 'protractor';

describe('Providers and ViewProviders', () => {

  beforeEach(() => browser.get(''));

  it('shows basic flower emoji', async () => {
    expect(await element.all(by.css('p')).get(0).getText()).toContain('🌺');
  });

  it('shows whale emoji', async () => {
    expect(await element.all(by.css('p')).get(1).getText()).toContain('🐳');
  });

  it('shows sunflower from FlowerService', async () => {
    expect(await element.all(by.css('p')).get(8).getText()).toContain('🌻');
  });

});
