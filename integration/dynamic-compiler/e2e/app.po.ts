import {browser, by, element, protractor} from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getLazyLoadedText() {
    const el = element(by.css('app-root lazy-component'));
    return browser.wait(protractor.ExpectedConditions.presenceOf(el)).then(() => el.getText(), err => el.getText());
  }
}
