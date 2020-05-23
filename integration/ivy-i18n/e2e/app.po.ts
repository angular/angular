import {browser, by, element} from 'protractor';

export class AppPage {
  navigateTo() { return browser.get('/'); }

  getHeading() { return element(by.css('app-root h1')).getText(); }

  getParagraph(name: string) { return element(by.css('app-root p#' + name)).getText(); }
}
