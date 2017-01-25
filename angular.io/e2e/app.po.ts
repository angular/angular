import { browser, element, by } from 'protractor';

export class SitePage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-home-page p')).getText();
  }
}
