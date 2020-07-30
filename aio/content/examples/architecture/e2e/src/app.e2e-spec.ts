import { protractor, browser, element, by, ElementFinder } from 'protractor';

const nameSuffix = 'X';

interface Hero {
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

  const targetHero: Hero = { id: 2, name: 'Dr Nice' };

  it('has the right number of heroes', () => {
    let page = getPageElts();
    expect(page.heroes.count()).toEqual(3);
  });

  it('has no hero details initially', () => {
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
  it('has no sales tax initially', () => {
    let page = getPageElts();
    expect(page.salesTaxDetail.isPresent()).toBeFalsy('no sales tax info');
  });

  it('shows sales tax', async () => {
    let page = getPageElts();
    page.salesTaxAmountInput.sendKeys('10', protractor.Key.ENTER);
    expect(page.salesTaxDetail.getText()).toEqual('The sales tax is $1.00');
  });
}

// Helper functions

function getPageElts() {
  return {
    heroes: element.all(by.css('app-root li')),
    heroDetail: element(by.css('app-root app-hero-detail')),
    salesTaxAmountInput: element(by.css('app-root app-sales-tax input')),
    salesTaxDetail: element(by.css('app-root app-sales-tax div'))
  };
}

async function heroFromDetail(detail: ElementFinder): Promise<Hero> {
  // Get hero id from the first <div>
  let id = await detail.all(by.css('div')).first().getText();
  // Get name from the h2
  let name = await detail.element(by.css('h4')).getText();
  return {
    id: +id.substr(id.indexOf(' ') + 1),
    name: name.substr(0, name.lastIndexOf(' ')),
  };
}
