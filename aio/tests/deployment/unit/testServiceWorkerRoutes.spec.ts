import { getSwNavigationUrlChecker, loadLegacyUrls, loadLocalSitemapUrls } from '../shared/helpers';

describe('ServiceWorker navigation URLs', () => {
  const isNavigationUrl = getSwNavigationUrlChecker();

  loadLocalSitemapUrls().forEach(url => {
    it('should treat URLs in the Sitemap as navigation URLs', () => {
      expect(isNavigationUrl(url)).toBeTruthy(url);
    });
  });

  loadLegacyUrls().forEach(urlPair => {
    const url = urlPair[0];
    it('should treat legacy URLs that will be redirected as non-navigation URLs', () => {
      expect(isNavigationUrl(url)).toBeFalsy(url);
    });
  });

  it('should treat StackBlitz URLs as non-navigation URLs', () => {
    expect(isNavigationUrl('/generated/live-examples/toh-pt6/stackblitz.html')).toBeFalsy();
    expect(isNavigationUrl('/generated/live-examples/toh-pt6/stackblitz')).toBeFalsy();
  });

  it('should treat URLs to files with extensions as non-navigation URLs', () => {
    expect(isNavigationUrl('/generated/zips/animations/animations.zip')).toBeFalsy();
    expect(isNavigationUrl('/generated/images/guide/animations/animation_auto.gif')).toBeFalsy();
    expect(isNavigationUrl('/generated/ngsw-worker.js')).toBeFalsy();
    expect(isNavigationUrl('/generated/docs/guide/animations.json')).toBeFalsy();
  });

  it('should treat `/docs/*` URLs correctly', () => {
    const navigationUrls = ['/docs', '/docs/'];
    const nonNavigationUrls = [
      '/docs/js/latest',
      '/docs/ts/latest/foo',
      '/docs/latest/foo/bar',
      '/docs/styleguide',
      '/docs/styleguide/',
    ];

    navigationUrls.forEach(url => expect(isNavigationUrl(url)).toBeTruthy(url));
    nonNavigationUrls.forEach(url => expect(isNavigationUrl(url)).toBeFalsy(url));
  });
});
