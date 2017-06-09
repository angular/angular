import {browser, by, element, ExpectedConditions} from 'protractor';
import {screenshot} from '../screenshot';


describe('radio', () => {
  describe('disabling behavior', () => {
    beforeEach(() => browser.get('/radio'));

    it('should be checked when clicked', async () => {
      element(by.id('water')).click();

      expect(element(by.id('water')).getAttribute('class')).toContain('mat-radio-checked');
      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('water');

      expect(element(by.css('input[id=water-input]')).getAttribute('checked')).toBeTruthy();
      expect(element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeFalsy();

      element(by.id('leaf')).click();
      expect(element(by.id('leaf')).getAttribute('class')).toContain('mat-radio-checked');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('leaf');

      expect(element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeTruthy();
      expect(element(by.css('input[id=water-input]')).getAttribute('checked')).toBeFalsy();
    });

    it('should be disabled when disable the radio group', async () => {
      element(by.id('toggle-disable')).click();
      element(by.id('water')).click();

      expect(element(by.id('water')).getAttribute('class')).toContain('mat-radio-disabled');

      await browser.wait(ExpectedConditions.presenceOf(element(by.css('.mat-radio-disabled'))));
      screenshot('water');

      expect(element(by.css('input[id=water-input]')).getAttribute('disabled')).toBeTruthy();

      element(by.id('leaf')).click();
      expect(element(by.id('leaf')).getAttribute('class')).toContain('mat-radio-disabled');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('leaf');

      expect(element(by.css('input[id=leaf-input]')).getAttribute('disabled')).toBeTruthy();
    });

  });

});
