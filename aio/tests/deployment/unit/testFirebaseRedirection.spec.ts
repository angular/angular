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

  it('should not redirect disambiguated URLs', () => {
    const redirector = getRedirector();

    // Disambiguated URL.
    const url1 = '/api/core/Foo-0';
    expect(redirector.redirect(url1)).toBe(url1);

    // Disambiguated URL.
    const url2 = '/api/core/BAR-1337';
    expect(redirector.redirect(url2)).toBe(url2);

    // Non-disambiguated URL with dash.
    const url3 = '/api/core/baz-class';
    expect(redirector.redirect(url3)).toBe('/api/core/baz');
  });
});
