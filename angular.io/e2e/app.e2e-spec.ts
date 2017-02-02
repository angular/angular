import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
  });

  it('should show features text after clicking "Features"', () => {
    page.navigateTo();
    page.featureLink.click().then(() => {
      expect(page.getDocViewerText()).toContain('Progressive web apps');
    });
  });
});
