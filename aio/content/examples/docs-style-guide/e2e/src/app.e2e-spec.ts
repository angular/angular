import { browser, element, by } from 'protractor';

describe('Docs Style Guide', () => {
  let _title = 'Authors Style Guide Sample';

  beforeAll(() => {
    browser.get('');
  });

  it('should display correct title: ' + _title, () => {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });
});
