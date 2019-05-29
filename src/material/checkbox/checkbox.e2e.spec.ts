import {browser, by, element, Key} from 'protractor';

describe('checkbox', () => {

  describe('check behavior', () => {
    beforeEach(async () => await browser.get('/checkbox'));

    it('should be checked when clicked, and unchecked when clicked again', async () => {
      const checkboxEl = element(by.id('test-checkbox'));
      const inputEl = element(by.css('input[id=test-checkbox-input]'));

      await checkboxEl.click();

      expect(await inputEl.getAttribute('checked'))
          .toBeTruthy('Expect checkbox "checked" property to be true');

      await checkboxEl.click();

      expect(await inputEl.getAttribute('checked'))
          .toBeFalsy('Expect checkbox "checked" property to be false');
    });

    it('should toggle the checkbox when pressing space', async () => {
      const inputEl = element(by.css('input[id=test-checkbox-input]'));

      expect(await inputEl.getAttribute('checked'))
          .toBeFalsy('Expect checkbox "checked" property to be false');
      await inputEl.sendKeys(Key.SPACE);

      expect(await inputEl.getAttribute('checked'))
          .toBeTruthy('Expect checkbox "checked" property to be true');
    });
  });
});
