import { browser, element, by, ElementFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;
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
        const id = await detail.all(by.css('div')).first().getText();
        // Get name from the h2
        const name = await detail.element(by.css('h2')).getText();
        return {
            id: +id.substr(id.indexOf(' ') + 1),
            name: name.substr(0, name.lastIndexOf(' '))
        };
    }
}

describe('Tutorial part 4', () => {
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
    const page = getPageElts();
    expect(page.heroes.count()).toEqual(10);
  });

  it('has no selected hero and no hero details', () => {
    const page = getPageElts();
    expect(page.selected.isPresent()).toBeFalsy('selected hero');
    expect(page.heroDetail.isPresent()).toBeFalsy('no hero detail');
  });
}

function selectHeroTests() {
  it(`selects ${targetHero.name} from hero list`, () => {
    const hero = element(by.cssContainingText('li span.badge', targetHero.id.toString()));
    hero.click();
    // Nothing specific to expect other than lack of exceptions.
  });

  it(`has selected ${targetHero.name}`, () => {
    const page = getPageElts();
    const expectedText = `${targetHero.id} ${targetHero.name}`;
    expect(page.selected.getText()).toBe(expectedText);
  });

  it('shows selected hero details', async () => {
    const page = getPageElts();
    const message = getMessage();
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
    // Message text contain id number matches the hero.id number
    expect(message.getText()).toContain(hero.id);

  });
}

function updateHeroTests() {
  it(`can update hero name`, () => {
    addToHeroName(nameSuffix);
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
    const hero = Hero.fromString(await page.selected.getText());
    const newName = targetHero.name + nameSuffix;
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newName);
  });

}

function addToHeroName(text: string): promise.Promise<void> {
  const input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    const hTag = `h${hLevel}`;
    const hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
}

function getPageElts() {
  return {
    heroes: element.all(by.css('app-root li')),
    selected: element(by.css('app-root li.selected')),
    heroDetail: element(by.css('app-root > div, app-root > app-heroes > app-hero-detail > div'))
  };
}

function getMessage() {
  const hero = element(by.cssContainingText('li span.badge', targetHero.id.toString()));
  hero.click();
  return element.all(by.css('app-root > app-messages > div > div')).get(1);
}
