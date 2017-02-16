import {browser, by, element, Key, ExpectedConditions} from 'protractor';
import {screenshot} from '../../screenshot';

describe('checkbox', function () {

  describe('check behavior', function () {

    beforeEach(function() {
      browser.get('/checkbox');
    });

    it('should be checked when clicked, and be unchecked when clicked again', () => {
      let checkboxEl = element(by.id('test-checkbox'));
      let inputEl = element(by.css('input[id=input-test-checkbox]'));

      screenshot('start');
      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
        browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))))
          .then(() => screenshot('checked'));
      });

      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
        browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))))
          .then(() => screenshot('unchecked'));
      });
    });

    it('should toggle the checkbox when pressing space', () => {
      let inputEl = element(by.css('input[id=input-test-checkbox]'));

      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
      });

      inputEl.sendKeys(Key.SPACE);

      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
      });
    });
  });
});
