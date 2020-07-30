import { browser, element, by } from 'protractor';

describe('Tour of Heroes', () => {
  beforeEach(() => browser.get('/'));

  it('should display "Tour of Heroes"', () => {
    const title = element(by.css('app-root h1')).getText();
    expect(title).toEqual('Tour of Heroes');
  });
});
