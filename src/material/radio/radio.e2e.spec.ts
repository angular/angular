import {browser, by, element} from 'protractor';

describe('radio', () => {
  describe('disabling behavior', () => {
    beforeEach(async () => await browser.get('/radio'));

    it('should be checked when clicked', async () => {
      await element(by.id('water')).click();
      expect(await element(by.css('input:checked')).getAttribute('value')).toBe('water');

      await element(by.id('leaf')).click();
      expect(await element(by.css('input:checked')).getAttribute('value')).toBe('leaf');
    });

    it('should be disabled when disable the radio group', async () => {
      await element(by.id('toggle-disable')).click();
      await element(by.id('water')).click();

      expect(await element(by.css('input[id=water-input]')).getAttribute('disabled')).toBe('true');
    });
  });
});
