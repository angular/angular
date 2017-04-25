import {browser, by, element} from 'protractor';


describe('input', () => {
  describe('text input', () => {
    beforeEach(() => browser.get('/input'));

    it('should update input value when user types', () => {
      let input = element(by.id('text-input'));
      input.sendKeys('abc123');
      expect(input.getAttribute('value')).toBe('abc123');
    });
  });

  describe('number input', () => {
    beforeEach(() => browser.get('/input'));

    it('should update input value when user types', () => {
      let input = element(by.id('number-input'));
      input.sendKeys('abc123');
      expect(input.getAttribute('value')).toBe('123');
    });

    it('should increment when increment button clicked', () => {
      let input = element(by.id('number-input'));
      input.click();
      input.getSize().then((size) => {
        browser.actions()
            .mouseMove(input, {x: size.width - 5, y: 5})
            .click()
            .perform();

        expect(input.getAttribute('value')).toBe('1');

        browser.actions()
            .mouseMove(input, {x: size.width - 5, y: size.height - 5})
            .click()
            .perform();

        expect(input.getAttribute('value')).toBe('0');
      });
    });
  });
});
