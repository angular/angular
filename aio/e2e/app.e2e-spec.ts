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

  it('should convert code-example in pipe.html', () => {
    page.datePipeLink.click().then(() => {
      expect(page.codeExample.count()).toBeGreaterThan(0, 'should have code-example content');
    });
  });
});
