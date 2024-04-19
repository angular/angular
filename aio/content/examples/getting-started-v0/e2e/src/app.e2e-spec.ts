import { browser, element, by } from 'protractor';

describe('Getting Started V0', () => {
  beforeEach(() => browser.get('/'));

  it('should display "My Store" in the top bar', async () => {
    const title = await element(by.css('app-root app-top-bar h1')).getText();

    expect(title).toEqual('My Store');
  });

  it('should display "Products" on the homepage', async () => {
    const title = await element(by.css('app-root app-product-list h2')).getText();

    expect(title).toEqual('Products');
  });
});
