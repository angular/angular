import {browser, by, element} from 'protractor';

describe('input', () => {

  beforeEach(async () => await browser.get('/input'));

  describe('text input', () => {

    it('should update input value when user types', async () => {
      const input = element(by.id('text-input'));
      await input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('abc123');
    });
  });

  describe('number input', () => {

    it('should update input value when user types', async () => {
      const input = element(by.id('number-input'));
      await input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('123');
    });

    it('should increment when increment button clicked', async () => {
      const input = element(by.id('number-input'));
      await input.click();

      const size = await input.getSize();

      await browser.actions()
        .mouseMove(input, {x: size.width - 5, y: 5})
        .perform();
      // Workaround: https://github.com/angular/protractor/issues/4578
      await browser.actions().click().perform();

      expect(await input.getAttribute('value')).toBe('1');

      await browser.actions()
          .mouseMove(input, {x: size.width - 5, y: size.height - 5})
          .perform();
      // Workaround: https://github.com/angular/protractor/issues/4578
      await browser.actions().click().perform();

      expect(await input.getAttribute('value')).toBe('0');
    });
  });

  describe('textarea', () => {

    it('should update input value when user types', async () => {
      const input = element(by.id('text-area'));
      await input.sendKeys('abc123');
      expect(await input.getAttribute('value')).toBe('abc123');
    });
  });

  describe('autosize-textarea', () => {

    it('should resize correctly', async () => {
      const input = element(by.id('autosize-text-area'));
      await input.sendKeys('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    });

    it('should enfore max rows', async () => {
      const input = element(by.id('autosize-text-area'));
      await input.sendKeys(
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    });
  });
});
