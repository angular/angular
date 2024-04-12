import { browser, element, by, logging } from 'protractor';


describe('What is Angular', () => {

  const paragraphs = element.all(by.css('p'));
  const buttons = element.all(by.css('button'));
  const templateButton = buttons.get(1);
  const templateText = paragraphs.get(4);
  const messageButton = buttons.get(0);
  const messageText = paragraphs.get(2);
  const ngIfButton = buttons.get(2);
  const ngIfText = paragraphs.get(5);
  const diButton = buttons.get(3);

  beforeEach(() => browser.get(''));

  // helper function to test what's logged to the console
  async function logChecker(contents: string) {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const messages = logs.filter(({ message }) => message.indexOf(contents) !== -1 ? true : false);
    expect(messages.length).toBeGreaterThan(0);
  }

  it('should display Hello World', async () => {
    expect(await element(by.css('hello-world h2')).getText()).toEqual('Hello World');
  });

  // Test for alert
  it('should display js alert after button click', async () => {
    await messageButton.click();
    const alert = browser.switchTo().alert();
    expect(await alert.getText()).toEqual('Hello, World');
    await alert.accept();
  });

  it('should display blue a sentence', async () => {
    expect(await messageText.getCssValue('color')).toEqual('rgba(0, 0, 255, 1)');
  });

  // Hello World Template section
  it('should add 123 to editable p tag', async () => {
    await templateButton.click();
    await templateText.click();
    await templateText.sendKeys('123');
    expect(await templateText.getText()).toEqual('You can edit me!123');
  });

  // Test for ngIf section
  it('should display edit instructions after button click', async () => {
    await ngIfButton.click();
    expect(await ngIfText.getText()).toEqual('You can edit the following paragraph.');
  });

  // Test for DI section
  it('should log the count', async () => {
    await diButton.click();
    await logChecker('0');
  });

});
