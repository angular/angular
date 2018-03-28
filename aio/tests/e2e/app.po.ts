import { browser, element, by, promise, ElementFinder, ExpectedConditions } from 'protractor';

const githubRegex = /https:\/\/github.com\/angular\/angular\//;

export class SitePage {

  links = element.all(by.css('md-toolbar a'));
  homeLink = element(by.css('a.home'));
  docsMenuLink = element(by.cssContainingText('aio-top-menu a', 'Docs'));
  sidenav = element(by.css('mat-sidenav'));
  docViewer = element(by.css('aio-doc-viewer'));
  codeExample = element.all(by.css('aio-doc-viewer pre > code'));
  ghLinks = this.docViewer
    .all(by.css('a'))
    .filter((a: ElementFinder) => a.getAttribute('href').then(href => githubRegex.test(href)));

  static setWindowWidth(newWidth: number) {
    const win = browser.driver.manage().window();
    return win.getSize().then(oldSize => win.setSize(newWidth, oldSize.height));
  }

  getNavItem(pattern: RegExp) {
    return element.all(by.css('aio-nav-item .vertical-menu-item'))
                  .filter(element => element.getText().then(text => pattern.test(text)))
                  .first();
  }
  getNavItemHeadings(parent: ElementFinder, level: number) {
    const targetSelector = `aio-nav-item .vertical-menu-item.heading.level-${level}`;
    return parent.all(by.css(targetSelector));
  }
  getNavItemHeadingChildren(heading: ElementFinder, level: number) {
    const targetSelector = `.heading-children.level-${level}`;
    const script = `return arguments[0].parentNode.querySelector('${targetSelector}');`;
    return element(() => browser.executeScript(script, heading));
  }
  getTopMenuLink(path) { return element(by.css(`aio-top-menu a[href="${path}"]`)); }

  ga() { return browser.executeScript('return window["ga"].q') as promise.Promise<any[][]>; }
  locationPath() { return browser.executeScript('return document.location.pathname') as promise.Promise<string>; }

  navigateTo(pageUrl) {
    // Navigate to the page, disable animations, and wait for Angular.
    return browser.get('/' + pageUrl)
        .then(() => browser.executeScript('document.body.classList.add(\'no-animations\')'))
        .then(() => browser.waitForAngular());
  }

  getDocViewerText() {
    return this.docViewer.getText();
  }

  getInnerHtml(element) {
    // `getInnerHtml` was removed from webDriver and this is the workaround.
    // See https://github.com/angular/protractor/blob/master/CHANGELOG.md#breaking-changes
    return browser.executeScript('return arguments[0].innerHTML;', element);
  }

  getScrollTop() {
    return browser.executeScript('return window.pageYOffset');
  }

  scrollToBottom() {
    return browser.executeScript('window.scrollTo(0, document.body.scrollHeight)');
  }

  click(element: ElementFinder) {
    return element.click().then(() => browser.waitForAngular());
  }

  enterSearch(query: string) {
    const input = element(by.css('.search-container input[type=search]'));
    input.clear();
    input.sendKeys(query);
  }

  getSearchResults() {
    const results = element.all(by.css('.search-results li'));
    browser.wait(ExpectedConditions.presenceOf(results.first()), 8000);
    return results.map(link => link && link.getText());
  }
}
