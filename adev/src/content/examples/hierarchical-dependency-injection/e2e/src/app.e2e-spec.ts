import { browser, by, element } from 'protractor';

describe('Hierarchical dependency injection', () => {

  beforeAll(() => browser.get(''));

  describe('Heroes Scenario', () => {
    const page = {
      heroName: '',
      income: '',

      // queries
      heroEl: element.all(by.css('app-heroes-list li button')).get(0), // first hero
      heroCardEl: element(by.css('app-heroes-list app-hero-tax-return')), // first hero tax-return
      taxReturnNameEl: element.all(by.css('app-heroes-list app-hero-tax-return #name')).get(0),
      incomeInputEl: element.all(by.css('app-heroes-list app-hero-tax-return input')).get(0),
      cancelButtonEl: element(by.cssContainingText('app-heroes-list app-hero-tax-return button', 'Cancel')),
      closeButtonEl: element(by.cssContainingText('app-heroes-list app-hero-tax-return button', 'Close')),
      saveButtonEl: element(by.cssContainingText('app-heroes-list app-hero-tax-return button', 'Save'))
    };

    it('should list multiple heroes', async () => {
      expect(await element.all(by.css('app-heroes-list li')).count()).toBeGreaterThan(1);
    });

    it('should show no hero tax-returns at the start', async () => {
      expect(await element.all(by.css('app-heroes-list li app-hero-tax-return')).count()).toBe(0);
    });

    it('should open first hero in app-hero-tax-return view after click', async () => {
      page.heroName = await page.heroEl.getText();
      await page.heroEl.click();
      expect(await page.heroCardEl.isDisplayed()).toBe(true);
    });

    it("hero tax-return should have first hero's name", async () => {
      // Not `page.tax-returnNameInputEl.getAttribute('value')` although later that is essential
      expect(await page.taxReturnNameEl.getText()).toEqual(page.heroName);
    });

    it('should be able to cancel change', async () => {
      await page.incomeInputEl.clear();
      await page.incomeInputEl.sendKeys('777');
      expect(await page.incomeInputEl.getAttribute('value')).toBe('777', 'income should be 777');

      await page.cancelButtonEl.click();
      expect(await page.incomeInputEl.getAttribute('value')).not.toBe('777', 'income should not be 777');
    });

    it('should be able to save change', async () => {
      await page.incomeInputEl.clear();
      await page.incomeInputEl.sendKeys('999');
      expect(await page.incomeInputEl.getAttribute('value')).toBe('999', 'income should be 999');

      await page.saveButtonEl.click();
      expect(await page.incomeInputEl.getAttribute('value')).toBe('999', 'income should still be 999');
    });

    it('should be able to close tax-return', async () => {
      await page.saveButtonEl.click();
      expect(await element.all(by.css('app-heroes-list li app-hero-tax-return')).count()).toBe(0);
    });

  });

  describe('Villains Scenario', () => {
    it('should list multiple villains', async () => {
      expect(await element.all(by.css('app-villains-list li')).count()).toBeGreaterThan(1);
    });
  });

  describe('Cars Scenario', () => {

    it('A-component should use expected services', async () => {
      expect(await element(by.css('a-car')).getText()).toContain('C1-E1-T1');
    });

    it('B-component should use expected services', async () => {
      expect(await element(by.css('b-car')).getText()).toContain('C2-E2-T1');
    });

    it('C-component should use expected services', async () => {
      expect(await element(by.css('c-car')).getText()).toContain('C3-E2-T1');
    });
  });
});
