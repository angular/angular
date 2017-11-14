import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';


function blurAndScreenshot(msg: string) {
  browser.executeScript(`document.activeElement && document.activeElement.blur();`);
  screenshot(msg);
}


describe('input', () => {
  describe('text input', () => {
    beforeEach(() => browser.get('/input'));

    it('should update input value when user types', async () => {
      let input = element(by.id('text-input'));
      input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('abc123');
    });
  });

  describe('number input', () => {
    beforeEach(() => browser.get('/input'));

    it('should update input value when user types', async () => {
      let input = element(by.id('number-input'));
      input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('123');
    });

    it('should increment when increment button clicked', async () => {
      const input = element(by.id('number-input'));

      input.click();

      const size = await input.getSize();

      browser.actions()
          .mouseMove(input, {x: size.width - 5, y: 5})
          .click()
          .perform();

      expect(await input.getAttribute('value')).toBe('1');

      browser.actions()
          .mouseMove(input, {x: size.width - 5, y: size.height - 5})
          .click()
          .perform();

      expect(await input.getAttribute('value')).toBe('0');
    });
  });

  describe('textarea', () => {
    beforeEach(() => browser.get('/input'));

    it('should update input value when user types', async () => {
      let input = element(by.id('text-area'));
      input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('abc123');
    });
  });

  describe('autosize-textarea', () => {
    beforeEach(() => browser.get('/input'));

    it('should resize correctly', () => {
      let input = element(by.id('autosize-text-area'));
      input.sendKeys('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      blurAndScreenshot('autosize multiple rows');
    });

    it('should enfore max rows', () => {
      let input = element(by.id('autosize-text-area'));
      input.sendKeys(
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      blurAndScreenshot('autosize more than max rows');
    });
  });
});
