import { browser, element, by } from 'protractor';

/* tslint:disable:quotemark */
describe('Dynamic Component Loader', () => {

  beforeEach(() => {
    browser.get('');
  });

  it('should load ad banner', () => {
    const headline = element(by.xpath("//h4[text()='Featured Hero Profile']"));
    const name = element(by.xpath("//h3[text()='Bombasto']"));
    const bio = element(by.xpath("//p[text()='Brave as they come']"));

    expect(name).toBeDefined();
    expect(headline).toBeDefined();
    expect(bio).toBeDefined();
  });
});
