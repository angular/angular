import {By, until, WebElement} from 'selenium-webdriver';
import {getWebDriver, quitWebDriver} from './driver-util';

describe('Element E2E Tests', function () {
  let driver: ReturnType<typeof getWebDriver>;
  const baseUrl = process.env['E2E_BASE_URL'] || 'http://localhost:4205/';

  beforeAll(() => {
    driver = getWebDriver();
  });

  afterAll(async () => {
    await quitWebDriver();
  });

  describe('Hello World Elements', () => {
    beforeEach(async () => {
      await driver.get(baseUrl + 'hello-world.html');
    });

    describe('(with default CD strategy and view encapsulation)', () => {
      it('should display "Hello World!"', async () => {
        const helloWorldEl = await driver.findElement(By.css('hello-world-el'));
        expect(await helloWorldEl.getText()).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', async () => {
        const helloWorldEl = await driver.findElement(By.css('hello-world-el'));
        const input = await driver.findElement(By.css('input[type=text]'));
        await input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        await driver.wait(until.elementTextIs(helloWorldEl, 'Hello Foo!'), 5000);
      });
    });

    describe('(with `OnPush` CD strategy)', () => {
      it('should display "Hello World!"', async () => {
        const helloWorldOnpushEl = await driver.findElement(By.css('hello-world-onpush-el'));
        expect(await helloWorldOnpushEl.getText()).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', async () => {
        const helloWorldOnpushEl = await driver.findElement(By.css('hello-world-onpush-el'));
        const input = await driver.findElement(By.css('input[type=text]'));
        await input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        await driver.wait(until.elementTextIs(helloWorldOnpushEl, 'Hello Foo!'), 5000);
      });
    });

    describe('(with `ShadowDom` view encapsulation)', () => {
      const getShadowDomText = async (el: WebElement) =>
        (await driver.executeScript('return arguments[0].shadowRoot.textContent', el)) as string;

      it('should display "Hello World!"', async () => {
        const helloWorldShadowEl = await driver.findElement(By.css('hello-world-shadow-el'));
        expect(await getShadowDomText(helloWorldShadowEl)).toBe('Hello World!');
      });

      it('should display "Hello Foo!" via name attribute', async () => {
        const helloWorldShadowEl = await driver.findElement(By.css('hello-world-shadow-el'));
        const input = await driver.findElement(By.css('input[type=text]'));
        await input.sendKeys('Foo');

        // Make tests less flaky on CI by waiting up to 5s for the element text to be updated.
        await driver.wait(
          async () => (await getShadowDomText(helloWorldShadowEl)) === 'Hello Foo!',
          5000,
        );
      });
    });
  });
});
