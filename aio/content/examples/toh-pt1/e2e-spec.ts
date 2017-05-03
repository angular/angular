'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `Angular ${expectedH1}`;

class Hero {
  id: number;
  name: string;

  // Factory method
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

const nameSuffix = 'X';
function addToHeroName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

describe('Tutorial part 1', () => {

  const expectedHero = { id: 1, name: 'Windstorm' };

  beforeAll(() => browser.get(''));

  it(`has title '${expectedTitle}'`, () => {
    expect(browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h1 '${expectedH1}'`, () => {
    let hText = element(by.css('h1')).getText();
    expect(hText).toEqual(expectedH1, 'h1');
  });

  it(`shows initial hero details`, async () => {
    let page = getPageElts();
    let hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(expectedHero.id);
    expect(hero.name).toEqual(expectedHero.name);
  });

  it(`shows updated hero name`, async () => {
    addToHeroName(nameSuffix);
    let page = getPageElts();
    let hero = await Hero.fromDetail(page.heroDetail);
    let newName = expectedHero.name + nameSuffix;
    expect(hero.id).toEqual(expectedHero.id);
    expect(hero.name).toEqual(newName);
  });

});

function getPageElts() {
  return {
    heroDetail: element(by.css('my-app'))
  };
}
