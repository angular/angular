import { browser } from 'protractor';

describe(browser.baseUrl, () => {
  const sitemapUrls = browser.params.sitemapUrls;
  const legacyUrls = browser.params.legacyUrls;

  beforeEach(async (done) => {
    // Unregister the ServiceWorker to ensure requests are passed through to the server.
    await browser.get(browser.baseUrl);
    await browser.executeAsyncScript(cb => navigator.serviceWorker
        .getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.unregister())))
        .then(cb));

    browser.waitForAngularEnabled(false);
    done();
  });

  afterEach(() => browser.waitForAngularEnabled(true));

  describe('(with sitemap URLs)', () => {
    sitemapUrls.forEach((url, i) => {
      it(`should not redirect '${url}' (${i + 1}/${sitemapUrls.length})`, async () => {
        browser.get(url);

        const expectedUrl = browser.baseUrl + url;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });

  describe('(with legacy URLs)', () => {
    legacyUrls.forEach(([fromUrl, toUrl], i) => {
      it(`should redirect '${fromUrl}' to '${toUrl}' (${i + 1}/${legacyUrls.length})`, async () => {
        browser.get(fromUrl);

        const expectedUrl = (/^http/.test(toUrl) ? '' : browser.baseUrl.replace(/\/$/, '')) + toUrl;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });
});
