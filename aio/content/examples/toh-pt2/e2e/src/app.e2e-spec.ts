import { browser, element, by, ElementFinder } from 'protractor';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;
const expectedH2 = 'My Heroes';
const targetHero = { id: 16, name: 'RubberMan' };
const nameSuffix = 'X';

class Hero {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Get hero from s formatted as '<id> <name>'.
  static fromString(s: string): Hero {
    return new Hero(
      +s.substring(0, s.indexOf(' ')),
      s.slice(s.indexOf(' ') + 1),
    );
  }

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

describe('Tutorial part 2', () => {
  beforeAll(() => browser.get(''));
  describe('Initial page', initialPageTests);
  describe('Select hero', selectHeroTests);
  describe('Update hero', updateHeroTests);
});

function initialPageTests() {
  it(`has title '${expectedTitle}'`, async () => {
    expect(await browser.getTitle()).toEqual(expectedTitle);
  });

  it(`has h1 '${expectedH1}'`, async () => {
    await expectHeading(1, expectedH1);
  });

  it(`has h2 '${expectedH2}'`, async () => {
    await expectHeading(2, expectedH2);
  });

  it('has the right number of heroes', async () => {
    const page = getPageElts();
    expect(await page.heroes.count()).toEqual(9);
  });

  it('has no selected hero and no hero details', async () => {
    const page = getPageElts();
    expect(await page.selected.isPresent()).toBeFalsy('selected hero');
    expect(await page.heroDetail.isPresent()).toBeFalsy('no hero detail');
  });
}

function selectHeroTests() {
  it(`selects ${targetHero.name} from hero list`, async () => {
    const hero = element(by.cssContainingText('button span.badge', targetHero.id.toString()));
    await hero.click();
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`has selected ${targetHero.name}`, async () => {
    const page = getPageElts();
    const expectedText = `${targetHero.id} ${targetHero.name}`;
    expect((await page.selected.getText()).replace('\n', ' ')).toBe(expectedText);
  });

  it('shows selected hero details', async () => {
    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
  });
}

function updateHeroTests() {
  it(`can update hero name`, async () => {
    await addToHeroName(nameSuffix);
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`shows updated hero name in details`, async () => {
    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    const newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName.toUpperCase());
  });

  it(`shows updated hero name in list`, async () => {
    const page = getPageElts();
    const hero = Hero.fromString((await page.selected.getText()).replace('\n', ' '));
    const newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });

}

async function addToHeroName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getPageElts() {
  return {
    heroes: element.all(by.css('app-root li button')),
    selected: element(by.css('app-root li button.selected')),
    heroDetail: element(by.css('app-root > div, app-root > app-heroes > div'))
  };
}
