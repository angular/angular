import { browser, element, ExpectedConditions as EC, by } from 'protractor';

browser.waitForAngularEnabled(false);
describe('Element E2E Tests', function () {
  describe('Hello World Elements', () => {
    const helloWorldEl = element(by.css('hello-world-el'));

    beforeEach(() => browser.get('hello-world.html'));

    it('should display "Hello World!"', function () {
      expect(helloWorldEl.getText()).toEqual('Hello World!');
    });

    it('should display "Hello Foo!" via name attribute', function () {
      const input = element(by.css('input[type=text]'));
      input.sendKeys('Foo');

      // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
      browser.wait(EC.textToBePresentInElement(helloWorldEl, 'Hello Foo!'), 5000);
    });
  });
});
