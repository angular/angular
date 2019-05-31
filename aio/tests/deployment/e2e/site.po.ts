import { browser, by, element, ExpectedConditions } from 'protractor';

export class SitePage {
  /** The base URL with the trailing `/` stripped off (if any). */
  baseUrl = browser.baseUrl.replace(/\/$/, '');

  /** All URLs found in the app's `sitemap.xml` (i.e. valid URLs tha should not be redirected). */
  sitemapUrls: string[] = browser.params.sitemapUrls;

  /** A list of legacy URLs that should be redirected to new URLs (in the form `[fromUrl, toUrl]`). */
  legacyUrls: string[][] = browser.params.legacyUrls;

  /**
   * Enter a query into the search field.
   */
  async enterSearch(query: string) {
    const searchInput = element(by.css('input[type=search]'));
    await searchInput.clear();
    await searchInput.sendKeys(query);
  }

  /**
   * Get the text content of the `aio-doc-viewer` element (in lowercase).
   */
  async getDocViewerText() {
    const docViewer = element(by.css('aio-doc-viewer'));
    const text = await docViewer.getText();
    return text.toLowerCase();
  }

  /**
   * Get a list of text contents for all search result items found on the page.
   */
  async getSearchResults() {
    const results = element.all(by.css('.search-results li'));
    await browser.wait(ExpectedConditions.presenceOf(results.first()), 8000);
    return await results.map<string>(link => link!.getText());
  }

  /**
   * Navigate to a URL, disable animations, wait for Angular and unregister the ServiceWorker.
   * (The SW is unregistered to ensure that subsequent requests are passed through to the server.)
   */
  async goTo(url: string) {
    await browser.get(url || this.baseUrl);
    await browser.executeScript('document.body.classList.add(\'no-animations\')');
    await browser.waitForAngular();
    await this.unregisterSw();
  }

  /**
   * Initialize the page object and get it ready for further requests.
   */
  async init() {
    // Make an initial request to unregister the ServiceWorker.
    await this.goTo('');
  }

  /**
   * Unregister the ServiceWorker (if registered).
   */
  async unregisterSw() {
    const unregisterSwFn = (cb: () => void) => navigator.serviceWorker
        .getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.unregister())))
        .then(cb);

    await browser.executeAsyncScript(unregisterSwFn);
  }
}
