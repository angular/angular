'use strict'; // necessary for es6 output in node 

import { protractor, browser, element, by, ElementFinder } from 'protractor';

const nameSuffix = 'X';

class Hero {
  id: number;
  name: string;
}

describe('Architecture', () => {

  const expectedTitle = 'Architecture of Angular';
  const expectedH2 = ['Hero List', 'Sales Tax Calculator'];

  beforeAll(() => browser.get(''));

  it(`has title '${expectedTitle}'`, () => {
    expect(browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h2 '${expectedH2}'`, () => {
    let h2 = element.all(by.css('h2')).map((elt: any) => elt.getText());
    expect(h2).toEqual(expectedH2);
  });

  describe('Hero', heroTests);
  describe('Salex tax', salesTaxTests);
});

function heroTests() {

  const targetHero: Hero = { id: 2, name: 'Mr. Nice' };

  it('has the right number of heroes', () => {
    let page = getPageElts();
    expect(page.heroes.count()).toEqual(3);
  });

  it('has no hero details initially', function () {
    let page = getPageElts();
    expect(page.heroDetail.isPresent()).toBeFalsy('no hero detail');
  });

  it('shows selected hero details', async () => {
    await element(by.cssContainingText('li', targetHero.name)).click();
    let page = getPageElts();
    let hero = await heroFromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name);
  });

  it(`shows updated hero name in details`, async () => {
    let input = element.all(by.css('input')).first();
    input.sendKeys(nameSuffix);
    let page = getPageElts();
    let hero = await heroFromDetail(page.heroDetail);
    let newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });
}

function salesTaxTests() {
  it('has no sales tax initially', function () {
    let page = getPageElts();
    expect(page.salesTaxDetail.isPresent()).toBeFalsy('no sales tax info');
  });

  it('shows sales tax', async function () {
    let page = getPageElts();
    page.salesTaxAmountInput.sendKeys('10', protractor.Key.ENTER);
    expect(page.salesTaxDetail.getText()).toEqual('The sales tax is $1.00');
  });
}

// Helper functions

function getPageElts() {
  return {
    heroes: element.all(by.css('my-app li')),
    heroDetail: element(by.css('my-app hero-detail')),
    salesTaxAmountInput: element(by.css('my-app sales-tax input')),
    salesTaxDetail: element(by.css('my-app sales-tax div'))
  };
}

async function heroFromDetail(detail: ElementFinder): Promise<Hero> {
  // Get hero id from the first <div>
  // let _id = await detail.all(by.css('div')).first().getText();
  let _id = await detail.all(by.css('div')).first().getText();
  // Get name from the h2
  // let _name = await detail.element(by.css('h4')).getText();
  let _name = await detail.element(by.css('h4')).getText();
  return {
    id: +_id.substr(_id.indexOf(' ') + 1),
    name: _name.substr(0, _name.lastIndexOf(' '))
  };
}
