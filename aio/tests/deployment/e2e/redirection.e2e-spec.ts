import { browser } from 'protractor';
import { SitePage } from './site.po';

describe(browser.baseUrl, () => {
  const page = new SitePage();

  beforeAll(done => page.init().then(done));

  beforeEach(() => browser.waitForAngularEnabled(false));
  afterEach(() => browser.waitForAngularEnabled(true));

  describe('(with sitemap URLs)', () => {
    page.sitemapUrls.forEach((url, i) => {
      it(`should not redirect '${url}' (${i + 1}/${page.sitemapUrls.length})`, async () => {
        await page.goTo(url);

        const expectedUrl = browser.baseUrl + url;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });

  describe('(with legacy URLs)', () => {
    page.legacyUrls.forEach(([fromUrl, toUrl], i) => {
      it(`should redirect '${fromUrl}' to '${toUrl}' (${i + 1}/${page.legacyUrls.length})`, async () => {
        await page.goTo(fromUrl);

        const expectedUrl = (/^http/.test(toUrl) ? '' : browser.baseUrl.replace(/\/$/, '')) + toUrl;
        const actualUrl = (await browser.getCurrentUrl()).replace(/\?.*$/, '');

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });
});
