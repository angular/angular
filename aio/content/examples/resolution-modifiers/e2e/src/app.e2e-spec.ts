import { browser, element, by } from 'protractor';

describe('Resolution-modifiers-example', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('shows basic flower emoji', () => {
    expect(element.all(by.css('p')).get(0).getText()).toContain('🌸');
  });

  it('shows basic leaf emoji', () => {
    expect(element.all(by.css('p')).get(1).getText()).toContain('🌿');
  });

  it('shows yellow flower in host child', () => {
    expect(element.all(by.css('p')).get(9).getText()).toContain('🌼');
  });

});
