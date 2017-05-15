import { browser, element, by, promise, ElementFinder } from 'protractor';

const githubRegex = /https:\/\/github.com\/angular\/angular\//;

export class SitePage {

  links = element.all(by.css('md-toolbar a'));
  docsMenuLink = element(by.cssContainingText('aio-top-menu a', 'Docs'));
  docViewer = element(by.css('aio-doc-viewer'));
  codeExample = element.all(by.css('aio-doc-viewer pre > code'));
  ghLink = this.docViewer
    .all(by.css('a'))
    .filter((a: ElementFinder) => a.getAttribute('href').then(href => githubRegex.test(href)))
    .first();
  gaReady: promise.Promise<any>;

  static setWindowWidth(newWidth: number) {
    const win = browser.driver.manage().window();
    return win.getSize().then(oldSize => win.setSize(newWidth, oldSize.height));
  }

  getNavItem(pattern: RegExp) {
    return element.all(by.css('aio-nav-item .vertical-menu-item'))
                  .filter(element => element.getText().then(text => pattern.test(text)))
                  .first();
  }
  getLink(path) { return element(by.css(`a[href="${path}"]`)); }
  ga() { return browser.executeScript('return window["gaCalls"]') as promise.Promise<any[][]>; }
  locationPath() { return browser.executeScript('return document.location.pathname') as promise.Promise<string>; }

  navigateTo(pageUrl = '') {
    return browser.get('/' + pageUrl).then(_ => this.replaceGa(_));
  }

  getDocViewerText() {
    return this.docViewer.getText();
  }

  getInnerHtml(element) {
    // `getInnerHtml` was removed from webDriver and this is the workaround.
    // See https://github.com/angular/protractor/blob/master/CHANGELOG.md#breaking-changes
    return browser.executeScript('return arguments[0].innerHTML;', element);
  }

  /**
   * Replace the ambient Google Analytics tracker with homebrew spy
   * don't send commands to GA during e2e testing!
   * @param _ - forward's anything passed in
   */
  private replaceGa(_: any) {

    this.gaReady = browser.driver.executeScript(() => {
      // Give ga() a "ready" callback:
      // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference
      window['ga'](() => {
        window['gaCalls'] = [];
        window['ga'] = function() { window['gaCalls'].push(arguments); };
      });

    })
    .then(() => {
      // wait for GaService to start using window.ga after analytics lib loads.
      const d =  promise.defer();
      setTimeout(() => d.fulfill(), 1000); // GaService.initializeDelay
      return d.promise;
    });

    return _;
  }
}

