import { getRedirector, loadLegacyUrls, loadLocalSitemapUrls, loadRedirects } from '../shared/helpers';

describe('firebase.json redirect config', () => {
  describe('with sitemap urls', () => {
    loadLocalSitemapUrls().forEach(url => {
      it('should not redirect any urls in the sitemap', () => {
        expect(getRedirector().redirect(url)).toEqual(url);
      });
    });
  });

  describe('with legacy urls', () => {
    loadLegacyUrls().forEach(urlPair => {
      it('should redirect the legacy urls', () => {
        const redirector = getRedirector();
        expect(redirector.redirect(urlPair[0])).not.toEqual(urlPair[0]);
        if (urlPair[1]) {
          expect(redirector.redirect(urlPair[0])).toEqual(urlPair[1]);
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
