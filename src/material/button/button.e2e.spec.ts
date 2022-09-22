import {browser, by, element, ExpectedConditions} from 'protractor';

describe('button', () => {
  describe('disabling behavior', () => {
    beforeEach(async () => await browser.get('/button'));

    it('should prevent click handlers from executing when disabled', async () => {
      await element(by.id('test-button')).click();
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(
        ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element'))),
        ),
      );

      await element(by.id('disable-toggle')).click();
      try {
        // This should throw an error since the button is disabled and cannot be clicked.
        await element(by.id('test-button')).click();
      } catch (e) {
        // No-op: An exception is expected since protractor will fail to find the button
        // to be clickable since it is disabled.
      }
      expect(await element(by.id('click-counter')).getText()).toEqual('1');

      await browser.wait(
        ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element'))),
        ),
      );
    });
  });
});
