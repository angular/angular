'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `Angular ${expectedH1}`;
const expectedH2 = 'My Heroes';
const targetHero = { id: 16, name: 'RubberMan' };
const nameSuffix = 'X';

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

describe('Tutorial part 2', () => {
  beforeAll(() => browser.get(''));
  describe('Initial page', initialPageTests);
  describe('Select hero', selectHeroTests);
  describe('Update hero', updateHeroTests);
});

function initialPageTests() {
  it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h1 '${expectedH1}'`, () => {
      expectHeading(1, expectedH1);
  });

  it(`has h2 '${expectedH2}'`, () => {
    expectHeading(2, expectedH2);
  });

  it('has the right number of heroes', () => {
    let page = getPageElts();
    expect(page.heroes.count()).toEqual(10);
  });

  it('has no selected hero and no hero details', function () {
    let page = getPageElts();
    expect(page.selected.isPresent()).toBeFalsy('selected hero');
    expect(page.heroDetail.isPresent()).toBeFalsy('no hero detail');
  });
}

function selectHeroTests() {
  it(`selects ${targetHero.name} from hero list`, function () {
    let hero = element(by.cssContainingText('li span.badge', targetHero.id.toString()));
    hero.click();
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`has selected ${targetHero.name}`, function () {
    let page = getPageElts();
    let expectedText = `${targetHero.id} ${targetHero.name}`;
    expect(page.selected.getText()).toBe(expectedText);
  });

  it('shows selected hero details', async () => {
    let page = getPageElts();
    let hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name);
  });
}

function updateHeroTests() {
  it(`can update hero name`, () => {
    addToHeroName(nameSuffix);
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`shows updated hero name in details`, async () => {
    let page = getPageElts();
    let hero = await Hero.fromDetail(page.heroDetail);
    let newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });

  it(`shows updated hero name in list`, async () => {
    let page = getPageElts();
    let hero = Hero.fromString(await page.selected.getText());
    let newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });

}

function addToHeroName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getPageElts() {
  return {
    heroes: element.all(by.css('my-app li')),
    selected: element(by.css('my-app li.selected')),
    heroDetail: element(by.css('my-app > div, my-app > hero-detail > div'))
  };
}
