import { browser, element, by, promise, ElementFinder } from 'protractor';

const githubRegex = /https:\/\/github.com\/angular\/angular\//;

export class SitePage {
  links = element.all(by.css('md-toolbar a'));
  docViewer = element(by.css('aio-doc-viewer'));
  codeExample = element.all(by.css('aio-doc-viewer pre > code'));
  ghLink = this.docViewer
    .all(by.css('a'))
    .filter((a: ElementFinder) => a.getAttribute('href').then(href => githubRegex.test(href)))
    .first();
  featureLink = element(by.css('md-toolbar a[href="features"]'));
  gaReady: promise.Promise<any>;
  ga = () => browser.executeScript('return window["gaCalls"]') as promise.Promise<any[][]>;
  locationPath = () => browser.executeScript('return document.location.pathname') as promise.Promise<string>;

  navigateTo(pageUrl = '') {
    return browser.get('/' + pageUrl).then(_ => this.replaceGa(_));
  }

  getDocViewerText() {
    return this.docViewer.getText();
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

