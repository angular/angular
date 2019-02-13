import { browser, element, by } from 'protractor';

describe('Resolution-modifiers-example', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('shows basic flower emoji', function() {
    expect(element.all(by.css('p')).get(0).getText()).toContain('🌸');
  });

  it('shows basic leaf emoji', function() {
    expect(element.all(by.css('p')).get(1).getText()).toContain('🌿');
  });

  it('shows yellow flower in host child', function() {
    expect(element.all(by.css('p')).get(9).getText()).toContain('🌼');
  });

});
