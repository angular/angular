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
        const id = await detail.all(by.css('div')).first().getText();
        // Get name from the h2
        const name = await detail.element(by.css('h2')).getText();
        return {
            id: +id.substr(id.indexOf(' ') + 1),
            name: name.substr(0, name.lastIndexOf(' '))
        };
    }
}

describe('Tutorial part 5', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    const navElts = element.all(by.css('app-root nav a'));

    return {
      navElts,

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
      const viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      const page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top heroes', () => {
      const page = getPageElts();
      expect(page.topHeroes.count()).toEqual(4);
    });

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`saves and shows ${newHeroName} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      const targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
      expect(targetHeroElt.getText()).toEqual(newHeroName);
    });

  });

  describe('Heroes tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Heroes view', () => {
      getPageElts().appHeroesHref.click();
      const page = getPageElts();
      expect(page.appHeroes.isPresent()).toBeTruthy();
      expect(page.allHeroes.count()).toEqual(10, 'number of heroes');
    });

    it('can route to hero details', async () => {
      getHeroLiEltById(targetHero.id).click();

      const page = getPageElts();
      expect(page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      const hero = await Hero.fromDetail(page.heroDetail);
      expect(hero.id).toEqual(targetHero.id);
      expect(hero.name).toEqual(targetHero.name.toUpperCase());
    });

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`shows ${newHeroName} in Heroes list`, () => {
      element(by.buttonText('go back')).click();
      const expectedText = `${targetHero.id} ${newHeroName}`;
      expect(getHeroLiEltById(targetHero.id).getText()).toEqual(expectedText);
    });

  });

  async function dashboardSelectTargetHero() {
    const targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
    expect(targetHeroElt.getText()).toEqual(targetHero.name);
    targetHeroElt.click();

    const page = getPageElts();
    expect(page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
  }

  async function updateHeroNameInDetailView() {
    // Assumes that the current view is the hero details view.
    addToHeroName(nameSuffix);

    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newHeroName.toUpperCase());
  }

});

function addToHeroName(text: string): promise.Promise<void> {
  const input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    const hTag = `h${hLevel}`;
    const hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
}

function getHeroLiEltById(id: number) {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}
