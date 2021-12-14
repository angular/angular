import { browser, element, by, ElementFinder } from 'protractor';

describe('Dependency Injection Cookbook', () => {

    beforeAll(() => browser.get(''));

    it('should render Logged in User example', async () => {
      const loggedInUser = element(by.cssContainingText('h3', 'Logged in user'));
      expect(await loggedInUser.isPresent()).toBe(true);
    });

    it('"Bombasto" should be the logged in user', async () => {
      const loggedInUser = element(by.cssContainingText('div', 'Name: Bombasto'));
      expect(await loggedInUser.isPresent()).toBe(true);
    });

    it('should render sorted heroes', async () => {
      const sortedHeroes = element(by.cssContainingText('h3', 'Sorted Heroes'));
      expect(await sortedHeroes.isPresent()).toBe(true);

      const sortedHeroElems = element.all(by.css('app-sorted-heroes div'));
      const sortedHeroNames = await sortedHeroElems.map(elem => elem?.getText());
      expect(sortedHeroNames).toEqual(['Dr Nice', 'Magma', 'RubberMan']);
    });

    it('should render Hero of the Month', async () => {
      const heroOfTheMonth = element(by.cssContainingText('h3', 'Hero of the Month'));
      expect(await heroOfTheMonth.isPresent()).toBe(true);
    });

    it('should render Hero Bios', async () => {
      const heroBios = element(by.cssContainingText('h3', 'Hero Bios'));
      expect(await heroBios.isPresent()).toBe(true);
    });

    it("should render Magma's description in Hero Bios", async () => {
      const magmaBioElem = element.all(by.css('app-hero-bio')).get(1);
      const magmaNameElem = magmaBioElem.element(by.css('h4'));
      const magmaDescElem = magmaBioElem.element(by.css('textarea'));

      expect(await magmaNameElem.getText()).toBe('Magma');
      expect(await magmaDescElem.getAttribute('value')).toBe('Hero of all trades');
    });

    it("should render Magma's phone in Hero Bios and Contacts", async () => {
      const magmaPhone = element(by.cssContainingText('div', 'Phone #: 555-555-5555'));
      expect(await magmaPhone.isPresent()).toBe(true);
    });

    it('should render Hero-of-the-Month runner-ups', async () => {
      const runnersUp = await element(by.id('rups1')).getText();
      expect(runnersUp).toContain('RubberMan, Dr Nice');
    });

    it('should render DateLogger log entry in Hero-of-the-Month', async () => {
      const logs = await element.all(by.id('logs')).get(0).getText();
      expect(logs).toContain('INFO: starting up at');
    });

    it('should highlight Hero Bios and Contacts container when mouseover', async () => {
      const target = element(by.css('div[appHighlight="yellow"]'));
      const yellow = 'rgba(255, 255, 0, 1)';

      expect(await target.getCssValue('background-color')).not.toEqual(yellow);

      await browser.actions().mouseMove(target).perform();

      // Wait for up to 2s for the background color to be updated,
      // to account for slow environments (e.g. CI).
      await browser.wait(async () => await target.getCssValue('background-color') === yellow, 2000);
    });

    describe('in Parent Finder', () => {
      const cathy1 = element(by.css('alex cathy'));
      const craig1 = element(by.css('alex craig'));
      const carol1 = element(by.css('alex carol p'));
      const carol2 = element(by.css('barry carol p'));

      it('"Cathy" should find "Alex" via the component class', async () => {
        expect(await cathy1.getText()).toContain('Found Alex via the component');
      });

      it('"Craig" should not find "Alex" via the base class', async () => {
        expect(await craig1.getText()).toContain('Did not find Alex via the base');
      });

      it('"Carol" within "Alex" should have "Alex" parent', async () => {
        expect(await carol1.getText()).toContain('Alex');
      });

      it('"Carol" within "Barry" should have "Barry" parent', async () => {
        expect(await carol2.getText()).toContain('Barry');
      });
    });
});
