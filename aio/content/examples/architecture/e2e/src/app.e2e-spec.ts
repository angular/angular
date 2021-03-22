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

  it(`has title '${expectedTitle}'`, async () => {
    expect(await browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h2 '${expectedH2}'`, async () => {
    const h2 = await element.all(by.css('h2')).map((elt: any) => elt.getText());
    expect(h2).toEqual(expectedH2);
  });

  describe('Hero', heroTests);
  describe('Salex tax', salesTaxTests);
});

function heroTests() {

  const targetHero: Hero = { id: 2, name: 'Dr Nice' };

  it('has the right number of heroes', async () => {
    const page = getPageElts();
    expect(await page.heroes.count()).toEqual(3);
  });

  it('has no hero details initially', async () => {
    const page = getPageElts();
    expect(await page.heroDetail.isPresent()).toBeFalsy('no hero detail');
  });

  it('shows selected hero details', async () => {
    await element(by.cssContainingText('li', targetHero.name)).click();
    const page = getPageElts();
    const hero = await heroFromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name);
  });

  it(`shows updated hero name in details`, async () => {
    const input = element.all(by.css('input')).first();
    await input.sendKeys(nameSuffix);
    const page = getPageElts();
    const hero = await heroFromDetail(page.heroDetail);
    const newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });
}

function salesTaxTests() {
  it('has no sales tax initially', async () => {
    const page = getPageElts();
    expect(await page.salesTaxDetail.isPresent()).toBeFalsy('no sales tax info');
  });

  it('shows sales tax', async () => {
    const page = getPageElts();
    await page.salesTaxAmountInput.sendKeys('10', protractor.Key.ENTER);
    expect(await page.salesTaxDetail.getText()).toEqual('The sales tax is $1.00');
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
  const id = await detail.all(by.css('div')).first().getText();
  // Get name from the h2
  const name = await detail.element(by.css('app-hero-detail h2')).getText();
  return {
    id: +id.substr(id.indexOf(' ') + 1),
    name: name.substr(0, name.lastIndexOf(' ')),
  };
}
