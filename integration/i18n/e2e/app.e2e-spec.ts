import { browser, element, by } from 'protractor';

describe('i18n E2E Tests', function () {
  it('remove i18n attributes', function () {
    browser.get('');
    const div = element(by.css('div'));
    expect(div.getAttribute('title')).not.toBe(null);
    expect(div.getAttribute('i18n')).toBe(null);
  });
});
