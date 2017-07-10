import {browser, by, element, ExpectedConditions} from 'protractor';
const EC = ExpectedConditions;

describe('sidenav', () => {
  describe('opening and closing', () => {
    beforeEach(() => browser.get('/sidenav'));

    let input = element(by.tagName('md-sidenav'));


    it('should be closed', () => {
      expect(input.isDisplayed()).toBeFalsy();
    });

    it('should open', () => {
      element(by.buttonText('Open sidenav')).click();
      expect(input.isDisplayed()).toBeTruthy();
    });

    it('should close again', () => {
      element(by.buttonText('Open sidenav')).click();
      element(by.buttonText('Open sidenav')).click();
      browser.wait(EC.presenceOf(element(by.className('mat-sidenav-closed'))), 1000);
      expect(input.isDisplayed()).toBeFalsy();
    });
  });
});
