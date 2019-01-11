import {browser, by, element, ExpectedConditions} from 'protractor';

describe('button', () => {

  describe('disabling behavior', () => {

    beforeEach(async () => await browser.get('/button'));

    it('should prevent click handlers from executing when disabled', async () => {
      await element(by.id('test-button')).click();
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));

      await element(by.id('disable-toggle')).click();
      await element(by.id('test-button')).click();
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
    });
  });
});
