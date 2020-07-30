import { browser, element, by } from 'protractor';

describe('QuickStart E2E Tests', () => {

  const expectedMsg = 'Hello Angular';

  beforeEach(() => {
    browser.get('');
  });

  it(`should display: ${expectedMsg}`, () => {
    expect(element(by.css('h1')).getText()).toEqual(expectedMsg);
  });

});
