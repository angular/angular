import {
  getRedirector, loadLegacyUrls, loadLocalSitemapUrls, loadRedirects, PATH_TO_LEGACY_URLS,
} from '../shared/helpers';

describe('firebase.json redirect config', () => {
  describe('with sitemap urls', () => {
    const redirector = getRedirector();

    loadLocalSitemapUrls().forEach(url => {
      it(`should not redirect sitemap URL '${url}'`, () => {
        expect(redirector.redirect(url)).toEqual(url);
      });
    });
  });

  describe('with legacy urls', () => {
    const redirector = getRedirector();

    afterAll(() => {
      expect(redirector.unusedRedirectConfigs)
          .withContext(
              'Some redirect rules from \'firebase.json\' were not tested. ' +
              `Ensure there is at least one testcase for each redirect rule in '${PATH_TO_LEGACY_URLS}'.`)
          .toEqual([]);
    });

    loadLegacyUrls().forEach(urlPair => {
      it(`should redirect legacy URL '${urlPair[0]}'`, () => {
        const redirected = redirector.redirect(urlPair[0]);

        expect(redirected).not.toEqual(urlPair[0]);
        if (urlPair[1]) {
          expect(redirected).toEqual(urlPair[1]);
        }
      });
    });
  });

  describe('destinations', () => {
    loadRedirects().forEach(redirect => {
      it('should match pattern "^(https?:/)?/.*"', () => {
        expect(redirect.destination).toMatch(/^(https?:\/)?\/.*/);
      });
    });
  });
});
