import { browser, element, by } from 'protractor';

describe('Docs Style Guide', () => {
  const title = 'Authors Style Guide Sample';

  beforeAll(() => {
    browser.get('');
  });

  it('should display correct title: ' + title, () => {
    expect(element(by.css('h1')).getText()).toEqual(title);
  });
});
