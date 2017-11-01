'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';

describe('RxJS', function () {
  let page: any;

  function getPage() {
    return {
      findHrefs: () => element.all(by.css('my-app a')),
      findHeroes: () => element(by.linkText('Heroes')),
      findHeroCounter: () => element(by.linkText('Hero Counter')),

      findMessageLog: () => element(by.css('message-log')),
      findHeroList: () => element(by.css('ul.items')),
      findHeroListItems: () => element.all(by.css('ul.items li')),

      findHeroDetailDivs: () => element.all(by.css('ng-component div div'))
    };
  }

  beforeAll(function () {
    browser.get('');
  });

  beforeEach(() => {
    page = getPage();
  });

  it('should have 10 heroes', async() => {
    const heroes: ElementArrayFinder = page.findHeroListItems();

    expect(await heroes.count()).toBe(10);
  });

  it('should have 1 initial event log items', async() => {
    const log: ElementFinder = page.findMessageLog();
    const logItems: ElementArrayFinder = log.all(by.css('ul li'));

    expect(await logItems.count()).toBe(1);
  });

  xit('should add log entries after leaving hero counter page', async() => {
    const heroCounter: ElementFinder = page.findHeroCounter();
    const heroes: ElementFinder = page.findHeroes();
    const log: ElementFinder = page.findMessageLog();
    const logItems: ElementArrayFinder = log.all(by.css('ul li'));
    await heroCounter.click();
    await heroes.click();

    expect(await logItems.count()).toBe(9);
  });

  it('should display hero details', async () => {
    const hero: ElementFinder = page.findHeroListItems().first().element(by.css('a'));
    const heroDetailDivs = page.findHeroDetailDivs();
    await hero.click();

    expect(await heroDetailDivs.first().getText()).toContain('ID: 1');
    expect(await heroDetailDivs.last().getText()).toContain('Name: Mr. Nice');
  });
});
