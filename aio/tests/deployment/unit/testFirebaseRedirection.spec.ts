import { getRedirector, loadLegacyUrls, loadLocalSitemapUrls, loadRedirects } from '../shared/helpers';

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

    loadLegacyUrls().forEach(urlPair => {
      it(`should redirect legacy URL '${urlPair[0]}'`, () => {
        const redirected = redirector.redirect(urlPair[0]);

        expect(redirected).not.toEqual(urlPair[0]);
        if (urlPair[1]) {
          expect(redirected).toEqual(urlPair[1]);
        }
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
});
