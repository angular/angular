import {browser, by, element, ExpectedConditions} from 'protractor';
import {screenshot} from '../screenshot';


describe('button', () => {
  describe('disabling behavior', () => {
    beforeEach(() => browser.get('/button'));

    it('should prevent click handlers from executing when disabled', async () => {
      element(by.id('test-button')).click();
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('clicked once');

      element(by.id('disable-toggle')).click();
      element(by.id('test-button')).click();
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('click disabled');
    });
  });
});
