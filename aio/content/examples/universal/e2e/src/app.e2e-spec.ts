import { browser, by, element, ElementArrayFinder, ElementFinder, logging } from 'protractor';

class Hero {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Hero from string formatted as '<id> <name>'.
  static fromString(s: string): Hero {
    return new Hero(
      +s.substr(0, s.indexOf(' ')),
      s.substr(s.indexOf(' ') + 1),
    );
  }

  // Hero from hero list <li> element.
  static async fromLi(li: ElementFinder): Promise<Hero> {
    const stringsFromA = await li.all(by.css('a')).getText();
    const strings = stringsFromA[0].split(' ');
    return { id: +strings[0], name: strings[1] };
  }

  // Hero id and name from the given detail element.
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

describe('Universal', () => {
  const expectedH1 = 'Tour of Heroes';
  const expectedTitle = `${expectedH1}`;
  const targetHero = { id: 15, name: 'Magneta' };
  const targetHeroDashboardIndex = 3;
  const nameSuffix = 'X';
  const newHeroName = targetHero.name + nameSuffix;

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const severeLogs = logs.filter(entry => entry.level === logging.Level.SEVERE);
    expect(severeLogs).toEqual([]);
  });

  describe('Initial page', () => {
    beforeAll(() => browser.get(''));

    it(`has title '${expectedTitle}'`, async () => {
      expect(await browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, async () => {
      await expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Heroes'];
    it(`has views ${expectedViewNames}`, async () => {
      const viewNames = await getPageElts().navElts.map(el => el!.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
      const page = getPageElts();
      expect(await page.appDashboard.isPresent()).toBeTruthy();
    });
  });

  describe('Dashboard tests', () => {
    beforeAll(() => browser.get(''));

    it('has top heroes', async () => {
      const page = getPageElts();
      expect(await page.topHeroes.count()).toEqual(4);
    });

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`cancels and shows ${targetHero.name} in Dashboard`, async () => {
      await element(by.buttonText('go back')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
      expect(await targetHeroElt.getText()).toEqual(targetHero.name);
    });

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`saves and shows ${newHeroName} in Dashboard`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
      expect(await targetHeroElt.getText()).toEqual(newHeroName);
    });
  });

  describe('Heroes tests', () => {
    beforeAll(() => browser.get(''));

    it('can switch to Heroes view', async () => {
      await getPageElts().appHeroesHref.click();
      const page = getPageElts();
      expect(await page.appHeroes.isPresent()).toBeTruthy();
      expect(await page.allHeroes.count()).toEqual(10, 'number of heroes');
    });

    it('can route to hero details', async () => {
      await getHeroLiEltById(targetHero.id).click();

      const page = getPageElts();
      expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      const hero = await Hero.fromDetail(page.heroDetail);
      expect(hero.id).toEqual(targetHero.id);
      expect(hero.name).toEqual(targetHero.name.toUpperCase());
    });

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`shows ${newHeroName} in Heroes list`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular();
      const expectedText = `${targetHero.id} ${newHeroName}`;
      expect(await getHeroAEltById(targetHero.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newHeroName} from Heroes list`, async () => {
      const heroesBefore = await toHeroArray(getPageElts().allHeroes);
      const li = getHeroLiEltById(targetHero.id);
      await li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(await page.appHeroes.isPresent()).toBeTruthy();
      expect(await page.allHeroes.count()).toEqual(9, 'number of heroes');
      const heroesAfter = await toHeroArray(page.allHeroes);
      // console.log(await Hero.fromLi(page.allHeroes[0]));
      const expectedHeroes =  heroesBefore.filter(h => h.name !== newHeroName);
      expect(heroesAfter).toEqual(expectedHeroes);
      // expect(await page.selectedHeroSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetHero.name}`, async () => {
      const updatedHeroName = 'Alice';
      const heroesBefore = await toHeroArray(getPageElts().allHeroes);
      const numHeroes = heroesBefore.length;

      await element(by.css('input')).sendKeys(updatedHeroName);
      await element(by.buttonText('add')).click();

      const page = getPageElts();
      const heroesAfter = await toHeroArray(page.allHeroes);
      expect(heroesAfter.length).toEqual(numHeroes + 1, 'number of heroes');

      expect(heroesAfter.slice(0, numHeroes)).toEqual(heroesBefore, 'Old heroes are still there');

      const maxId = heroesBefore[heroesBefore.length - 1].id;
      expect(heroesAfter[numHeroes]).toEqual({id: maxId + 1, name: updatedHeroName});
    });

    it('displays correctly styled buttons', async () => {
      const buttons = await element.all(by.buttonText('x'));

      for (const button of buttons) {
        // Inherited styles from styles.css
        expect(await button.getCssValue('font-family')).toBe('Arial, sans-serif');
        expect(await button.getCssValue('border')).toContain('none');
        expect(await button.getCssValue('padding')).toBe('5px 10px');
        expect(await button.getCssValue('border-radius')).toBe('4px');
        // Styles defined in heroes.component.css
        expect(await button.getCssValue('right')).toBe('0px');
        expect(await button.getCssValue('top')).toBe('0px');
        expect(await button.getCssValue('bottom')).toBe('0px');
      }

      const addButton = element(by.buttonText('add'));
      // Inherited styles from styles.css
      expect(await addButton.getCssValue('font-family')).toBe('Arial, sans-serif');
      expect(await addButton.getCssValue('border')).toContain('none');
      expect(await addButton.getCssValue('padding')).toBe('5px 10px');
      expect(await addButton.getCssValue('border-radius')).toBe('4px');
    });
  });

  describe('Progressive hero search', () => {
    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      await getPageElts().searchBox.sendKeys('Ma');
      await browser.sleep(1000);

      expect(await getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      await getPageElts().searchBox.sendKeys('g');
      await browser.sleep(1000);
      expect(await getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetHero.name}`, async () => {
      await getPageElts().searchBox.sendKeys('n');
      await browser.sleep(1000);
      const page = getPageElts();
      expect(await page.searchResults.count()).toBe(1);
      const hero = page.searchResults.get(0);
      expect(await hero.getText()).toEqual(targetHero.name);
    });

    it(`navigates to ${targetHero.name} details view`, async () => {
      const hero = getPageElts().searchResults.get(0);
      expect(await hero.getText()).toEqual(targetHero.name);
      await hero.click();

      const page = getPageElts();
      expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      const hero2 = await Hero.fromDetail(page.heroDetail);
      expect(hero2.id).toEqual(targetHero.id);
      expect(hero2.name).toEqual(targetHero.name.toUpperCase());
    });
  });

  // Helpers
  async function addToHeroName(text: string): Promise<void> {
    await element(by.css('input')).sendKeys(text);
  }

  async function dashboardSelectTargetHero(): Promise<void> {
    const targetHeroElt = getPageElts().topHeroes.get(targetHeroDashboardIndex);
    expect(await targetHeroElt.getText()).toEqual(targetHero.name);
    await targetHeroElt.click();
    await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    const page = getPageElts();
    expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
  }

  async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
      const hTag = `h${hLevel}`;
      const hText = await element(by.css(hTag)).getText();
      expect(hText).toEqual(expectedText, hTag);
  }

  function getHeroAEltById(id: number): ElementFinder {
    const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
    return spanForId.element(by.xpath('..'));
  }

  function getHeroLiEltById(id: number): ElementFinder {
    const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
    return spanForId.element(by.xpath('../..'));
  }

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
      selectedHeroSubview: element(by.css('app-root app-heroes > div:last-child')),

      heroDetail: element(by.css('app-root app-hero-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  async function toHeroArray(allHeroes: ElementArrayFinder): Promise<Hero[]> {
    return await allHeroes.map(hero => Hero.fromLi(hero!));
  }

  async function updateHeroNameInDetailView(): Promise<void> {
    // Assumes that the current view is the hero details view.
    await addToHeroName(nameSuffix);

    const page = getPageElts();
    const hero = await Hero.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newHeroName.toUpperCase());
  }
});
