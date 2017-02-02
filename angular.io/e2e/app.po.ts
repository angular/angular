import { browser, element, by } from 'protractor';

export class SitePage {

  featureLink = element(by.css('md-toolbar a[aioNavLink=features]'));

  navigateTo() {
    return browser.get('/');
  }

  getDocViewerText() {
    return element(by.css('aio-doc-viewer')).getText();
  }
}
