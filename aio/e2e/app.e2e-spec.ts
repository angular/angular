import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
    page.navigateTo();
  });

  it('should show features text after clicking "Features"', () => {
    page.featureLink.click().then(() => {
      expect(page.getDocViewerText()).toContain('Progressive web apps');
    });
  });

  it('should convert a doc with a code-example');
});
