import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo() {
    await browser.get(global['protractorBaseUrl']);
    return browser.waitForAngular();
  }

  async waitForElement(el, timeout = 10000) {
    await browser.wait(() => el.isPresent(), timeout);
    await browser.wait(() => el.isDisplayed(), timeout);
    return el;
  }

  async waitForAngular() {
    return browser.waitForAngular();
  }

  async getParagraphText() {
    return (await this.waitForElement(element(by.css('div#greeting')))).getText();
  }

  async clearInput() {
    return (await this.waitForElement(element(by.css('input')))).clear();
  }

  async typeInInput(s: string) {
    return (await this.waitForElement(element(by.css('input')))).sendKeys(s);
  }
}
