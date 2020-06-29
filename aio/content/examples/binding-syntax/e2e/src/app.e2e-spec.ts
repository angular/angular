import { browser, element, by } from 'protractor';
import { logging } from 'selenium-webdriver';

describe('Binding syntax e2e tests', () => {

  beforeEach(function () {
    browser.get('');
  });


    // helper function used to test what's logged to the console
    async function logChecker(button, contents) {
      const logs = await browser.manage().logs().get(logging.Type.BROWSER);
      const message = logs.filter(({ message }) => message.indexOf(contents) !== -1 ? true : false);
      expect(message.length).toBeGreaterThan(0);
    }


  it('should display Binding syntax', function () {
    expect(element(by.css('h1')).getText()).toEqual('Binding syntax');
  });

  it('should display Save button', function () {
    expect(element.all(by.css('button')).get(0).getText()).toBe('Save');
  });

  it('should display HTML attributes and DOM properties', function () {
    expect(element.all(by.css('h2')).get(1).getText()).toBe('HTML attributes and DOM properties');
  });

  it('should display 1. Use the inspector...', function () {
    expect(element.all(by.css('p')).get(0).getText()).toContain('1. Use the inspector');
  });

  it('should display Disabled property vs. attribute', function () {
    expect(element.all(by.css('h3')).get(0).getText()).toBe('Disabled property vs. attribute');
  });


  it('should log a message including Sarah', async () => {
    let attributeButton = element.all(by.css('button')).get(1);
    await attributeButton.click();
    const contents = 'Sarah';
    logChecker(attributeButton, contents);
  });

  it('should log a message including Sarah for DOM property', async () => {
    let DOMPropertyButton = element.all(by.css('button')).get(2);
    await DOMPropertyButton.click();
    const contents = 'Sarah';
    logChecker(DOMPropertyButton, contents);
  });

  it('should log a message including Sally for DOM property', async () => {
    let DOMPropertyButton = element.all(by.css('button')).get(2);
    let input = element(by.css('input'));
    input.sendKeys('Sally');
    await DOMPropertyButton.click();
    const contents = 'Sally';
    logChecker(DOMPropertyButton, contents);
  });

  it('should log a message that Test Button works', async () => {
    let testButton = element.all(by.css('button')).get(3);
    await testButton.click();
    const contents = 'Test';
    logChecker(testButton, contents);
  });

  it('should toggle Test Button disabled', async () => {
    let toggleButton = element.all(by.css('button')).get(4);
    await toggleButton.click();
    const contents = 'true';
    logChecker(toggleButton, contents);
  });
});
