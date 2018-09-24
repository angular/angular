import { browser, element, by } from 'protractor';

browser.waitForAngularEnabled(false);
describe('Element E2E Tests', function () {
  describe('Hello World Elements', () => {
    it('should display: Hello world!', function () {
      browser.get('hello-world.html');
      const helloWorldEl = element(by.css('hello-world-el'));
      expect(helloWorldEl.getText()).toEqual('Hello World!');
    });

    it('should display: Hello Foo! via name attribute', function () {
      browser.get('hello-world.html');
      const helloWorldEl = element(by.css('hello-world-el'));
      const input = element(by.css('input[type=text]'));
      ['f', 'o', 'o'].forEach((key) => input.sendKeys(key));
      expect(helloWorldEl.getText()).toEqual('Hello foo!');
    });
  });
});
