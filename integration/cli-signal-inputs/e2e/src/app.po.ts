import {browser, by, element} from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getGreetText() {
    return element(by.css('.greet-text')).getText() as Promise<string>;
  }

  getUnboundLastNameGreetText() {
    return element(by.css('.unbound-last-name .greet-text')).getText() as Promise<string>;
  }

  setLastName() {
    return element(by.css('.set-last-name-btn')).click();
  }

  unsetLastName() {
    return element(by.css('.unset-last-name-btn')).click();
  }

  getGreetCount() {
    return element(by.id('greet-count')).getText() as Promise<string>;
  }
}
