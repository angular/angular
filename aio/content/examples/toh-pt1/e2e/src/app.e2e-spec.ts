import { browser, element, by, ElementFinder } from 'protractor';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;

class Hero {
  constructor(public id: number, public name: string) {}

  // Factory method
  // Get hero id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Hero> {
    // Get hero id from the first <div>
    const id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    const name = await detail.element(by.css('h2')).getText();
    return new Hero(
      +id.slice(id.indexOf(' ') + 1),
      name.substring(0, name.lastIndexOf(' '))
    );
  }
}

const nameSuffix = 'X';
async function addToHeroName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

describe('Tutorial part 1', () => {

  const expectedHero = { id: 1, name: 'Windstorm' };

  beforeAll(() => browser.get(''));

  it(`has title '${expectedTitle}'`, async () => {
    expect(await browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h1 '${expectedH1}'`, async () => {
    const hText = await element(by.css('h1')).getText();
    expect(hText).toEqual(expectedH1, 'h1');
  });

  it(`shows initial hero details`, async () => {
    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(expectedHero.id);
    expect(hero.name).toEqual(expectedHero.name.toUpperCase());
  });

  it(`shows updated hero name`, async () => {
    await addToHeroName(nameSuffix);
    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    const newName = expectedHero.name + nameSuffix;
    expect(hero.id).toEqual(expectedHero.id);
    expect(hero.name).toEqual(newName.toUpperCase());
  });

});

function getPageElts() {
  return {
    heroDetail: element(by.css('app-root'))
  };
}
