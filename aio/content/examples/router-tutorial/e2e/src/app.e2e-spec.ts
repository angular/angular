import { browser, element, by } from 'protractor';

describe('Router basic tutorial e2e tests', () => {

  beforeEach(() => browser.get(''));

  it('should display Angular Router Sample', async () => {
    expect(await element(by.css('h1')).getText()).toBe('Angular Router Sample');
  });

  it('should display Crisis Center button', async () => {
    expect(await element.all(by.css('a')).get(0).getText()).toBe('Crisis Center');
  });

  it('should display Heroes button', async () => {
    expect(await element.all(by.css('a')).get(1).getText()).toBe('Heroes');
  });

  it('should display HEROES', async () => {
    expect(await element(by.css('h3')).getText()).toBe('HEROES');
  });

  it('should change to display crisis list component', async () => {
    const crisisButton = element.all(by.css('a')).get(0);
    await crisisButton.click();
    expect(await element(by.css('h3')).getText()).toBe('CRISIS CENTER');
  });

  it('should change to display heroes component', async () => {
    const heroesButton = element.all(by.css('a')).get(1);
    await heroesButton.click();
    expect(await element(by.css('h3')).getText()).toBe('HEROES');
  });

  it('should use wildcard route', async () => {
    await browser.get('/fake-page');
    expect(await browser.getCurrentUrl()).toContain('fake-page');
    expect(await element(by.css('h2')).getText()).toBe('Page Not Found');
  });
});
