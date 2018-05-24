import { browser, by, element } from 'protractor';
import { SitePage } from './site.po';

describe(browser.baseUrl, () => {
  const page = new SitePage();
  const getCurrentUrl = async () => (await browser.getCurrentUrl()).replace(/\?.*$/, '');
  const prependBaseUrl = (url: string) => browser.baseUrl.replace(/\/$/, '') + url;

  beforeAll(done => page.init().then(done));

  beforeEach(() => browser.waitForAngularEnabled(false));
  afterEach(() => browser.waitForAngularEnabled(true));

  describe('(with sitemap URLs)', () => {
    page.sitemapUrls.forEach((url, i) => {
      it(`should not redirect '${url}' (${i + 1}/${page.sitemapUrls.length})`, async () => {
        await page.goTo(url);

        const expectedUrl = prependBaseUrl(url);
        const actualUrl = await getCurrentUrl();

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });

  describe('(with legacy URLs)', () => {
    page.legacyUrls.forEach(([fromUrl, toUrl], i) => {
      it(`should redirect '${fromUrl}' to '${toUrl}' (${i + 1}/${page.legacyUrls.length})`, async () => {
        await page.goTo(fromUrl);

        const expectedUrl = /^http/.test(toUrl) ? toUrl : prependBaseUrl(toUrl);
        const actualUrl = await getCurrentUrl();

        expect(actualUrl).toBe(expectedUrl);
      });
    });
  });

  describe('(with unknown URLs)', () => {
    const unknownPageUrl = '/unknown/page';
    const unknownResourceUrl = '/unknown/resource.ext';

    it('should serve `index.html` for unknown pages', async () => {
      const aioShell = element(by.css('aio-shell'));
      const heading = aioShell.element(by.css('h1'));
      await page.goTo(unknownPageUrl);

      expect(aioShell.isPresent()).toBe(true);
      expect(heading.getText()).toMatch(/page not found/i);
    });

    it('should serve a custom 404 page for unknown resources', async () => {
      const aioShell = element(by.css('aio-shell'));
      const heading = aioShell.element(by.css('h1'));
      await page.goTo(unknownResourceUrl);

      expect(aioShell.isPresent()).toBe(true);
      expect(heading.getText()).toMatch(/resource not found/i);
    });

    it('should include a link to the home page in custom 404 page', async () => {
      const homeNavLink = element(by.css('.nav-link.home'));
      await page.goTo(unknownResourceUrl);

      expect(homeNavLink.isPresent()).toBe(true);

      await homeNavLink.click();
      const expectedUrl = browser.baseUrl;
      const actualUrl = await browser.getCurrentUrl();

      expect(actualUrl).toBe(expectedUrl);
    });
  });
});
