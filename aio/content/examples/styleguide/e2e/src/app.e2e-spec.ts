import { browser, element, by } from 'protractor';

describe('Style Guide', () => {
  it('01-01', () => {
    browser.get('#/01-01');

    let pre = element(by.tagName('toh-heroes > pre'));
    expect(pre.getText()).toContain('Bombasto');
    expect(pre.getText()).toContain('Tornado');
    expect(pre.getText()).toContain('Magneta');
  });

  it('02-07', () => {
    browser.get('#/02-07');

    let hero = element(by.tagName('toh-hero > div'));
    let users = element(by.tagName('admin-users > div'));

    expect(hero.getText()).toBe('hero component');
    expect(users.getText()).toBe('users component');
  });

  it('02-08', () => {
    browser.get('#/02-08');

    let input = element(by.tagName('input[tohvalidate]'));
    expect(input.isPresent()).toBe(true);
  });

  it('04-10', () => {
    browser.get('#/04-10');

    let div = element(by.tagName('sg-app > toh-heroes > div'));
    expect(div.getText()).toBe('This is heroes component');
  });

  it('05-02', () => {
    browser.get('#/05-02');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('Hero button');
  });

  it('05-03', () => {
    browser.get('#/05-03');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('Hero button');
  });

  it('05-04', () => {
    browser.get('#/05-04');

    let h2 = element(by.tagName('sg-app > toh-heroes > div > h2'));
    expect(h2.getText()).toBe('My Heroes');
  });

  it('05-12', () => {
    browser.get('#/05-12');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });

  it('05-13', () => {
    browser.get('#/05-13');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });

  it('05-14', () => {
    browser.get('#/05-14');

    let toast = element(by.tagName('sg-app > toh-toast'));
    expect(toast.getText()).toBe('...');
  });

  it('05-15', () => {
    browser.get('#/05-15');

    let heroList = element(by.tagName('sg-app > toh-hero-list'));
    expect(heroList.getText()).toBe('...');
  });

  it('05-16', () => {
    browser.get('#/05-16');

    let hero = element(by.tagName('sg-app > toh-hero'));
    expect(hero.getText()).toBe('...');
  });

  it('05-17', () => {
    browser.get('#/05-17');

    let section = element(by.tagName('sg-app > toh-hero-list > section'));
    expect(section.getText()).toContain('Our list of heroes');
    expect(section.getText()).toContain('Total powers');
    expect(section.getText()).toContain('Average power');
  });

  it('06-01', () => {
    browser.get('#/06-01');

    let div = element(by.tagName('sg-app > div[tohhighlight]'));
    expect(div.getText()).toBe('Bombasta');
  });

  it('06-03', () => {
    browser.get('#/06-03');

    let input = element(by.tagName('input[tohvalidator]'));
    expect(input.isPresent()).toBe(true);
  });

  // temporarily disabled because of a weird issue when used with rxjs v6 with rxjs-compat
  xit('07-01', () => {
    browser.get('#/07-01');

    let lis = element.all(by.tagName('sg-app > ul > li'));
    expect(lis.get(0).getText()).toBe('Windstorm');
    expect(lis.get(1).getText()).toBe('Bombasto');
    expect(lis.get(2).getText()).toBe('Magneta');
    expect(lis.get(3).getText()).toBe('Tornado');
  });

  it('07-03', () => {
    browser.get('#/07-03');

    let pre = element(by.tagName('toh-heroes > pre'));
    expect(pre.getText()).toContain('[]');
  });

  it('07-04', () => {
    browser.get('#/07-04');

    let pre = element(by.tagName('toh-app > pre'));
    expect(pre.getText()).toContain('[]');
  });

  it('09-01', () => {
    browser.get('#/09-01');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });
});
