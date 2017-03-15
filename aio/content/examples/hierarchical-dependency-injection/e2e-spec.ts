'use strict'; // necessary for es6 output in node

import { browser, by, element } from 'protractor';

describe('Hierarchical dependency injection', () => {

  beforeAll(() => {
    browser.get('');
  });

  describe('Heroes Scenario', () => {
    let page = {
      heroName: '',
      income: '',

      // queries
      heroEl: element.all(by.css('heroes-list li')).get(0), // first hero
      heroCardEl: element(by.css('heroes-list hero-tax-return')), // first hero tax-return
      taxReturnNameEl: element.all(by.css('heroes-list hero-tax-return #name')).get(0),
      incomeInputEl: element.all(by.css('heroes-list hero-tax-return input')).get(0),
      cancelButtonEl: element(by.cssContainingText('heroes-list hero-tax-return button', 'Cancel')),
      closeButtonEl: element(by.cssContainingText('heroes-list hero-tax-return button', 'Close')),
      saveButtonEl: element(by.cssContainingText('heroes-list hero-tax-return button', 'Save'))
    };

    it('should list multiple heroes', () => {
      expect(element.all(by.css('heroes-list li')).count()).toBeGreaterThan(1);
    });

    it('should show no hero tax-returns at the start', () => {
      expect(element.all(by.css('heroes-list li hero-tax-return')).count()).toBe(0);
    });

    it('should open first hero in hero-tax-return view after click', () => {
      page.heroEl.getText()
        .then(val => {
          page.heroName = val;
        })
        .then(() => page.heroEl.click())
        .then(() => {
          expect(page.heroCardEl.isDisplayed()).toBe(true);
        });
    });

    it('hero tax-return should have first hero\'s name', () => {
      // Not `page.tax-returnNameInputEl.getAttribute('value')` although later that is essential
      expect(page.taxReturnNameEl.getText()).toEqual(page.heroName);
    });

    it('should be able to cancel change', () => {
      page.incomeInputEl.clear()
        .then(() => page.incomeInputEl.sendKeys('777'))
        .then(() => {
          expect(page.incomeInputEl.getAttribute('value')).toBe('777', 'income should be 777');
          return page.cancelButtonEl.click();
        })
        .then(() => {
          expect(page.incomeInputEl.getAttribute('value')).not.toBe('777', 'income should not be 777');
        });
    });

    it('should be able to save change', () => {
      page.incomeInputEl.clear()
        .then(() => page.incomeInputEl.sendKeys('999'))
        .then(() => {
          expect(page.incomeInputEl.getAttribute('value')).toBe('999', 'income should be 999');
          return page.saveButtonEl.click();
        })
        .then(() => {
          expect(page.incomeInputEl.getAttribute('value')).toBe('999', 'income should still be 999');
        });
    });

    it('should be able to close tax-return', () => {
      page.saveButtonEl.click()
        .then(() => {
          expect(element.all(by.css('heroes-list li hero-tax-return')).count()).toBe(0);
        });
    });

  });

  describe('Villains Scenario', () => {
    it('should list multiple villains', () => {
      expect(element.all(by.css('villains-list li')).count()).toBeGreaterThan(1);
    });
  });

  describe('Cars Scenario', () => {

    it('A-component should use expected services', () => {
      expect(element(by.css('a-car')).getText()).toContain('C1-E1-T1');
    });

    it('B-component should use expected services', () => {
      expect(element(by.css('b-car')).getText()).toContain('C2-E2-T1');
    });

    it('C-component should use expected services', () => {
      expect(element(by.css('c-car')).getText()).toContain('C3-E2-T1');
    });
  });
});
