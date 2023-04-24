import { browser, element, by, logging } from 'protractor';

describe('first-app-lesson-11 app', () => {

  beforeEach(() => browser.get(''));

  it('should display correct title', async () => {
    expect(await element.all(by.css('.brand-logo')).get(0).getAttribute('src')).toContain('/assets/logo.svg');
  });

  it('should have a filter string input', async () => {
    expect(await element.all(by.css('input')).get(0).getAttribute('placeholder')).toEqual('Filter by city');
    expect(await element.all(by.css('input')).get(0).getAttribute('type')).toEqual('text');
  });

  it('should have a search button', async () => {
    expect(await element.all(by.css('button')).get(0).getText()).toEqual('Search');
  });

  it('should have a housing-location component', async () => {
    expect(await element.all(by.css('.listing > .listing-location')).get(0).getText()).toEqual('Chicago, IL');
  });

  it('should have a title in the housing-location component', async () => {
    expect(await element.all(by.css('.listing > h2')).get(0).getText()).toEqual('Acme Fresh Start Housing');
  });

  it('should have 10 housing-location components', async () => {
    expect(await element.all(by.css('app-housing-location'))['length'] === 10);
  });

  it('should have a details page at /details/9', async () => {
    await browser.get('/details/9');
    expect(await element.all(by.css('app-details > article > section > h2')).get(0)
      .getText()).toEqual('Capital Safe Towns');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
