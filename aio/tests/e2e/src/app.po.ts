import { browser, element, by, ElementFinder, ExpectedConditions } from 'protractor';

const githubRegex = /https:\/\/github.com\/angular\/angular\//;

export class SitePage {

  links = element.all(by.css('md-toolbar a'));
  homeLink = element(by.css('a.home'));
  docsMenuLink = element(by.cssContainingText('aio-top-menu a', 'Docs'));
  sidenav = element(by.css('mat-sidenav'));
  docViewer = element(by.css('aio-doc-viewer'));
  cookiesPopup = element(by.css('.cookies-popup'));
  codeExample = element.all(by.css('aio-doc-viewer pre > code'));
  ghLinks = this.docViewer
    .all(by.css('a'))
    .filter(async a => githubRegex.test(await a.getAttribute('href')));

  static async setWindowWidth(newWidth: number) {
    const win = browser.driver.manage().window();
    const oldSize = await win.getSize();
    await win.setSize(newWidth, oldSize.height);
  }

  getNavItem(pattern: RegExp) {
    return element.all(by.css('aio-nav-item .vertical-menu-item'))
                  .filter(async elementFinder => pattern.test(await elementFinder.getText()))
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
  getTopMenuLink(path: string) { return element(by.css(`aio-top-menu a[href="${path}"]`)); }

  legacyGa() { return browser.executeScript<any[][]>('return window["ga"].q'); }
  gtagQueue() { return browser.executeScript<any[][]>('return window["dataLayer"]'); }

  locationPath() { return browser.executeScript<string>('return document.location.pathname'); }

  async navigateTo(pageUrl: string, keepCookiesPopup = false) {
    // Navigate to the page, disable animations, potentially hide the cookies popup, and wait for
    // Angular.
    await browser.get(`/${pageUrl.replace(/^\//, '')}`);
    await browser.executeScript('document.body.classList.add(\'no-animations\')');
    if (!keepCookiesPopup) {
      // Hide the cookies popup to prevent it from obscuring other elements.
      await browser.executeScript('arguments[0].remove()', this.cookiesPopup);
    }
    await browser.waitForAngular();
  }

  getDocViewerText() {
    return this.docViewer.getText();
  }

  getInnerHtml(elementFinder: ElementFinder) {
    // `getInnerHtml` was removed from webDriver and this is the workaround.
    // See https://github.com/angular/protractor/blob/master/CHANGELOG.md#breaking-changes
    return browser.executeScript('return arguments[0].innerHTML;', elementFinder);
  }

  getScrollTop() {
    return browser.executeScript('return window.pageYOffset');
  }

  scrollTo(y: 'top' | 'bottom' | number) {
    const yExpr = (y === 'top') ? '0' : (y === 'bottom') ? 'document.body.scrollHeight' : y;

    return browser.executeScript(`
      window.scrollTo(0, ${yExpr});
      window.dispatchEvent(new Event('scroll'));
    `);
  }

  async click(elementFinder: ElementFinder) {
    await elementFinder.click();
    await browser.waitForAngular();
  }

  async enterSearch(query: string) {
    const input = element(by.css('.search-container input[type=search]'));
    await input.clear();
    await input.sendKeys(query);
  }

  async getSearchResults() {
    const results = element.all(by.css('.search-results li'));
    await browser.wait(ExpectedConditions.presenceOf(results.first()), 8000);
    return results.map(link => link?.getText());
  }

  async getApiSearchResults() {
    const results = element.all(by.css('aio-api-list .api-item'));
    await browser.wait(ExpectedConditions.presenceOf(results.first()), 2000);
    return results.map(elem => elem?.getText());
  }

  async clickDropdownItem(dropdown: ElementFinder, itemName: string){
    await dropdown.element(by.css('.form-select-button')).click();
    const menuItem = dropdown.element(by.cssContainingText('.form-select-dropdown li', itemName));
    await menuItem.click();
  }
}
