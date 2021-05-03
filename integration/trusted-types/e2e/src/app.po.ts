import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  async switchToIframe(): Promise<unknown> {
    return browser.switchTo().frame(await element(by.id('trusted-types-iframe')).getWebElement());
  }

  async switchToObject(): Promise<unknown> {
    return browser.switchTo().frame(await element(by.id('trusted-types-object')).getWebElement());
  }

  async switchToEmbed(): Promise<unknown> {
    return browser.switchTo().frame(await element(by.id('trusted-types-embed')).getWebElement());
  }

  async getTitleText(): Promise<string> {
    return element(by.css('app-root .content span')).getText();
  }

  async getBoundHtmlText(): Promise<string> {
    return element(by.css('#bound-html span')).getText();
  }

  async getBoundSafeHtmlText(): Promise<string> {
    return element(by.css('#bound-safehtml span')).getText();
  }

  async getOuterHTMLText(): Promise<string> {
    return element(by.id('outerhtml')).getText();
  }

  async boundHtmlIframeIsPresent(): Promise<boolean> {
    return element(by.id('bound-html-iframe')).isPresent();
  }

  async boundSafeHtmlIframeIsPresent(): Promise<boolean> {
    return element(by.id('bound-safehtml-iframe')).isPresent();
  }

  async getHeaderText(): Promise<string> {
    return element(by.css('h1')).getText();
  }
}
