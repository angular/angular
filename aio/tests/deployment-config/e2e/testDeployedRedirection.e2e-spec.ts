import { browser } from 'protractor';

describe(browser.baseUrl, () => {
  const sitemapUrls = browser.params.sitemapUrls;
  const legacyUrls = browser.params.legacyUrls;
  const goTo = async url => {
    // Go to the specified URL and then unregister the ServiceWorker
    // to ensure subsequent requests are passed through to the server.
    await browser.get(url);
    await browser.executeAsyncScript(cb => navigator.serviceWorker
        .getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.unregister())))
        .then(cb));
  };

  beforeAll(async done => {
    // Make an initial request to unregister the ServiceWorker.
    await goTo(browser.baseUrl);
    done();
  });

  beforeEach(() => browser.waitForAngularEnabled(false));
  afterEach(() => browser.waitForAngularEnabled(true));

  describe('(with sitemap URLs)', () => {
    sitemapUrls.forEach((url, i) => {
      it(`should not redirect '${url}' (${i + 1}/${sitemapUrls.length})`, async () => {
        await goTo(url);

        const expectedUrl = browser.baseUrl + url;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });

  describe('(with legacy URLs)', () => {
    legacyUrls.forEach(([fromUrl, toUrl], i) => {
      it(`should redirect '${fromUrl}' to '${toUrl}' (${i + 1}/${legacyUrls.length})`, async () => {
        await goTo(fromUrl);

        const expectedUrl = (/^http/.test(toUrl) ? '' : browser.baseUrl.replace(/\/$/, '')) + toUrl;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });
});
