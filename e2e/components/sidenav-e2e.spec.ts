import {browser, by, element, ElementFinder} from 'protractor';

describe('sidenav', () => {
  describe('opening and closing', () => {
    let sidenav: ElementFinder;

    beforeEach(async () => {
      await browser.get('/sidenav');
      sidenav = element(by.tagName('mat-sidenav'));
    });

    it('should be closed', async () => {
      expect(await sidenav.isDisplayed()).toBeFalsy();
    });

    it('should open', async () => {
      await element(by.buttonText('Open sidenav')).click();
      expect(await sidenav.isDisplayed()).toBeTruthy();
    });

    it('should close again', async () => {
      await element(by.buttonText('Open sidenav')).click();
      await browser.sleep(50);
      await element(by.buttonText('Open sidenav')).click();

      expect(await sidenav.isDisplayed()).toBeFalsy();
    });
  });
});
