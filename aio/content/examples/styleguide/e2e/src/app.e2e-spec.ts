import { browser, element, by } from 'protractor';

describe('Style Guide', () => {
  it('01-01', async () => {
    await browser.get('#/01-01');

    const pre = element(by.tagName('toh-heroes > pre'));
    expect(await pre.getText()).toContain('Bombasto');
    expect(await pre.getText()).toContain('Tornado');
    expect(await pre.getText()).toContain('Magneta');
  });

  it('02-07', async () => {
    await browser.get('#/02-07');

    const hero = element(by.tagName('toh-hero > div'));
    const users = element(by.tagName('admin-users > div'));

    expect(await hero.getText()).toBe('hero component');
    expect(await users.getText()).toBe('users component');
  });

  it('02-08', async () => {
    await browser.get('#/02-08');

    const input = element(by.tagName('input[tohvalidate]'));
    expect(await input.isPresent()).toBe(true);
  });

  it('04-10', async () => {
    await browser.get('#/04-10');

    const div = element(by.tagName('sg-app > toh-heroes > div'));
    expect(await div.getText()).toBe('This is heroes component');
  });

  it('05-02', async () => {
    await browser.get('#/05-02');

    const button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(await button.getText()).toBe('Hero button');
  });

  it('05-03', async () => {
    await browser.get('#/05-03');

    const button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(await button.getText()).toBe('Hero button');
  });

  it('05-04', async () => {
    await browser.get('#/05-04');

    const h2 = element(by.tagName('sg-app > toh-heroes > div > h2'));
    expect(await h2.getText()).toBe('My Heroes');
  });

  it('05-12', async () => {
    await browser.get('#/05-12');

    const button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(await button.getText()).toBe('OK');
  });

  it('05-13', async () => {
    await browser.get('#/05-13');

    const button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(await button.getText()).toBe('OK');
  });

  it('05-14', async () => {
    await browser.get('#/05-14');

    const toast = element(by.tagName('sg-app > toh-toast'));
    expect(await toast.getText()).toBe('...');
  });

  it('05-15', async () => {
    await browser.get('#/05-15');

    const heroList = element(by.tagName('sg-app > toh-hero-list'));
    expect(await heroList.getText()).toBe('...');
  });

  it('05-16', async () => {
    await browser.get('#/05-16');

    const hero = element(by.tagName('sg-app > toh-hero'));
    expect(await hero.getText()).toBe('...');
  });

  it('05-17', async () => {
    await browser.get('#/05-17');

    const section = element(by.tagName('sg-app > toh-hero-list > section'));
    expect(await section.getText()).toContain('Our list of heroes');
    expect(await section.getText()).toContain('Total powers');
    expect(await section.getText()).toContain('Average power');
  });

  it('06-01', async () => {
    await browser.get('#/06-01');

    const div = element(by.tagName('sg-app > div[tohhighlight]'));
    expect(await div.getText()).toBe('Bombasta');
  });

  it('06-03', async () => {
    await browser.get('#/06-03');

    const input = element(by.tagName('input[tohvalidator]'));
    expect(await input.isPresent()).toBe(true);
  });

  // temporarily disabled because of a weird issue when used with rxjs v6 with rxjs-compat
  xit('07-01', async () => {
    await browser.get('#/07-01');

    const lis = element.all(by.tagName('sg-app > ul > li'));
    expect(await lis.get(0).getText()).toBe('Windstorm');
    expect(await lis.get(1).getText()).toBe('Bombasto');
    expect(await lis.get(2).getText()).toBe('Magneta');
    expect(await lis.get(3).getText()).toBe('Tornado');
  });

  it('07-04', async () => {
    await browser.get('#/07-04');

    const pre = element(by.tagName('toh-app > pre'));
    expect(await pre.getText()).toContain('[]');
  });

  it('09-01', async () => {
    await browser.get('#/09-01');

    const button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(await button.getText()).toBe('OK');
  });
});
