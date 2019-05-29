import {browser, by, element, ExpectedConditions} from 'protractor';


describe('radio', () => {
  describe('disabling behavior', () => {
    beforeEach(async () => await browser.get('/radio'));

    it('should be checked when clicked', async () => {
      await element(by.id('water')).click();

      expect(await element(by.id('water')).getAttribute('class')).toContain('mat-radio-checked');

      expect(await element(by.css('input[id=water-input]')).getAttribute('checked')).toBeTruthy();
      expect(await element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeFalsy();

      await element(by.id('leaf')).click();
      expect(await element(by.id('leaf')).getAttribute('class')).toContain('mat-radio-checked');

      expect(await element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeTruthy();
      expect(await element(by.css('input[id=water-input]')).getAttribute('checked')).toBeFalsy();
    });

    it('should be disabled when disable the radio group', async () => {
      await element(by.id('toggle-disable')).click();
      await element(by.id('water')).click();

      expect(await element(by.id('water')).getAttribute('class')).toContain('mat-radio-disabled');

      await browser.wait(ExpectedConditions.presenceOf(element(by.css('.mat-radio-disabled'))));

      expect(await element(by.css('input[id=water-input]')).getAttribute('disabled')).toBeTruthy();

      await element(await by.id('leaf')).click();
      expect(await element(by.id('leaf')).getAttribute('class')).toContain('mat-radio-disabled');

      expect(await element(by.css('input[id=leaf-input]')).getAttribute('disabled')).toBeTruthy();
    });
  });
});
