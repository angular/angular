import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Providers and ViewProviders', function () {


  beforeEach(() => {
    browser.get('');
  });

  it('shows basic flower emoji', function() {
    expect(element.all(by.css('p')).get(0).getText()).toContain('🌺');
  });

  it('shows whale emoji', function() {
    expect(element.all(by.css('p')).get(1).getText()).toContain('🐳');
  });

  it('shows sunflower from FlowerService', function() {
    expect(element.all(by.css('p')).get(8).getText()).toContain('🌻');
  });

});

