import {browser, by, element, Key, ExpectedConditions} from 'protractor';

describe('checkbox', () => {

  describe('check behavior', () => {
    beforeEach(() => browser.get('/checkbox'));

    it('should be checked when clicked, and unchecked when clicked again', async () => {
      let checkboxEl = element(by.id('test-checkbox'));
      let inputEl = element(by.css('input[id=test-checkbox-input]'));

      checkboxEl.click();

      expect(inputEl.getAttribute('checked'))
          .toBeTruthy('Expect checkbox "checked" property to be true');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));

      checkboxEl.click();

      expect(inputEl.getAttribute('checked'))
          .toBeFalsy('Expect checkbox "checked" property to be false');

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
    });

    it('should toggle the checkbox when pressing space', () => {
      let inputEl = element(by.css('input[id=test-checkbox-input]'));

      expect(inputEl.getAttribute('checked'))
          .toBeFalsy('Expect checkbox "checked" property to be false');
      inputEl.sendKeys(Key.SPACE);

      expect(inputEl.getAttribute('checked'))
          .toBeTruthy('Expect checkbox "checked" property to be true');
    });
  });
});
