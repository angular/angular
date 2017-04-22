'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Style Guide', function () {
  it('01-01', function () {
    browser.get('#/01-01');

    let pre = element(by.tagName('toh-heroes > pre'));
    expect(pre.getText()).toContain('Bombasto');
    expect(pre.getText()).toContain('Tornado');
    expect(pre.getText()).toContain('Magneta');
  });

  it('02-07', function () {
    browser.get('#/02-07');

    let hero = element(by.tagName('toh-hero > div'));
    let users = element(by.tagName('admin-users > div'));

    expect(hero.getText()).toBe('hero component');
    expect(users.getText()).toBe('users component');
  });

  it('02-08', function () {
    browser.get('#/02-08');

    let input = element(by.tagName('input[tohvalidate]'));
    expect(input.isPresent()).toBe(true);
  });

  it('03-01', function () {
    browser.get('#/03-01');

    let div = element(by.tagName('sg-app > div'));
    expect(div.getText()).toBe('The expected error is 42');
  });

  it('03-02', function () {
    browser.get('#/03-02');

    let divs = element.all(by.tagName('sg-app > div'));
    expect(divs.get(0).getText()).toBe('Heroes url: api/heroes');
    expect(divs.get(1).getText()).toBe('Villains url: api/villains');
  });

  it('03-03', function () {
    browser.get('#/03-03');

    let div = element(by.tagName('sg-app > div'));
    expect(div.getText()).toBe('Our hero is RubberMan and He is so elastic');
  });

  it('03-04', function () {
    browser.get('#/03-04');

    let buttons = element.all(by.tagName('sg-app > button'));
    expect(buttons.get(0).getText()).toBe('Show toast');
    expect(buttons.get(1).getText()).toBe('Hide toast');
  });

  it('03-06', function () {
    browser.get('#/03-06');

    let div = element(by.tagName('sg-app > div'));
    expect(div.getText()).toBe('Actual favorite: Windstorm');

    let lis = element.all(by.tagName('sg-app > ul > li'));
    expect(lis.get(0).getText()).toBe('Windstorm');
    expect(lis.get(1).getText()).toBe('Bombasto');
    expect(lis.get(2).getText()).toBe('Magneta');
    expect(lis.get(3).getText()).toBe('Tornado');
  });

  it('04-10', function () {
    browser.get('#/04-10');

    let div = element(by.tagName('sg-app > toh-heroes > div'));
    expect(div.getText()).toBe('This is heroes component');
  });

  it('05-02', function () {
    browser.get('#/05-02');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('Hero button');
  });

  it('05-03', function () {
    browser.get('#/05-03');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('Hero button');
  });

  it('05-04', function () {
    browser.get('#/05-04');

    let h2 = element(by.tagName('sg-app > toh-heroes > div > h2'));
    expect(h2.getText()).toBe('My Heroes');
  });

  it('05-12', function () {
    browser.get('#/05-12');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });

  it('05-13', function () {
    browser.get('#/05-13');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });

  it('05-14', function () {
    browser.get('#/05-14');

    let toast = element(by.tagName('sg-app > toh-toast'));
    expect(toast.getText()).toBe('...');
  });

  it('05-15', function () {
    browser.get('#/05-15');

    let heroList = element(by.tagName('sg-app > toh-hero-list'));
    expect(heroList.getText()).toBe('...');
  });

  it('05-16', function () {
    browser.get('#/05-16');

    let hero = element(by.tagName('sg-app > toh-hero'));
    expect(hero.getText()).toBe('...');
  });

  it('05-17', function () {
    browser.get('#/05-17');

    let section = element(by.tagName('sg-app > toh-hero-list > section'));
    expect(section.getText()).toContain('Our list of heroes');
    expect(section.getText()).toContain('Total powers');
    expect(section.getText()).toContain('Average power');
  });

  it('06-01', function () {
    browser.get('#/06-01');

    let div = element(by.tagName('sg-app > div[tohhighlight]'));
    expect(div.getText()).toBe('Bombasta');
  });

  it('06-03', function () {
    browser.get('#/06-03');

    let input = element(by.tagName('input[tohvalidator]'));
    expect(input.isPresent()).toBe(true);
  });

  it('07-01', function () {
    browser.get('#/07-01');

    let lis = element.all(by.tagName('sg-app > ul > li'));
    expect(lis.get(0).getText()).toBe('Windstorm');
    expect(lis.get(1).getText()).toBe('Bombasto');
    expect(lis.get(2).getText()).toBe('Magneta');
    expect(lis.get(3).getText()).toBe('Tornado');
  });

  it('07-03', function () {
    browser.get('#/07-03');

    let pre = element(by.tagName('toh-heroes > pre'));
    expect(pre.getText()).toContain('[]');
  });

  it('07-04', function () {
    browser.get('#/07-04');

    let pre = element(by.tagName('toh-app > pre'));
    expect(pre.getText()).toContain('[]');
  });

  it('09-01', function () {
    browser.get('#/09-01');

    let button = element(by.tagName('sg-app > toh-hero-button > button'));
    expect(button.getText()).toBe('OK');
  });
});
