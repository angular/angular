'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;
const targetHero = { id: 15, name: 'Magneta' };
const targetHeroDashboardIndex = 3;
const nameSuffix = 'X';
const newHeroName = targetHero.name + nameSuffix;

class Hero {
    id: number;
    name: string;

    // Factory methods

    // Get hero from s formatted as '<id> <name>'.
    static fromString(s: string): Hero {
        return {
            id: +s.substr(0, s.indexOf(' ')),
            name: s.substr(s.indexOf(' ') + 1),
        };
    }

    // Get hero id and name from the given detail element.
    static async fromDetail(detail: ElementFinder): Promise<Hero> {
        // Get hero id from the first <div>
        let _id = await detail.all(by.css('div')).first().getText();
        // Get name from the h2
        let _name = await detail.element(by.css('h2')).getText();
        return {
            id: +_id.substr(_id.indexOf(' ') + 1),
            name: _name.substr(0, _name.lastIndexOf(' '))
        };
    }
}

describe('Tutorial part 5', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topHeroes: element.all(by.css('app-root app-dashboard > div h4')),

      appHeroesHref: navElts.get(1),
      appHeroes: element(by.css('app-root app-heroes')),
      allHeroes: element.all(by.css('app-root app-heroes li')),
      heroDetail: element(by.css('app-root app-hero-detail > div'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
        expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Heroes'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top heroes', () => {
      let page = getPageElts();
      expect(page.topHeroes.count()).toEqual(4);
    });

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`saves and shows ${newHeroName} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      let targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
      expect(targetHeroElt.getText()).toEqual(newHeroName);
    });

  });

  describe('Heroes tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Heroes view', () => {
      getPageElts().appHeroesHref.click();
      let page = getPageElts();
      expect(page.appHeroes.isPresent()).toBeTruthy();
      expect(page.allHeroes.count()).toEqual(10, 'number of heroes');
    });

    it('can route to hero details', async () => {
      getHeroLiEltById(targetHero.id).click();

      let page = getPageElts();
      expect(page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      let hero = await Hero.fromDetail(page.heroDetail);
      expect(hero.id).toEqual(targetHero.id);
      expect(hero.name).toEqual(targetHero.name.toUpperCase());
    });

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`shows ${newHeroName} in Heroes list`, () => {
      element(by.buttonText('go back')).click();
      let expectedText = `${targetHero.id} ${newHeroName}`;
      expect(getHeroLiEltById(targetHero.id).getText()).toEqual(expectedText);
    });

  });

  async function dashboardSelectTargetHero() {
    let targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
    expect(targetHeroElt.getText()).toEqual(targetHero.name);
    targetHeroElt.click();

    let page = getPageElts();
    expect(page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
    let hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
  }

  async function updateHeroNameInDetailView() {
    // Assumes that the current view is the hero details view.
    addToHeroName(nameSuffix);

    let page = getPageElts();
    let hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newHeroName.toUpperCase());
  }

});

function addToHeroName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getHeroLiEltById(id: number) {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}
