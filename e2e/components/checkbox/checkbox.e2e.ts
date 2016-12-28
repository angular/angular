import {browser, by, element, Key} from 'protractor';

describe('checkbox', function () {

  describe('check behavior', function () {

    beforeEach(function() {
      browser.get('/checkbox');
    });

    it('should be checked when clicked, and be unchecked when clicked again', () => {
      let checkboxEl = element(by.id('test-checkbox'));
      let inputEl = element(by.css('input[id=input-test-checkbox]'));

      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
      });

      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
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
