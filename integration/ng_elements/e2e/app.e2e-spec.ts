import {browser, by, element, ElementFinder, ExpectedConditions as EC} from 'protractor';

browser.waitForAngularEnabled(false);
describe('Element E2E Tests', function () {
  describe('Hello World Elements', () => {
    beforeEach(() => browser.get('hello-world.html'));

    describe('(with default CD strategy and view encapsulation)', () => {
      const helloWorldEl = element(by.css('hello-world-el'));

      it('should display "Hello World!"', function () {
        expect(helloWorldEl.getText()).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', function () {
        const input = element(by.css('input[type=text]'));
        input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        browser.wait(EC.textToBePresentInElement(helloWorldEl, 'Hello Foo!'), 5000);
      });
    });

    describe('(with `OnPush` CD strategy)', () => {
      const helloWorldOnpushEl = element(by.css('hello-world-onpush-el'));

      it('should display "Hello World!"', function () {
        expect(helloWorldOnpushEl.getText()).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', function () {
        const input = element(by.css('input[type=text]'));
        input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        browser.wait(EC.textToBePresentInElement(helloWorldOnpushEl, 'Hello Foo!'), 5000);
      });
    });

    describe('(with `ShadowDom` view encapsulation)', () => {
      const helloWorldShadowEl = element(by.css('hello-world-shadow-el'));
      const getShadowDomText = (el: ElementFinder) =>
        browser.executeScript('return arguments[0].shadowRoot.textContent', el);

      it('should display "Hello World!"', function () {
        expect(getShadowDomText(helloWorldShadowEl)).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', function () {
        const input = element(by.css('input[type=text]'));
        input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        browser.wait(async () => await getShadowDomText(helloWorldShadowEl) === 'Hello Foo!', 5000);
      });
    });
  });
});
